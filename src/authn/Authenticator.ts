import { Jose } from "jose-jwe-jws";
import oidcTokenHash from "oidc-token-hash";

import { AccessTokenResponse } from "./AccessTokenResponse";
import { Authentication } from "./Authentication";
import { generateRandomString } from "./random";
import { IdTokenFields } from "./userinfo";

import _debug from "debug";
const debug = _debug("Authenticator");

/**
 * Response of start login operation.
 */
export interface StartLoginResponse {
  /**
   * URL where the browser must be directed for starting the authentication process.
   */
  url: URL;

  /**
   * PKCE code verifier for securing the authentication process.
   */
  codeVerifier: string;

  /**
   * OpenID Connect nonce used for securing the authentication process.
   */
  nonce: string;

  /**
   * Nonce issued timestamp.
   */
  nonceIssuedAt: number;
}

/**
 * Response of start logout operation.
 */
export interface StartLogoutResponse {
  /**
   * URL where the browser must be directed for starting the logout process.
   */
  url: URL;
}

/**
 * Response for handling a logout request received from the identity provider.
 */
export interface HandleLogoutRequestResponse {
  /**
   * URL where the browser must be directed for continuing the single sign-out process.
   */
  url: URL;
}

/**
 * Authentication error.
 */
export class AuthenticationError extends Error {
  public error: string;
  public error_description?: string;
  public error_uri?: string;

  public constructor(
    error: string,
    error_description?: string,
    error_uri?: string
  ) {
    super(error_description || error);
    this.error = error;
    this.error_description = error_description;
    this.error_uri = error_uri;
  }
}

/**
 * Authenticator for handling client authentication against 10Duke server
 * using OpenID Connect Authorization Code Grant flow with PKCE.
 */
export class Authenticator {
  /**
   * Default OAuth / OpenID Connect scope.
   */
  public static readonly DEFAULT_SCOPE = "openid profile email";

  /**
   * Stored nonce expiration in seconds.
   */
  public static readonly NONCE_EXPIRES_IN = 300;

  /**
   * ID token must not be issued in the future, but allow some leeway when checking iat.
   * Leeway in seconds.
   */
  public static readonly ID_TOKEN_IAT_LEEWAY = 5;

  private authnUri: URL;
  private tokenUri: URL;
  private sloUri: URL;
  private jwskUri: URL;
  private redirectUri: URL;
  private clientId: string;
  private scope: string;

  /**
   * Initializes a new instance of the authenticator.
   * @param authnUri URL of identity provider endpoint for authentication.
   * @param tokenUri URL of identity provider endpoint for access token requests.
   * @param sloUri URL of identity provider endpoint for single logout (with 10Duke custom SLO protocol).
   * @param jwksUri URL of identity provider endpoint for JWKS key service.
   * @param clientId OAuth client id used by this application when communicating with the IdP.
   * @param redirectUri OAuth redirect_uri for redirecting back to this application from the IdP.
   */
  public constructor(
    authnUri: URL,
    tokenUri: URL,
    sloUri: URL,
    jwksUri: URL,
    clientId: string,
    redirectUri: URL,
    scope: string = Authenticator.DEFAULT_SCOPE
  ) {
    this.authnUri = authnUri;
    this.tokenUri = tokenUri;
    this.sloUri = sloUri;
    this.jwskUri = jwksUri;
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    this.scope = scope;
  }

  /**
   * Builds URL and state for starting authentication process against the OpenID Connect identity provider.
   * @param state Opaque state to carry through the authentication. The state is delivered as a parameter
   * with the request sent to the identity provider for starting authentication, and the identity provider
   * sends the state back when eventually returning to the redirect URI of this application.
   */
  public async startLogin(state?: string): Promise<StartLoginResponse> {
    const codeVerifier = Array.apply(0, Array(64))
      .map(function () {
        return (function (charset) {
          return charset.charAt(Math.floor(Math.random() * charset.length));
        })(
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
        );
      })
      .join("");
    const codeVerifierHash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(codeVerifier)
    );
    const codeChallenge = btoa(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      String.fromCharCode.apply(null, new Uint8Array(codeVerifierHash) as any)
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    const nonce = generateRandomString(10);
    const nonceIssuedAt = new Date();
    const authnUrl = this.buildAuthenticationRequestUrl(
      codeChallenge,
      "S256",
      nonce,
      state
    );

    return {
      url: authnUrl,
      nonce,
      nonceIssuedAt: nonceIssuedAt.getTime(),
      codeVerifier,
    };
  }

