import AccessTokenResponse from "./AccessTokenResponse";
import { IdTokenFields } from "./userinfo";
/**
 * Describes successful authentication status.
 */
export default class Authentication {
  /**
   * Access token response received from the server.
   */
  private accessTokenResponse;
  /**
   * Parsed OpenID Connect ID token.
   */
  private idToken;
  /**
   * Authenticated timestamp.
   */
  private authenticated;
  /**
   * Opaque state carried through the authentication process.
   */
  private state;
  /**
   * Initializes a new authentication status instance.
   * @param accessTokenResponse Access token response from the server.
   * @param idToken Parsed OpenID Connect ID token.
   * @param authenticated Timestamp when authentication has been granted.
   */
  constructor(
    accessTokenResponse: AccessTokenResponse,
    idToken: IdTokenFields,
    state?: string,
    authenticated?: number
  );
  /**
   * Gets user id (sub field of ID token).
   */
  getUserId(): string;
  /**
   * Gets user email (email field of ID token).
   */
  getUserEmail(): string;
  /**
   * Gets or builds user display name from ID token fields.
   */
  getUserDisplayName(): string;
  /**
   * Gets preferred user locale (locale field of ID token).
   */
  getUserLocale(): string | undefined;
  /**
   * Gets the raw access token response received from the server.
   */
  getAccessTokenResponse(): AccessTokenResponse;
  /**
   * Gets the OAuth access token that can be used for API calls.
   */
  getAccessToken(): string;
  /**
   * Gets access token valid until.
   */
  getAccessTokenValidUntil(): Date;
  /**
   * Determines if the OAuth access token is currently valid.
   */
  isAccessTokenValid(): boolean;
  /**
   * Gets the parsed OpenID Connect ID token.
   */
  getIdToken(): IdTokenFields;
  /**
   * Gets ID token issued at timestamp.
   */
  getIdTokenIssuedAt(): Date;
  /**
   * Gets ID token valid until.
   */
  getIdTokenValidUntil(): Date;
  /**
   * Determines if the OAuth access token is currently valid.
   */
  isIdTokenValid(): boolean;
  /**
   * Gets authenticated timestamp, i.e. timestamp when authentication received from the server.
   */
  getAuthenticated(): Date;
  /**
   * Gets the opaque state passed through the authentication process.
   */
  getState(): string | undefined;
}
