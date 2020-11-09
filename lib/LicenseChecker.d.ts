/**
 * Result of a license check / consume request.
 */
export declare class LicenseCheckResult {
  [claim: string]: any;
  /**
   * Determines if this result grants license for the given licensed item.
   * @param licensedItem The licensed item name.
   */
  hasLicense(licensedItem: string): boolean;
}
/**
 * Result of a license release request.
 */
export declare class LicenseReleaseResult {
  [claim: string]: any;
  /**
   * Determines if this result shows that lease has been successfully released.
   * @param leaseId The lease id.
   */
  isReleased(leaseId: string): boolean;
}
/**
 * License checking / consuming error.
 */
export declare class LicenseCheckError extends Error {
  error: string;
  error_description?: string;
  error_uri?: string;
  constructor(error: string, error_description?: string, error_uri?: string);
}
/**
 * License checker for making license consumption requests.
 */
export default class LicenseChecker {
  private accessToken;
  private authzUri;
  private jwskUri;
  private hw;
  /**
   * Initializes a new instance of the license checker.
   * @param accessToken OAuth access token.
   * @param authnUri URL of endpoint for license consumption calls.
   * @param jwksUri URL of identity provider endpoint for JWKS key service.
   * @param hw Identifier of the device from which license is consumed.
   */
  constructor(accessToken: string, authzUri: URL, jwksUri: URL, hw?: string);
  /**
   * Consumes license.
   * @param licensedItem Name of licensed item to consume.
   * @param hw Hardware / device identifier.
   * @returns Object with license check / consume result fields. If license granted,
   *    the result contains field for the checked licensed item with boolean true value.
   *    For example, if successfully consuming license for "myFeatureX", there is a result
   *    field "myFeatureX": true. If license not granted, the result contains field
   *    [licensedItem]_errorCode, for example "myFeatureX_errorCode": "License not granted error code".
   *    In addition to the [licensedItem]_errorCode field, [licensedItem]_errorMessage and
   *    [licensedItem]_errorTechnical are returned with additional information of the error.
   *
   *    For successful license consumption, "jti" field of the result contains id of lease
   *    granted for the client. This value can be used later for releasing the license.
   */
  consumeLicense(licensedItem: string): Promise<LicenseCheckResult>;
  /**
   * Releases a license consumption held by this client application.
   * @param leaseId Id of the license lease to release, i.e. id of the consumption.
   *    License consumption call returns this as value of the "jti" field.
   * @returns Object with the license release call result fields. If released successfully,
   *    the response object contains a field "[leaseId]" where [leaseId] is the leaseId
   *    given as input to this method, and value of the field is true. For example, if leaseId is
   *    455a9938-b44b-4ec5-876c-8b6aca39682a, then a successful license lease release result contains
   *    "455a9938-b44b-4ec5-876c-8b6aca39682a": true.
   */
  releaseLicense(leaseId: string): Promise<LicenseReleaseResult>;
  /**
   * Parses and validates the received license token.
   * @param licenseToken The received license token as a JWT string.
   * @returns Object with license check / consume result fields. If license granted,
   *    the result contains field for the checked licensed item with boolean true value.
   *    For example, if successfully consuming license for "myFeatureX", there is a result
   *    field "myFeatureX": true. If license not granted, the result contains field
   *    [licensedItem]_error, for example "myFeatureX_error": "License not granted error message".
   */
  private parseAndValidateJwt;
  /**
   * Verifies signature of the received license token.
   * @param licenseToken The received license token as a JWT string.
   * @returns Verification result for successfully verified license token.
   *    "payload" field contains the ID token payload as a JSON string.
   */
  private verifyLicenseToken;
  /**
   * Gets public key of the server used for signing license tokens.
   */
  private getSignerPublicKey;
  /**
   * Fetch signer keys from the server.
   */
  private fetchKeys;
}
