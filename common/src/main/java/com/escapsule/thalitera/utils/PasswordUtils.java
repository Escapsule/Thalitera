package com.escapsule.thalitera.utils;

import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import org.bouncycastle.crypto.generators.SCrypt;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

public class PasswordUtils {

    /**
     * SCrypt parameters (adjusted for server performance)
     *
     * <table cellpadding="5" cellspacing="0" border="1">
     *      <tr style="background-color: #f2f2f2;">
     *          <th>Parameter</th>
     *          <th>Value</th>
     *          <th>Memory Estimation</th>
     *      </tr>
     *      <tr style="background-color: #f2f2f2;">
     *          <td>CPU_COST</td>
     *          <td>16384</td>
     *          <td>128 * n * r</td>
     *      </tr>
     *      <tr style="background-color: #f2f2f2;">
     *          <td>MEMORY_COST</td>
     *          <td>8</td>
     *          <td>128 * 16384 * 8 = 16MB</td>
     *      </tr>
     *      <tr style="background-color: #f2f2f2;">
     *          <td>PARALLELISM</td>
     *          <td>1</td>
     *          <td>Has low parallelism and is suitable for ordinary servers</td>
     *      <tr>
     *     </table>
     */

    // Number of iterations (must be a power of 2, such as 16384)
    private static final int CPU_COST = 16384;

    // Memory factor (default 8, memory footprint = 128 * MEMORY_COST * BLOCK_SIZE)
    private static final int MEMORY_COST = 8;

    // parallelism
    private static final int PARALLELISM = 1;

    // Salt length (bytes)
    private static final int SALT_LENGTH = 16;

    // Hash output length (bytes)
    private static final int HASH_LENGTH = 32;


    /**
     * Encoding the original password
     * <p>
     * The method first generates a salt value, and then uses that salt value and the original password to generate a hash value
     * Finally, encode the hash and salt values into a string and return
     *
     * @param rawPassword Original password to be encoded
     * @return Encoded password string
     */
    public static String encode(String rawPassword) {
        byte[] salt = generateSalt();
        byte[] hash = generateHash(rawPassword.getBytes(StandardCharsets.UTF_8), salt);

        return encodeToString(hash, salt);
    }

    /**
     * Verify that the original password matches the encoded password
     *
     * @param rawPassword The original password entered by the user
     * @param encodedPassword The encoded password stored in the system
     * @return If the passwords match, return true; otherwise, return false.
     * @throws BaseException Throws a business exception if the encoded password is not in the correct format
     */
    public static boolean matches(String rawPassword, String encodedPassword) {
        String[] parts = encodedPassword.split("\\$");

        if (parts.length != 5) {
            throw new BaseException(ErrorCode.INVALID_PASSWORD_FORMAT);
        }

        byte[] salt = Base64.getDecoder().decode(parts[3]);
        byte[] expectedHash = Base64.getDecoder().decode(parts[4]);
        byte[] actualHash = generateHash(rawPassword.getBytes(StandardCharsets.UTF_8), salt);

        return constantTimeEquals(expectedHash, actualHash);
    }

    /**
     * Generate a salt value
     *
     * @return Salt value
     */
    private static byte[] generateSalt() {
        byte[] salt = new byte[SALT_LENGTH];
        new SecureRandom().nextBytes(salt);
        return salt;
    }

    /**
     * Generate a hash value
     *
     * @param password Original password
     * @param salt Salt value
     * @return Hash value
     */
    private static byte[] generateHash(byte[] password, byte[] salt) {
        return SCrypt.generate(
                password,
                salt,
                CPU_COST,
                MEMORY_COST,
                PARALLELISM,
                HASH_LENGTH
        );
    }

    /**
     * Encode the hash and salt values into a string
     *
     * @param hash Hash value
     * @param salt Salt value
     * @return Encoded password string
     */
    private static String encodeToString(byte[] hash, byte[] salt) {
        return String.format("n=%d$r=%d$p=%d$%s$%s",
                CPU_COST,
                MEMORY_COST,
                PARALLELISM,
                Base64.getEncoder().encodeToString(salt),
                Base64.getEncoder().encodeToString(hash)
        );
    }

    /**
     * Compare two byte arrays in constant time
     *
     * @param a First byte array
     * @param b Second byte array
     * @return If the two byte arrays are equal, return true; otherwise, return false.
     */
    private static boolean constantTimeEquals(byte[] a, byte[] b) {
        if (a.length != b.length) return false;
        int result = 0;
        for (int i = 0; i < a.length; i++) {
            result |= a[i] ^ b[i];
        }
        return result == 0;
    }
}
