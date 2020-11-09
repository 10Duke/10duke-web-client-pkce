/**
 * Returns random string with length between 0 to 12 characters.
 */
function generateRandomStringInternal(): string {
  return Math.random().toString(36).slice(2);
}

/**
 * Returns a random string.
 * @param minLength Minimum length of the string to return. If given zero, the function may return
 *    an empty string but only if internal random generator generates an empty string, which is
 *    a rare case.
 * @param maxLength Maximum length of the string to return, or -1 for unlimited.
 */
export function generateRandomString(minLength = 0, maxLength = -1): string {
  let retValue = "";
  do {
    const rand = generateRandomStringInternal();
    retValue +=
      maxLength === -1 ? rand : rand.substr(0, maxLength - retValue.length);
  } while (retValue.length < minLength);

  return retValue;
}
