import AccessTokenResponse from "./AccessTokenResponse";
import { IdTokenFields } from "./userinfo";

/**
 * Describes successful authentication status.
 */
export default class Authentication {
  /**
   * Access token response received from the server.
   */
  private accessTokenResponse: AccessTokenResponse;

  /**
   * Parsed OpenID Connect ID token.
   */
  private idToken: IdTokenFields;

  /**
   * Authenticated timestamp.
   */
  private authenticated: number;

  /**
   * Opaque state carried through the authentication process.
   */
  private state: string | undefined;

  /**
   * Initializes a new authentication status instance.
   * @param accessTokenResponse Access token response from the server.
   * @param idToken Parsed OpenID Connect ID token.
   * @param authenticated Timestamp when authentication has been granted.
   */
  public constructor(
    accessTokenResponse: AccessTokenResponse,
    idToken: IdTokenFields,
    state?: string,
    authenticated: number = new Date().getTime()
  ) {
    this.accessTokenResponse = accessTokenResponse;
    this.idToken = idToken;
    this.state = state;
    this.authenticated = authenticated;
  }

  /**
   * Gets user id (sub field of ID token).
   */
  public getUserId(): string {
    return this.getIdToken().sub;
  }

  /**
   * Gets user email (email field of ID token).
   */
  public getUserEmail(): string {
    return this.getIdToken().email;
  }

  /**
   * Gets or builds user display name from ID token fields.
   */
  public getUserDisplayName(): string {
    const idToken = this.getIdToken();
    if (idToken.name) {
      return idToken.name;
    }

    if (idToken.family_name || idToken.given_name) {
      let result = "";
      if (idToken.given_name) {
        result += idToken.given_name;
        if (idToken.family_name) {
          result += " ";
        }
      }
      if (idToken.family_name) {
        result += idToken.family_name;
      }
      return result;
    }

    return idToken.email;
  }

  /**
   * Gets preferred user locale (locale field of ID token).
   */
  public getUserLocale(): string | undefined {
    return this.getIdToken().locale;
  }

  /**
   * Gets the raw access token response received from the server.
   */
  public getAccessTokenResponse(): AccessTokenResponse {
    return this.accessTokenResponse;
  }

  /**
   * Gets the OAuth access token that can be used for API calls.
   */
  public getAccessToken(): string {
    return this.getAccessTokenResponse().access_token;
  }

  /**
   * Gets access token valid until.
   */
  public getAccessTokenValidUntil(): Date {
    return new Date(
      this.getAuthenticated().getTime() +
        this.getAccessTokenResponse().expires_in * 1000
    );
  }

  /**
   * Determines if the OAuth access token is currently valid.
   */
  public isAccessTokenValid(): boolean {
    return this.getAccessTokenValidUntil() > new Date();
  }

  /**
   * Gets the parsed OpenID Connect ID token.
   */
  public getIdToken(): IdTokenFields {
    return this.idToken;
  }

  /**
   * Gets ID token issued at timestamp.
   */
  public getIdTokenIssuedAt(): Date {
    return new Date(this.getIdToken().iat * 1000);
  }

  /**
   * Gets ID token valid until.
   */
  public getIdTokenValidUntil(): Date {
    return new Date(this.getIdToken().exp * 1000);
  }

  /**
   * Determines if the OAuth access token is currently valid.
   */
  public isIdTokenValid(): boolean {
    return this.getIdTokenValidUntil() > new Date();
  }

  /**
   * Gets authenticated timestamp, i.e. timestamp when authentication received from the server.
   */
  public getAuthenticated(): Date {
    return new Date(this.authenticated);
  }

  /**
   * Gets the opaque state passed through the authentication process.
   */
  public getState(): string | undefined {
    return this.state;
  }
}
