/**
 * Response from access token endpoint of the identity provider.
 */
export default interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  id_token: string;
  scope?: string;
}
