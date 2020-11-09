/**
 * Returns a random string.
 * @param minLength Minimum length of the string to return. If given zero, the function may return
 *    an empty string but only if internal random generator generates an empty string, which is
 *    a rare case.
 * @param maxLength Maximum length of the string to return, or -1 for unlimited.
 */
export declare function generateRandomString(
  minLength?: number,
  maxLength?: number
): string;
