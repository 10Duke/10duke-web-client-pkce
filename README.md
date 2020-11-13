# 10Duke Identity and Entitlement client library for browser-based applications

Main features of this library are:

- Authentication / Single Sign-On using [OpenID Connect Authorization Code Flow](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth) with [Proof Key for Code Exchange (PKCE)](https://tools.ietf.org/html/rfc7636)
- Single Sign-Out
- License consumption
- License release

The client library currently covers basic use cases for license consumption and release.

The library uses the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for HTTP requests.

## Example

This library is used by [10Duke Identity and Entitlement React sample client](https://github.com/10Duke/react-sample).

## Basic usage, authentication

The example linked above gives a real-world example of how to use this client library. Examples of library usage for authentication are given below:

```
import { Authenticator } from "@10duke/web-client-pkce";
import { Authentication } from "@10duke/web-client-pkce";

// Create authenticator for OpenID Connect authentication and OAuth authorization
// against the 10Duke server
const authenticator = new Authenticator(
  new URL("https://10duke-account.example.com/user/oauth20/authz"),
  new URL("https://10duke-account.example.com/user/oauth20/token"),
  new URL("https://10duke-account.example.com/user/oauth20/signout"),
  new URL("https://10duke-account.example.com/.well-known/jwks.json"),
  "my-client-id",
  new URL("https://my-client.example.com/logincb"),
  "openid profile email https://apis.10duke.com/auth/openidconnect/organization"
);

/**
 * Start login against 10Duke. Browser is directed to 10Duke for login. When login
 * is complete, 10Duke returns the browser back to the client redirect_uri
 * ("https://my-client.example.com/logincb" in this example). As dictated by the
 * OpenID Connect spec, client is required to store some state for later use.
 */
async function startLogin(state?: string): Promise<void> {
  const startLoginState = await authenticator.startLogin("MyState");
  localStorage.setItem("startLoginState", JSON.stringify(startLoginState));
  window.location.href = startLoginState.url.toString();
}

/**
 * ...eventually browser is directed back to the client, and client needs to handle
 * OpenID Connect response from 10Duke. An example response URL:
 * https://my-client.example.com/logincb?code=abc123&state=MyState
 *
 * In real life, this response handling would probably not be in the same
 * context / component / code file as starting the login.
 * See the sample projects for a real-life example.
 *
 * @param code Authorization code received as "code" query parameter in
 *     the OpenID Connect response from the server
 * @param state State received as "state" query parameter in the OpenID Connect
 *     response from the server (optional, only included in the response if client
 *     specified state when starting login)
 */
async function completeLogin(code: string, state: string): Promise<Authentication> {
  // Read the state stored when starting login
  const storedLoginState = localStorage.getItem("startLoginState");
  const startLoginState = JSON.parse(storedLoginState) as StartLoginResponse;
  localStorage.removeItem("startLoginState");

  // Complete authentication by exchanging the code to an access token and ID token
  return await authenticator.completeAuthentication(startLoginState, code, state);
}

// completeLogin must be called with actual values read from the response URL.
// Here "abc123" and "MyState" represent values of "code" and "state" query parameters,
// respectively.
const authn = await completeLogin("abc123", "MyState");
// The Authentication object can now be used for accessing user details and
// OAuth access token, for example:
const email = authn.getUserEmail();
const accessToken = authn.getAccessToken();
```

## Basic usage, licensing

The example linked above gives a real-world example of how to use this client library. Examples of library usage for licensing are given below:

```
import { LicenseChecker } from "@10duke/web-client-pkce";
import { LicenseCheckResult } from "@10duke/web-client-pkce";
import { LicenseReleaseResult } from "@10duke/web-client-pkce";

// Create license checker for checking, consuming and releasing licenses
const licenseChecker = new LicenseChecker(
  // accessToken received from the server (see the authentication / authorization example)
  accessToken,
  new URL("https://10duke-account.example.com/authz"),
  new URL("https://10duke-account.example.com/.well-known/jwks.json"),
  // Optional hw parameter for identifying the client hardware, for example hash derived
  // from baseboard serial number. Can be omitted for browser applications.
  "MyHardwareId"
);

/**
 * Consumes license for the given licensed item.
 *
 * @param licensedItem Name of licensed item to consume. Typically this is name of
 *    the client application or a licensed feature of the client application.
 */
async function consumeLicense(licensedItem: string): Promise<LicenseCheckResult> {
  return licenseChecker.consumeLicense(licensedItem);
}

// Here "MyCoolApp" represents name of the license to check
const licenseCheckResult = await consumeLicense("MyCoolApp");
const licenseGranted = licenseCheckResult.hasLicense("MyCoolApp");
const leaseId = licenseCheckResult.jti;

/**
 * Releases an earlier consumed license.
 *
 * @param leaseId Lease id received when consuming the license
 */
async function releaseLicense(leaseId: string): Promise<LicenseReleaseResult> {
  return licenseChecker.releaseLicense(leaseId);
}

// Use the earlier received leaseId to release license
const licenseReleaseResult = await releaseLicense(leaseId);
const licenseReleased = licenseReleaseResult(leaseId);
```
