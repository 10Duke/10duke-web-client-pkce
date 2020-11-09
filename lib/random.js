"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomString = void 0;
/**
 * Returns random string with length between 0 to 12 characters.
 */
function generateRandomStringInternal() {
    return Math.random().toString(36).slice(2);
}
/**
 * Returns a random string.
 * @param minLength Minimum length of the string to return. If given zero, the function may return
 *    an empty string but only if internal random generator generates an empty string, which is
 *    a rare case.
 * @param maxLength Maximum length of the string to return, or -1 for unlimited.
 */
function generateRandomString(minLength, maxLength) {
    if (minLength === void 0) { minLength = 0; }
    if (maxLength === void 0) { maxLength = -1; }
    var retValue = "";
    do {
        var rand = generateRandomStringInternal();
        retValue +=
            maxLength === -1 ? rand : rand.substr(0, maxLength - retValue.length);
    } while (retValue.length < minLength);
    return retValue;
}
exports.generateRandomString = generateRandomString;
//# sourceMappingURL=random.js.map