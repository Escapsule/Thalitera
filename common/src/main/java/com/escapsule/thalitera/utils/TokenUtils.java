package com.escapsule.thalitera.utils;


import org.bouncycastle.crypto.digests.SHA256Digest;
import org.bouncycastle.crypto.prng.DigestRandomGenerator;
import org.bouncycastle.util.encoders.Hex;

public class TokenUtils {
    /**
     * Generate a short token string
     * <p>
     * The method uses the SHA-256 hashing algorithm to generate random bytes and convert them to the hexadecimal string format
     * Due to the long generated token, this method only returns the first 32 characters
     *
     * @return A random token string of length 32
     */
    public static String generateShortToken() {
        DigestRandomGenerator randomGenerator = new DigestRandomGenerator(new SHA256Digest());
        randomGenerator.addSeedMaterial(System.nanoTime());
        byte[] randomBytes = new byte[32];
        randomGenerator.nextBytes(randomBytes);
        return Hex.toHexString(randomBytes).substring(0, 32);
    }
}
