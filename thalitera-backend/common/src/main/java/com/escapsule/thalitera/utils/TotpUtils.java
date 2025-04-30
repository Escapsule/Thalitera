package com.escapsule.thalitera.utils;

import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.recovery.RecoveryCodeGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;

import java.util.Arrays;
import java.util.Base64;
import java.util.List;

/**
 * TotpUtils encapsulates TOTP-related operations:
 * <ul>
 *   <li>Generate a random TOTP secret.</li>
 *   <li>Verify the TOTP dynamic verification code submitted by the user.</li>
 *   <li>Generate a QR code, and the content of the QR code complies with the OTPAuth protocol. Return the image data in Base64 format.</li>
 * </ul>
 */
public class TotpUtils {
    private static final SecretGenerator SECRET_GENERATOR = new DefaultSecretGenerator(64);
    private static final CodeVerifier CODE_VERIFIER;
    private static final QrGenerator QR_GENERATOR = new ZxingPngQrGenerator();
    private static final RecoveryCodeGenerator RECOVERY_GENERATOR = new RecoveryCodeGenerator();

    static {
        CODE_VERIFIER = new DefaultCodeVerifier(new DefaultCodeGenerator(), new SystemTimeProvider());
    }

    /**
     * Generate a random TOTP secret.
     *
     * @return A random TOTP secret.
     */
    public static String generateSecret() {
        return SECRET_GENERATOR.generate();
    }

    /**
     * Verify the TOTP dynamic verification code submitted by the user.
     *
     * @param secret The TOTP secret.
     * @param totpCode The TOTP dynamic verification code submitted by the user.
     * @return Whether the verification code is valid.
     */
    public static boolean verifyCode(String secret, String totpCode) {
        return CODE_VERIFIER.isValidCode(secret, totpCode);
    }

    /**
     * Generate a QR code
     * <p>
     * and the content of the QR code complies with the OTPAuth protocol.
     * Return the image data in Base64 format.
     * <p>
     * The QR content complies with the otpauth://totp protocol.
     *
     * @param issuer The name of the service provider.
     * @param account The account name.
     * @param secret The TOTP secret.
     * @return The image data in Base64 format.
     * @throws QrGenerationException If the QR code generation fails.
     */
    public static String getQrCode(String issuer, String account, String secret) throws QrGenerationException {
        QrData data = new QrData.Builder()
                .issuer(issuer)
                .label(account)
                .secret(secret)
                .algorithm(HashingAlgorithm.SHA256)
                .digits(6)
                .period(30)
                .build();
        // A byte array (in PNG format) that generates a QR code image.
        byte[] imageData = QR_GENERATOR.generate(data);
        String base64Image = Base64.getEncoder().encodeToString(imageData);
        return "data:image/png;base64," + base64Image;
    }

    /**
     * Generate a list of recovery codes.
     *
     * @param amount The number of recovery codes to generate.
     * @return A list of recovery codes.
     */
    public static List<String> generateRecoveryCodes(int amount) {
        String[] codes = RECOVERY_GENERATOR.generateCodes(amount);
        return Arrays.asList(codes);
    }

    /**
     * Hash the recovery codes.
     *
     * @param codes The recovery codes to hash.
     * @return A list of hashed recovery codes.
     */
    public static List<String> hashCodes(List<String> codes) {
        return codes.stream().map(PasswordUtils::encode).toList();
    }
}
