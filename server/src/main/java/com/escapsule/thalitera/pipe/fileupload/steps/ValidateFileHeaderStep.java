package com.escapsule.thalitera.pipe.fileupload.steps;

import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.FileException;
import com.escapsule.thalitera.pipe.fileupload.FilePipeContext;
import com.escapsule.thalitera.pipe.fileupload.FilePipeStep;
import fi.solita.clamav.ClamAVClient;
import org.apache.tika.Tika;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Set;

/**
 * A step component in the file upload process that is responsible for verifying the file header and basic security.
 * <p>
 * The execution sequence includes:
 * file empty check, size limit, extension whitelist, MIME type validation.
 * Multiple security verification mechanisms such as ClamAV virus scanning and file magic number checking.
 * This component is declared as the first priority step of pipeline processing through {@code @Order(1)} statement.
 *
 * @since 2025-4-19
 */
@Component
@Order(1)
public class ValidateFileHeaderStep implements FilePipeStep {
    /**
     * White list of file extensions allowed for upload.
     */
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("png", "jpg", "jpeg", "pdf", "gif");
    /**
     * The set of allowed MIME types must correspond to the whitelist of file extensions.
     */
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/png",
            "image/jpg",
            "image/jpeg",
            "image/gif",
            "application/pdf"
    );

    /**
     * PNG format header.
     */
    private static final byte[] PNG_MAGIC  = new byte[] {
            (byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    };

    /**
     * JPEG format header.
     */
    private static final byte[] JPEG_MAGIC = new byte[] {
            (byte)0xFF, (byte)0xD8
    };

    /**
     * GIF87a format header.
     */
    private static final byte[] GIF_MAGIC1 = new byte[] { 'G','I','F','8','7','a' };

    /**
     * GIF89a format header.
     */
    private static final byte[] GIF_MAGIC2 = new byte[] { 'G','I','F','8','9','a' };

    /**
     * Maximum file size allowed for upload.
     */
    private static final long MAX_FILE_SIZE = 50L * 1024 * 1024;

    /**
     * ClamAV client instance used for virus scanning.
     */
    private final ClamAVClient CLAM_AV_CLIENT = new ClamAVClient("localhost", 3310);

    /**
     * Tika instance used for file type detection.
     */
    private final Tika TIKA = new Tika();



    /**
     * Execute the file validation pipeline process.
     *
     * @param ctx A file pipeline context object, which contains metadata of the uploaded file and business DTO.
     * @throws RuntimeException When any of the following situations occur:
     *                          <ul>
     *                          <li>The file content is empty.</li>
     *                          <li>The file size exceeds the limit.</li>
     *                          <li>The file name format is not valid.</li>
     *                          <li>The file extension is not on the whitelist.</li>
     *                          <li>The MIME type is not within the allowed range.</li>
     *                          <li> ClamAV service not available.</li>
     *                          <li> Virus infection file detected.</li>
     *                          <li>File header verification failed</li>
     *                          </ul>
     */
    @Override
    public void execute(FilePipeContext ctx) throws Exception {
        MultipartFile file = ctx.getDto().getFile();

        validateFileBase(file);

        validateDetectedType(file);

        performVirusScan(file);

        validateMagicNumbers(file);
    }

    /**
     * Verify the MIME type of the file.
     *
     * @param file Upload file object.
     * @throws FileException Throw an exception when the MIME type is not within the allowed range.
     */
    private void validateDetectedType(MultipartFile file) throws Exception {
        try (InputStream is = file.getInputStream()) {
            String detectedType = TIKA.detect(is);
            if (!ALLOWED_MIME_TYPES.contains(detectedType)) {
                throw new FileException(ErrorCode.THIS_FILE_TYPE_IS_NOT_ALLOWED, detectedType);
            }
        }
    }

    /**
     * Execute ClamAV virus scan.
     * TODO: Prod environment: Implement virus scanning using ClamAV.
     * @param file Upload files to be scanned.
     * @throws FileException Throw an exception when the ClamAV service is unavailable or detects an infected file.
     */
    private void performVirusScan(MultipartFile file) throws Exception {
        /*try (InputStream is = file.getInputStream()) {
            if (!CLAM_AV_CLIENT.ping()) {
                throw new FileException(ErrorCode.CLAM_AV_SERVICE_UNAVAILABLE);
            }
            if (!ClamAVClient.isCleanReply(CLAM_AV_CLIENT.scan(is))) {
                throw new FileException(ErrorCode.VIRUS_INFECTION_FILE_DETECTED);
            }
        }*/
    }

    /**
     * Verify the basic attributes of the file.
     *
     * @param file Upload file object.
     * @throws FileException Throw an exception when the file is empty,
     *                       exceeds the size limit, or the file name is not valid.
     */
    private void validateFileBase(MultipartFile file) {
        if (file.isEmpty()) {
            throw new FileException(ErrorCode.FILE_IS_EMPTY);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileException(ErrorCode.FILE_SIZE_EXCEEDS_LIMIT, String.valueOf(MAX_FILE_SIZE));
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.contains(".") || originalName.contains("..")) {
            throw new FileException(ErrorCode.FILE_NAME_IS_NOT_VALID);
        }
        String ext = StringUtils.getFilenameExtension(originalName);
        if (ext == null || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new FileException(ErrorCode.THIS_FILE_TYPE_IS_NOT_ALLOWED, ext);
        }
    }

    /**
     * Check the magic number of the file.
     *
     * @param file Upload file object.
     * @throws FileException Throw an exception when the file header does not match any of the allowed formats.
     */
    private void validateMagicNumbers(MultipartFile file) throws Exception {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[8];
            int read = is.read(header);

            if (read < 2) {
                throw new FileException(ErrorCode.FILE_HEADER_VERIFICATION_FAILED);
            }

            if (matches(header, PNG_MAGIC) ||
                    matches(header, JPEG_MAGIC) ||
                    matches(header, GIF_MAGIC1) ||
                    matches(header, GIF_MAGIC2)) {
                return;
            }

            throw new FileException(ErrorCode.FILE_HEADER_VERIFICATION_FAILED);
        }
    }

    /**
     * Byte array prefix matching check.
     *
     * @param header The byte array read from the file header.
     * @param magic  The expected matching magic byte sequence.
     * @return True means the header byte matches the magic word, and false means it doesn't.
     */
    private boolean matches(byte[] header, byte[] magic) {
        if (header.length < magic.length) return false;
        for (int i = 0; i < magic.length; i++) {
            if (header[i] != magic[i]) return false;
        }
        return true;
    }
}
