import Authentication from "./Authentication";
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
export declare class AuthenticationError extends Error {
  error: string;
  error_description?: string;
  error_uri?: string;
  constructor(error: string, error_description?: string, error_uri?: string);
}
/**
 * Authenticator for handling client authentication against 10Duke server
 * using OpenID Connect Authorization Code Grant flow with PKCE.
 */
export default class Authenticator {
  /**
   * Default OAuth / OpenID Connect scope.
   */
  static readonly DEFAULT_SCOPE = "openid profile email";
  /**
   * Stored nonce expiration in seconds.
   */
  static readonly NONCE_EXPIRES_IN = 300;
  /**
   * ID token must not be issued in the future, but allow some leeway when checking iat.
   * Leeway in seconds.
   */
  static readonly ID_TOKEN_IAT_LEEWAY = 5;
  private authnUri;
  private tokenUri;
  private sloUri;
  private jwskUri;
  private redirectUri;
  private clientId;
  private scope;
  /**
   * Initializes a new instance of the authenticator.
   * @param authnUri URL of identity provider endpoint for authentication.
   * @param tokenUri URL of identity provider endpoint for access token requests.
   * @param sloUri URL of identity provider endpoint for single logout (with 10Duke custom SLO protocol).
   * @param jwksUri URL of identity provider endpoint for JWKS key service.
   * @param clientId OAuth client id used by this application when communicating with the IdP.
   * @param redirectUri OAuth redirect_uri for redirecting back to this application from the IdP.
   */
  constructor(
    authnUri: URL,
    tokenUri: URL,
    sloUri: URL,
    jwksUri: URL,
    clientId: string,
    redirectUri: URL,
    scope?: string
  );
  /**
   * Builds URL and state for starting authentication process against the OpenID Connect identity provider.
   * @param state Opaque state to carry through the authentication. The state is delivered as a parameter
   * with the request sent to the identity provider for starting authentication, and the identity provider
   * sends the state back when eventually returning to the redirect URI of this application.
   */
  startLogin(state?: string): Promise<StartLoginResponse>;
  /**
   * Completes authentication by exchanging authorization code to access token and ID token
   * @param startLoginResponse Initial state built when starting the authentication flow.
   * @param code Authorization code received from the server.
   * @param state Opaque state carried through the authentication process.
   */
  completeAuthentication(
    startLoginResponse: StartLoginResponse,
    code: string,
    state?: string
  ): Promise<Authentication>;
  /**
   * Builds URL and state for starting single logout process against the identity provider.
   * @param state Opaque state to carry through the authentication. The state is delivered as a parameter
   * with the request sent to the identity provider for starting authentication, and the identity provider
   * sends the state back when eventually returning to the redirect URI of this application.
   */
  startLogout(state?: string): Promise<StartLogoutResponse>;
  /**
   * Builds URL for responding to a single sign-out request received from the identity provider.
   * @param state Opaque state to carry through the authentication. The state is delivered as a parameter
   * with the request sent to the identity provider for starting authentication, and the identity provider
   * sends the state back when eventually returning to the redirect URI of this application.
   */
  handleLogoutRequest(state?: string): Promise<HandleLogoutRequestResponse>;
  /**
   * Validates access token hash.
   * @param accessToken OAuth access token received from the server.
   * @param idToken ID token received from the server.
   */
  private validateAccessTokenHash;
  /**
   * Parses and validates OpenID Connect ID token received from the server in access token response.
   * @param idToken ID token as JWT
   * @param startLoginResponse Initial state built when starting the authentication flow.
   */
  private parseAndValidateIdToken;
  /**
   * Verifies signature of the received OpenID Connect ID token.
   * @param idToken The received ID token as a string.
   * @returns Verification result for successfully verified ID token.
   *    "payload" field contains the ID token payload as a JSON string.
   */
  private verifyIdToken;
  /**
   * Ensures that OpenID Connect nonce created earlier by this application is still valid.
   * @param startLoginResponse Initial state built when starting the authentication flow.
   */
  private ensureNonceIsValid;
  /**
   * Gets nonce expiration in seconds.
   */
  private getNonceExpiresIn;
  /**
   * Determines if nonce issued at the given time is currently valid.
   * @param nonceIssuedAt Nonce issued timestamp
   */
  private isNonceValid;
  /**
   * Gets issuer id used by the server for issuing OpenID Connect ID tokens.
   */
  private getIdpIssuerId;
  /**
   * Gets public key of the server used for signing OpenID Connect ID tokens.
   */
  private getSignerPublicKey;
  /**
   * Fetch signer keys from the server.
   */
  private fetchKeys;
  /**
   * Builds URL for navigating to the identity provider for authentication.
   */
  private buildAuthenticationRequestUrl;
  /**
   * Builds URL for navigating to the identity provider for logout.
   */
  private buildIdpLogoutUrl;
  /**
   * Builds URL for navigating to the identity provider after handling logout request
   * received from the identity provider.
   */
  private buildLogoutResponseToIdpUrl;
}
