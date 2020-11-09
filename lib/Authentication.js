"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Describes successful authentication status.
 */
var Authentication = /** @class */ (function () {
    /**
     * Initializes a new authentication status instance.
     * @param accessTokenResponse Access token response from the server.
     * @param idToken Parsed OpenID Connect ID token.
     * @param authenticated Timestamp when authentication has been granted.
     */
    function Authentication(accessTokenResponse, idToken, state, authenticated) {
        if (authenticated === void 0) { authenticated = new Date().getTime(); }
        this.accessTokenResponse = accessTokenResponse;
        this.idToken = idToken;
        this.state = state;
        this.authenticated = authenticated;
    }
    /**
     * Gets user id (sub field of ID token).
     */
    Authentication.prototype.getUserId = function () {
        return this.getIdToken().sub;
    };
    /**
     * Gets user email (email field of ID token).
     */
    Authentication.prototype.getUserEmail = function () {
        return this.getIdToken().email;
    };
    /**
     * Gets or builds user display name from ID token fields.
     */
    Authentication.prototype.getUserDisplayName = function () {
        var idToken = this.getIdToken();
        if (idToken.name) {
            return idToken.name;
        }
        if (idToken.family_name || idToken.given_name) {
            var result = "";
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
    };
    /**
     * Gets preferred user locale (locale field of ID token).
     */
    Authentication.prototype.getUserLocale = function () {
        return this.getIdToken().locale;
    };
    /**
     * Gets the raw access token response received from the server.
     */
    Authentication.prototype.getAccessTokenResponse = function () {
        return this.accessTokenResponse;
    };
    /**
     * Gets the OAuth access token that can be used for API calls.
     */
    Authentication.prototype.getAccessToken = function () {
        return this.getAccessTokenResponse().access_token;
    };
    /**
     * Gets access token valid until.
     */
    Authentication.prototype.getAccessTokenValidUntil = function () {
        return new Date(this.getAuthenticated().getTime() +
            this.getAccessTokenResponse().expires_in * 1000);
    };
    /**
     * Determines if the OAuth access token is currently valid.
     */
    Authentication.prototype.isAccessTokenValid = function () {
        return this.getAccessTokenValidUntil() > new Date();
    };
    /**
     * Gets the parsed OpenID Connect ID token.
     */
    Authentication.prototype.getIdToken = function () {
        return this.idToken;
    };
    /**
     * Gets ID token issued at timestamp.
     */
    Authentication.prototype.getIdTokenIssuedAt = function () {
        return new Date(this.getIdToken().iat * 1000);
    };
    /**
     * Gets ID token valid until.
     */
    Authentication.prototype.getIdTokenValidUntil = function () {
        return new Date(this.getIdToken().exp * 1000);
    };
    /**
     * Determines if the OAuth access token is currently valid.
     */
    Authentication.prototype.isIdTokenValid = function () {
        return this.getIdTokenValidUntil() > new Date();
    };
    /**
     * Gets authenticated timestamp, i.e. timestamp when authentication received from the server.
     */
    Authentication.prototype.getAuthenticated = function () {
        return new Date(this.authenticated);
    };
    /**
     * Gets the opaque state passed through the authentication process.
     */
    Authentication.prototype.getState = function () {
        return this.state;
    };
    return Authentication;
}());
exports.default = Authentication;
//# sourceMappingURL=Authentication.js.map