  /**
   * Completes authentication by exchanging authorization code to access token and ID token
   * @param startLoginResponse Initial state built when starting the authentication flow.
   * @param code Authorization code received from the server.
   * @param state Opaque state carried through the authentication process.
   */
  public async completeAuthentication(
    startLoginResponse: StartLoginResponse,
    code: string,
    state?: string
  ): Promise<Authentication> {
    // Don't send the access token request if OpenID Connect nonce has already expired
    this.ensureNonceIsValid(startLoginResponse);

    const formParams = new URLSearchParams();
    formParams.append("grant_type", "authorization_code");
    formParams.append("client_id", this.clientId);
    formParams.append("code", code);
    formParams.append("redirect_uri", this.redirectUri.toString());
    formParams.append("code_verifier", startLoginResponse.codeVerifier);
    const response = await fetch(this.tokenUri.toString(), {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formParams.toString(),
    });

    const responseJson = (await response.json()) as AccessTokenResponse;
    const idToken = await this.parseAndValidateIdToken(
      responseJson.id_token,
      startLoginResponse
    );
    this.validateAccessTokenHash(responseJson.access_token, idToken);

    return new Authentication(responseJson, idToken, state);
  }

  /**
   * Builds URL and state for starting single logout process against the identity provider.
   * @param state Opaque state to carry through the authentication. The state is delivered as a parameter
   * with the request sent to the identity provider for starting authentication, and the identity provider
   * sends the state back when eventually returning to the redirect URI of this application.
   */
  public async startLogout(state?: string): Promise<StartLogoutResponse> {
    const logoutUrl = this.buildIdpLogoutUrl(state);
    return {
      url: logoutUrl,
    };
  }

  /**
   * Builds URL for responding to a single sign-out request received from the identity provider.
   * @param state Opaque state to carry through the authentication. The state is delivered as a parameter
   * with the request sent to the identity provider for starting authentication, and the identity provider
   * sends the state back when eventually returning to the redirect URI of this application.
   */
  public async handleLogoutRequest(
    state?: string
  ): Promise<HandleLogoutRequestResponse> {
    const logoutResponseUrl = this.buildLogoutResponseToIdpUrl(state);
    return {
      url: logoutResponseUrl,
    };
  }

  /**
   * Validates access token hash.
   * @param accessToken OAuth access token received from the server.
   * @param idToken ID token received from the server.
   */
  private validateAccessTokenHash(
    accessToken: string,
    idToken: IdTokenFields
  ): void {
    const expectedHash = oidcTokenHash.generate(accessToken, "RS256");
    if (expectedHash !== idToken.at_hash) {
      throw new AuthenticationError(
        "invalid_access_token",
        "at_hash does not match"
      );
    }
  }

  /**
   * Parses and validates OpenID Connect ID token received from the server in access token response.
   * @param idToken ID token as JWT
   * @param startLoginResponse Initial state built when starting the authentication flow.
   */
  private async parseAndValidateIdToken(
    idToken: string,
    startLoginResponse: StartLoginResponse
  ): Promise<IdTokenFields> {
    const verificationResult = await this.verifyIdToken(idToken);
    const idTokenFields = JSON.parse(
      verificationResult.payload
    ) as IdTokenFields;

    if (startLoginResponse.nonce !== idTokenFields.nonce) {
      throw new AuthenticationError(
        "nonce_mismatch",
        "invalid nonce in ID token received from the server"
      );
    }
    const expectedIssuer = this.getIdpIssuerId();
    if (idTokenFields.iss !== expectedIssuer) {
      throw new AuthenticationError(
        "invalid_id_token",
        `invalid iss, got ${idTokenFields.iss}, expected ${expectedIssuer}`
      );
    }
    if (idTokenFields.aud !== this.clientId) {
      throw new AuthenticationError(
        "invalid_id_token",
        `invalid aud, got ${idTokenFields.aud}, expected ${this.clientId}`
      );
    }
    const epochSecsNow = Math.floor(new Date().getTime() / 1000);
    if (epochSecsNow > idTokenFields.exp) {
      throw new AuthenticationError(
        "id_token_expired",
        `id token has expired, please check your clock`
      );
    }
    if (idTokenFields.iat > epochSecsNow + Authenticator.ID_TOKEN_IAT_LEEWAY) {
      throw new AuthenticationError(
        "id_token_issued_in_future",
        `id token issued timestamp is in the future, please check your clock`
      );
    }

    return idTokenFields;
  }

