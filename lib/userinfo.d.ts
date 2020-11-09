/**
 * OpenID Connect address record. See
 * https://openid.net/specs/openid-connect-core-1_0.html#AddressClaim
 */
export interface Address {
  formatted?: string;
  street_address?: string;
  locality?: string;
  region?: string;
  postal_code?: string;
  country?: string;
}
/**
 * OpenID Connect ID token fields. See
 * https://openid.net/specs/openid-connect-core-1_0.html#IDToken
 * and
 * https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
 */
export interface IdTokenFields {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  auth_time?: number;
  nonce: string;
  acr?: string;
  amr?: string[];
  azp?: string;
  at_hash: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: Address;
  updated_at?: number;
  [key: string]: any;
}
