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
exports.LicenseCheckError = exports.LicenseReleaseResult = exports.LicenseCheckResult = void 0;
var jose_jwe_jws_1 = require("jose-jwe-jws");
var debug_1 = __importDefault(require("debug"));
var debug = debug_1.default("LicenseChecker");
/**
 * Result of a license check / consume request.
 */
var LicenseCheckResult = /** @class */ (function () {
    function LicenseCheckResult() {
    }
    /**
     * Determines if this result grants license for the given licensed item.
     * @param licensedItem The licensed item name.
     */
    LicenseCheckResult.prototype.hasLicense = function (licensedItem) {
        return this[licensedItem] === true;
    };
    return LicenseCheckResult;
}());
exports.LicenseCheckResult = LicenseCheckResult;
/**
 * Result of a license release request.
 */
var LicenseReleaseResult = /** @class */ (function () {
    function LicenseReleaseResult() {
    }
    /**
     * Determines if this result shows that lease has been successfully released.
     * @param leaseId The lease id.
     */
    LicenseReleaseResult.prototype.isReleased = function (leaseId) {
        return this[leaseId] === true;
    };
    return LicenseReleaseResult;
}());
exports.LicenseReleaseResult = LicenseReleaseResult;
/**
 * License checking / consuming error.
 */
var LicenseCheckError = /** @class */ (function (_super) {
    __extends(LicenseCheckError, _super);
    function LicenseCheckError(error, error_description, error_uri) {
        var _this = _super.call(this, error_description || error) || this;
        _this.error = error;
        _this.error_description = error_description;
        _this.error_uri = error_uri;
        return _this;
    }
    return LicenseCheckError;
}(Error));
exports.LicenseCheckError = LicenseCheckError;
/**
 * License checker for making license consumption requests.
 */
var LicenseChecker = /** @class */ (function () {
    /**
     * Initializes a new instance of the license checker.
     * @param accessToken OAuth access token.
     * @param authnUri URL of endpoint for license consumption calls.
     * @param jwksUri URL of identity provider endpoint for JWKS key service.
     * @param hw Identifier of the device from which license is consumed.
     */
    function LicenseChecker(accessToken, authzUri, jwksUri, hw) {
        this.accessToken = accessToken;
        this.authzUri = authzUri;
        this.jwskUri = jwksUri;
        this.hw = hw;
    }
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
    LicenseChecker.prototype.consumeLicense = function (licensedItem) {
        return __awaiter(this, void 0, void 0, function () {
            var url, query, response, responseJwt, responseFields;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = new URL(this.authzUri.toString());
                        query = url.searchParams || new URLSearchParams();
                        query.append(licensedItem, "");
                        if (this.hw) {
                            query.append("hw", this.hw);
                        }
                        url.search = query.toString();
                        url.pathname = url.pathname + ".jwt";
                        return [4 /*yield*/, fetch(url.toString(), {
                                method: "POST",
                                cache: "no-cache",
                                headers: {
                                    Authorization: "Bearer " + this.accessToken,
                                    "Content-Type": "application/x-www-form-urlencoded",
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.text()];
                    case 2:
                        responseJwt = _a.sent();
                        debug("Result license token for consume %s: %s", licensedItem, responseJwt);
                        return [4 /*yield*/, this.parseAndValidateJwt(responseJwt)];
                    case 3:
                        responseFields = _a.sent();
                        debug("Result fields for consume %s: %o", licensedItem, responseFields);
                        return [2 /*return*/, Object.assign(new LicenseCheckResult(), responseFields)];
                }
            });
        });
    };
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
    LicenseChecker.prototype.releaseLicense = function (leaseId) {
        return __awaiter(this, void 0, void 0, function () {
            var url, query, response, responseJson;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = new URL(this.authzUri.toString());
                        query = url.searchParams || new URLSearchParams();
                        query.append("release", "true");
                        query.append(leaseId, "");
                        if (this.hw) {
                            query.append("hw", this.hw);
                        }
                        url.search = query.toString();
                        url.pathname = url.pathname + ".json";
                        return [4 /*yield*/, fetch(url.toString(), {
                                method: "POST",
                                cache: "no-cache",
                                headers: {
                                    Authorization: "Bearer " + this.accessToken,
                                    "Content-Type": "application/x-www-form-urlencoded",
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        responseJson = _a.sent();
                        debug("Release result: %o", responseJson);
                        return [2 /*return*/, Object.assign(new LicenseReleaseResult(), responseJson)];
                }
            });
        });
    };
    /**
     * Parses and validates the received license token.
     * @param licenseToken The received license token as a JWT string.
     * @returns Object with license check / consume result fields. If license granted,
     *    the result contains field for the checked licensed item with boolean true value.
     *    For example, if successfully consuming license for "myFeatureX", there is a result
     *    field "myFeatureX": true. If license not granted, the result contains field
     *    [licensedItem]_error, for example "myFeatureX_error": "License not granted error message".
     */
    LicenseChecker.prototype.parseAndValidateJwt = function (licenseToken) {
        return __awaiter(this, void 0, void 0, function () {
            var verificationResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.verifyLicenseToken(licenseToken)];
                    case 1:
                        verificationResult = _a.sent();
                        return [2 /*return*/, JSON.parse(verificationResult.payload)];
                }
            });
        });
    };
    /**
     * Verifies signature of the received license token.
     * @param licenseToken The received license token as a JWT string.
     * @returns Verification result for successfully verified license token.
     *    "payload" field contains the ID token payload as a JSON string.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    LicenseChecker.prototype.verifyLicenseToken = function (licenseToken) {
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
                        verifier = new jose_jwe_jws_1.Jose.JoseJWS.Verifier(cryptographer, licenseToken, 
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
                        throw new LicenseCheckError("license_token_verification_failed", "License token signature verification failed");
                    case 5:
                        debug("License token verification results: %o", verificationResults);
                        verificationResult = verificationResults[0];
                        if (!verificationResult.verified ||
                            verificationResult.payload === undefined) {
                            throw new LicenseCheckError("invalid_license_token", "signature verification failed");
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
     * Gets public key of the server used for signing license tokens.
     */
    LicenseChecker.prototype.getSignerPublicKey = function () {
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
                        throw new LicenseCheckError("empty_jwks_response", "No signer keys found");
                }
            });
        });
    };
    /**
     * Fetch signer keys from the server.
     */
    LicenseChecker.prototype.fetchKeys = function () {
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
                    case 3: throw new LicenseCheckError("invalid_jwks_response", "Fetching signer keys failed with response status " + response.status);
                }
            });
        });
    };
    return LicenseChecker;
}());
exports.default = LicenseChecker;
//# sourceMappingURL=LicenseChecker.js.map