  /**
   * Verifies signature of the received OpenID Connect ID token.
   * @param idToken The received ID token as a string.
   * @returns Verification result for successfully verified ID token.
   *    "payload" field contains the ID token payload as a JSON string.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async verifyIdToken(idToken: string): Promise<any> {
    const cryptographer = new Jose.WebCryptographer();
    cryptographer.setContentSignAlgorithm("RS256");
    const signerPubKey = await this.getSignerPublicKey();
    const verifier = new Jose.JoseJWS.Verifier(
      cryptographer,
      idToken,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (keyId) => new Promise<CryptoKey>((resolve) => resolve(signerPubKey))
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let verificationResults: any = undefined;
    try {
      verificationResults = await verifier.verify();
    } catch (err) {
      throw new AuthenticationError(
        "id_token_verification_failed",
        "ID token signature verification failed"
      );
    }
    debug("ID token verification results: %o", verificationResults);
    const verificationResult = verificationResults[0];
    if (
      !verificationResult.verified ||
      verificationResult.payload === undefined
    ) {
      throw new AuthenticationError(
        "invalid_id_token",
        "signature verification failed"
      );
    }

    // js-jose handles UTF-8 input incorrectly, fix encoding
    verificationResult.payload = decodeURIComponent(
      verificationResult.payload
        .split("")
        .map(
          (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );

    return verificationResult;
  }

  /**
   * Ensures that OpenID Connect nonce created earlier by this application is still valid.
   * @param startLoginResponse Initial state built when starting the authentication flow.
   */
  private ensureNonceIsValid(startLoginResponse: StartLoginResponse): void {
    if (!this.isNonceValid(new Date(startLoginResponse.nonceIssuedAt))) {
      throw new AuthenticationError(
        "nonce_expired",
        "Getting response from the identity provider took too long, OpenID Connect nonce has expired"
      );
    }
  }

  /**
   * Gets nonce expiration in seconds.
   */
  private getNonceExpiresIn(): number {
    return Authenticator.NONCE_EXPIRES_IN;
  }

  /**
   * Determines if nonce issued at the given time is currently valid.
   * @param nonceIssuedAt Nonce issued timestamp
   */
  private isNonceValid(nonceIssuedAt: Date): boolean {
    return (
      new Date().getTime() <
      nonceIssuedAt.getTime() + this.getNonceExpiresIn() * 1000
    );
  }

  /**
   * Gets issuer id used by the server for issuing OpenID Connect ID tokens.
   */
  private getIdpIssuerId(): string {
    return `${this.tokenUri.protocol}//${this.tokenUri.host}`;
  }

  /**
   * Gets public key of the server used for signing OpenID Connect ID tokens.
   */
  private async getSignerPublicKey(): Promise<CryptoKey> {
    const keys = await this.fetchKeys();
    if (keys && keys.length > 0) {
      const signerKey = keys[0];
      debug("Signer key from JWKS endpoint: %o", signerKey);
      return Jose.Utils.importRsaPublicKey(keys[0], "RS256");
    }
    throw new AuthenticationError(
      "empty_jwks_response",
      "No signer keys found"
    );
  }

  /**
   * Fetch signer keys from the server.
   */
  private async fetchKeys(): Promise<JWKRSA[]> {
    const response = await fetch(this.jwskUri.toString(), {
      method: "GET",
    });
    if (response.ok) {
      return (await response.json())["keys"] as JWKRSA[];
    }
    throw new AuthenticationError(
      "invalid_jwks_response",
      `Fetching signer keys failed with response status ${response.status}`
    );
  }

  /**
   * Builds URL for navigating to the identity provider for authentication.
   */
  private buildAuthenticationRequestUrl(
    codeChallenge: string,
    codeChallengeMethod: string,
    nonce: string,
    state?: string
  ): URL {
    const authnUrl = new URL(this.authnUri.toString());
    const query = authnUrl.searchParams || new URLSearchParams();
    query.append("response_type", "code");
    query.append("scope", this.scope);
    query.append("client_id", this.clientId);
    query.append("redirect_uri", this.redirectUri.toString());
    query.append("code_challenge", codeChallenge);
    query.append("code_challenge_method", codeChallengeMethod);
    query.append("nonce", nonce);
    if (state) {
      query.append("state", state);
    }
    authnUrl.search = query.toString();
    return authnUrl;
  }

  /**
   * Builds URL for navigating to the identity provider for logout.
   */
  private buildIdpLogoutUrl(state?: string): URL {
    const logoutUrl = new URL(this.sloUri.toString());
    const query = logoutUrl.searchParams || new URLSearchParams();
    query.append("client_id", this.clientId);
    if (state) {
      query.append("RelayState", state);
    }
    logoutUrl.search = query.toString();
    return logoutUrl;
  }

  /**
   * Builds URL for navigating to the identity provider after handling logout request
   * received from the identity provider.
   */
  private buildLogoutResponseToIdpUrl(state?: string): URL {
    const logoutResponseUrl = new URL(this.sloUri.toString());
    const query = logoutResponseUrl.searchParams || new URLSearchParams();
    if (state) {
      query.append("RelayState", state);
    }
    logoutResponseUrl.search = query.toString();
    return logoutResponseUrl;
  }
}
