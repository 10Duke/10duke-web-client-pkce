function getHashAlg(jwsAlg: string): AlgorithmIdentifier {
  switch (jwsAlg) {
    case "HS256":
    case "RS256":
    case "PS256":
    case "ES256":
    case "ES256K":
      return "SHA-256";

    case "HS384":
    case "RS384":
    case "PS384":
    case "ES384":
      return "SHA-384";

    case "HS512":
    case "RS512":
    case "PS512":
    case "ES512":
      return "SHA-512";

    default:
      throw new Error(`Unsupported JWS algorithm ${jwsAlg}`);
  }
}

export async function generateOidcTokenHash(
  token: string,
  alg: string
): Promise<string> {
  const hashAlg = getHashAlg(alg);
  const tokenHash = await crypto.subtle.digest(
    hashAlg,
    new TextEncoder().encode(token)
  );
  return btoa(
    String.fromCharCode.apply(
      null,
      Array.from(new Uint8Array(tokenHash.slice(0, tokenHash.byteLength / 2)))
    )
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
