"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationError = void 0;
var jose_jwe_jws_1 = require("jose-jwe-jws");
var oidc_token_hash_1 = __importDefault(require("oidc-token-hash"));
var Authentication_1 = __importDefault(require("./Authentication"));
var random_1 = require("./random");
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default("Authenticator");
/**
 * Authentication error.
 */
var AuthenticationError = /** @class */ (function (_super) {
    __extends(AuthenticationError, _super);
    function AuthenticationError(error, error_description, error_uri) {
        var _this = _super.call(this, error_description || error) || this;
        _this.error = error;
        _this.error_description = error_description;
        _this.error_uri = error_uri;
        return _this;
    }
    return AuthenticationError;
}(Error));
exports.AuthenticationError = AuthenticationError;
/**
 * Authenticator for handling client authentication against 10Duke server
 * using OpenID Connect Authorization Code Grant flow with PKCE.
 */
var Authenticator = /** @class */ (function () {
    /**
     * Initializes a new instance of the authenticator.
     * @param authnUri URL of identity provider endpoint for authentication.
     * @param tokenUri URL of identity provider endpoint for access token requests.
     * @param sloUri URL of identity provider endpoint for single logout (with 10Duke custom SLO protocol).
     * @param jwksUri URL of identity provider endpoint for JWKS key service.
     * @param clientId OAuth client id used by this application when communicating with the IdP.
     * @param redirectUri OAuth redirect_uri for redirecting back to this application from the IdP.
     */
    function Authenticator(authnUri, tokenUri, sloUri, jwksUri, clientId, redirectUri, scope) {
        if (scope === void 0) { scope = Authenticator.DEFAULT_SCOPE; }
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
    Authenticator.prototype.startLogin = function (state) {
        return __awaiter(this, void 0, void 0, function () {
            var codeVerifier, codeVerifierHash, codeChallenge, nonce, nonceIssuedAt, authnUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        codeVerifier = Array.apply(0, Array(64))
                            .map(function () {
                            return (function (charset) {
                                return charset.charAt(Math.floor(Math.random() * charset.length));
                            })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~");
                        })
                            .join("");
                        return [4 /*yield*/, crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier))];
                    case 1:
                        codeVerifierHash = _a.sent();
                        codeChallenge = btoa(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        String.fromCharCode.apply(null, new Uint8Array(codeVerifierHash)))
                            .replace(/\+/g, "-")
                            .replace(/\//g, "_")
                            .replace(/=/g, "");
                        nonce = random_1.generateRandomString(10);
                        nonceIssuedAt = new Date();
                        authnUrl = this.buildAuthenticationRequestUrl(codeChallenge, "S256", nonce, state);
                        return [2 /*return*/, {
                                url: authnUrl,
                                nonce: nonce,
                                nonceIssuedAt: nonceIssuedAt.getTime(),
                                codeVerifier: codeVerifier,
                            }];
                }
            });
        });
    };
    /**
     * Completes authentication by exchanging authorization code to access token and ID token
     * @param startLoginResponse Initial state built when starting the authentication flow.
     * @param code Authorization code received from the server.
     * @param state Opaque state carried through the authentication process.
     */
    Authenticator.prototype.completeAuthentication = function (startLoginResponse, code, state) {
        return __awaiter(this, void 0, void 0, function () {
            var formParams, response, responseJson, idToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Don't send the access token request if OpenID Connect nonce has already expired
                        this.ensureNonceIsValid(startLoginResponse);
                        formParams = new URLSearchParams();
                        formParams.append("grant_type", "authorization_code");
                        formParams.append("client_id", this.clientId);
                        formParams.append("code", code);
                        formParams.append("redirect_uri", this.redirectUri.toString());
                        formParams.append("code_verifier", startLoginResponse.codeVerifier);
                        return [4 /*yield*/, fetch(this.tokenUri.toString(), {
                                method: "POST",
                                cache: "no-cache",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded",
                                },
                                body: formParams.toString(),
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        responseJson = (_a.sent());
                        return [4 /*yield*/, this.parseAndValidateIdToken(responseJson.id_token, startLoginResponse)];
                    case 3:
                        idToken = _a.sent();
                        this.validateAccessTokenHash(responseJson.access_token, idToken);
                        return [2 /*return*/, new Authentication_1.default(responseJson, idToken, state)];
                }
            });
        });
    };
    /**
     * Builds URL and state for starting single logout process against the identity provider.
     * @param state Opaque state to carry through the authentication. The state is delivered as a parameter
     * with the request sent to the identity provider for starting authentication, and the identity provider
     * sends the state back when eventually returning to the redirect URI of this application.
     */
    Authenticator.prototype.startLogout = function (state) {
        return __awaiter(this, void 0, void 0, function () {
            var logoutUrl;
            return __generator(this, function (_a) {
                logoutUrl = this.buildIdpLogoutUrl(state);
                return [2 /*return*/, {
                        url: logoutUrl,
                    }];
            });
        });
    };
    /**
     * Builds URL for responding to a single sign-out request received from the identity provider.
     * @param state Opaque state to carry through the authentication. The state is delivered as a parameter
     * with the request sent to the identity provider for starting authentication, and the identity provider
     * sends the state back when eventually returning to the redirect URI of this application.
     */
    Authenticator.prototype.handleLogoutRequest = function (state) {
        return __awaiter(this, void 0, void 0, function () {
            var logoutResponseUrl;
            return __generator(this, function (_a) {
                logoutResponseUrl = this.buildLogoutResponseToIdpUrl(state);
                return [2 /*return*/, {
                        url: logoutResponseUrl,
                    }];
            });
        });
    };
    /**
     * Validates access token hash.
     * @param accessToken OAuth access token received from the server.
     * @param idToken ID token received from the server.
     */
    Authenticator.prototype.validateAccessTokenHash = function (accessToken, idToken) {
        var expectedHash = oidc_token_hash_1.default.generate(accessToken, "RS256");
        if (expectedHash !== idToken.at_hash) {
            throw new AuthenticationError("invalid_access_token", "at_hash does not match");
        }
    };
    /**
     * Parses and validates OpenID Connect ID token received from the server in access token response.
     * @param idToken ID token as JWT
     * @param startLoginResponse Initial state built when starting the authentication flow.
     */
    Authenticator.prototype.parseAndValidateIdToken = function (idToken, startLoginResponse) {
        return __awaiter(this, void 0, void 0, function () {
            var verificationResult, idTokenFields, expectedIssuer, epochSecsNow;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.verifyIdToken(idToken)];
                    case 1:
                        verificationResult = _a.sent();
                        idTokenFields = JSON.parse(verificationResult.payload);
                        if (startLoginResponse.nonce !== idTokenFields.nonce) {
                            throw new AuthenticationError("nonce_mismatch", "invalid nonce in ID token received from the server");
                        }
                        expectedIssuer = this.getIdpIssuerId();
                        if (idTokenFields.iss !== expectedIssuer) {
                            throw new AuthenticationError("invalid_id_token", "invalid iss, got " + idTokenFields.iss + ", expected " + expectedIssuer);
                        }
                        if (idTokenFields.aud !== this.clientId) {
                            throw new AuthenticationError("invalid_id_token", "invalid aud, got " + idTokenFields.aud + ", expected " + this.clientId);
                        }
                        epochSecsNow = Math.floor(new Date().getTime() / 1000);
                        if (epochSecsNow > idTokenFields.exp) {
                            throw new AuthenticationError("id_token_expired", "id token has expired, please check your clock");
                        }
                        if (idTokenFields.iat > epochSecsNow + Authenticator.ID_TOKEN_IAT_LEEWAY) {
                            throw new AuthenticationError("id_token_issued_in_future", "id token issued timestamp is in the future, please check your clock");
                        }
                        return [2 /*return*/, idTokenFields];
                }
            });
        });
    };
    /**
     * Verifies signature of the received OpenID Connect ID token.
     * @param idToken The received ID token as a string.
     * @returns Verification result for successfully verified ID token.
     *    "payload" field contains the ID token payload as a JSON string.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Authenticator.prototype.verifyIdToken = function (idToken) {
        return __awaiter(this, void 0, void 0, function () {
            var cryptographer, signerPubKey, verifier, verificationResults, err_1, verificationResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cryptographer = new jose_jwe_jws_1.Jose.WebCryptographer();
                        cryptographer.setContentSignAlgorithm("RS256");
                        return [4 /*yield*/, this.getSignerPublicKey()];
                    case 1:
                        signerPubKey = _a.sent();
                        verifier = new jose_jwe_jws_1.Jose.JoseJWS.Verifier(cryptographer, idToken, 
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        function (keyId) { return new Promise(function (resolve) { return resolve(signerPubKey); }); });
                        verificationResults = undefined;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, verifier.verify()];
                    case 3:
                        verificationResults = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        throw new AuthenticationError("id_token_verification_failed", "ID token signature verification failed");
                    case 5:
                        debug("ID token verification results: %o", verificationResults);
                        verificationResult = verificationResults[0];
                        if (!verificationResult.verified ||
                            verificationResult.payload === undefined) {
                            throw new AuthenticationError("invalid_id_token", "signature verification failed");
                        }
                        // js-jose handles UTF-8 input incorrectly, fix encoding
                        verificationResult.payload = decodeURIComponent(verificationResult.payload
                            .split("")
                            .map(function (c) { return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2); })
                            .join(""));
                        return [2 /*return*/, verificationResult];
                }
            });
        });
    };
    /**
     * Ensures that OpenID Connect nonce created earlier by this application is still valid.
     * @param startLoginResponse Initial state built when starting the authentication flow.
     */
    Authenticator.prototype.ensureNonceIsValid = function (startLoginResponse) {
        if (!this.isNonceValid(new Date(startLoginResponse.nonceIssuedAt))) {
            throw new AuthenticationError("nonce_expired", "Getting response from the identity provider took too long, OpenID Connect nonce has expired");
        }
    };
    /**
     * Gets nonce expiration in seconds.
     */
    Authenticator.prototype.getNonceExpiresIn = function () {
        return Authenticator.NONCE_EXPIRES_IN;
    };
    /**
     * Determines if nonce issued at the given time is currently valid.
     * @param nonceIssuedAt Nonce issued timestamp
     */
    Authenticator.prototype.isNonceValid = function (nonceIssuedAt) {
        return (new Date().getTime() <
            nonceIssuedAt.getTime() + this.getNonceExpiresIn() * 1000);
    };
    /**
     * Gets issuer id used by the server for issuing OpenID Connect ID tokens.
     */
    Authenticator.prototype.getIdpIssuerId = function () {
        return this.tokenUri.protocol + "//" + this.tokenUri.host;
    };
    /**
     * Gets public key of the server used for signing OpenID Connect ID tokens.
     */
    Authenticator.prototype.getSignerPublicKey = function () {
        return __awaiter(this, void 0, void 0, function () {
            var keys, signerKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchKeys()];
                    case 1:
                        keys = _a.sent();
                        if (keys && keys.length > 0) {
                            signerKey = keys[0];
                            debug("Signer key from JWKS endpoint: %o", signerKey);
                            return [2 /*return*/, jose_jwe_jws_1.Jose.Utils.importRsaPublicKey(keys[0], "RS256")];
                        }
                        throw new AuthenticationError("empty_jwks_response", "No signer keys found");
                }
            });
        });
    };
    /**
     * Fetch signer keys from the server.
     */
    Authenticator.prototype.fetchKeys = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(this.jwskUri.toString(), {
                            method: "GET",
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, (_a.sent())["keys"]];
                    case 3: throw new AuthenticationError("invalid_jwks_response", "Fetching signer keys failed with response status " + response.status);
                }
            });
        });
    };
    /**
     * Builds URL for navigating to the identity provider for authentication.
     */
    Authenticator.prototype.buildAuthenticationRequestUrl = function (codeChallenge, codeChallengeMethod, nonce, state) {
        var authnUrl = new URL(this.authnUri.toString());
        var query = authnUrl.searchParams || new URLSearchParams();
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
    };
    /**
     * Builds URL for navigating to the identity provider for logout.
     */
    Authenticator.prototype.buildIdpLogoutUrl = function (state) {
        var logoutUrl = new URL(this.sloUri.toString());
        var query = logoutUrl.searchParams || new URLSearchParams();
        query.append("client_id", this.clientId);
        if (state) {
            query.append("RelayState", state);
        }
        logoutUrl.search = query.toString();
        return logoutUrl;
    };
    /**
     * Builds URL for navigating to the identity provider after handling logout request
     * received from the identity provider.
     */
    Authenticator.prototype.buildLogoutResponseToIdpUrl = function (state) {
        var logoutResponseUrl = new URL(this.sloUri.toString());
        var query = logoutResponseUrl.searchParams || new URLSearchParams();
        if (state) {
            query.append("RelayState", state);
        }
        logoutResponseUrl.search = query.toString();
        return logoutResponseUrl;
    };
    /**
     * Default OAuth / OpenID Connect scope.
     */
    Authenticator.DEFAULT_SCOPE = "openid profile email";
    /**
     * Stored nonce expiration in seconds.
     */
    Authenticator.NONCE_EXPIRES_IN = 300;
    /**
     * ID token must not be issued in the future, but allow some leeway when checking iat.
     * Leeway in seconds.
     */
    Authenticator.ID_TOKEN_IAT_LEEWAY = 5;
    return Authenticator;
}());
exports.default = Authenticator;
//# sourceMappingURL=Authenticator.js.map