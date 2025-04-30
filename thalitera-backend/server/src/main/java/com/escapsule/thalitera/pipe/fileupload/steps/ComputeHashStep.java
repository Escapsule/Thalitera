package com.escapsule.thalitera.pipe.fileupload.steps;

import com.escapsule.thalitera.entity.FileMetadata;
import com.escapsule.thalitera.mapper.FileMetadataMapper;
import com.escapsule.thalitera.pipe.fileupload.FilePipeContext;
import com.escapsule.thalitera.pipe.fileupload.FilePipeStep;
import jakarta.xml.bind.DatatypeConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.security.MessageDigest;

/**
 * File processing step responsible for cryptographic hashing and metadata collection.
 * <p>
 * Executes as the third step in the file upload pipeline ({@code @Order(3)}), this component:
 * <ol>
 *   <li>Computes SHA-256 checksum for file integrity verification</li>
 *   <li>Records original file size in bytes</li>
 *   <li>Captures MIME type reported by the client</li>
 * </ol>
 * Uses NIST-approved SHA-256 algorithm through {@link MessageDigest} for secure hashing.
 *
 * @author General_K1ng
 * @since 2025-04-19
 */
@Component
@Order(3)
@RequiredArgsConstructor
public class ComputeHashStep implements FilePipeStep {

    /** Buffer size (8KB) for efficient stream reading */
    private static final int BUFFER_SIZE = 8192;
    private final FileMetadataMapper fileMetadataMapper;

    /**
     * Executes file hashing and metadata collection process.
     * <p>
     * Implementation details:
     * <ul>
     *   <li>Uses try-with-resources for guaranteed stream closure</li>
     *   <li>Processes file content in 8KB chunks for memory efficiency</li>
     *   <li>Converts hash to lowercase hexadecimal representation</li>
     *   <li>Stores three metadata attributes:
     *     <ol>
     *       <li>SHA-256 digest - 64 character hex string</li>
     *       <li>Original file size - in bytes</li>
     *       <li>Client-reported content type</li>
     *     </ol>
     *   </li>
     * </ul>
     *
     * @param ctx File processing context containing upload data and metadata container
     * @throws Exception if any of these occur:
     *                   <ul>
     *                     <li>NoSuchAlgorithmException - if SHA-256 isn't available</li>
     *                     <li>IOException - during stream operations</li>
     *                     <li>SecurityException - if JCE isn't properly configured</li>
     *                   </ul>
     */
    @Override
    public void execute(FilePipeContext ctx) throws Exception {
        try (InputStream is = ctx.getDto().getFile().getInputStream()) {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buf = new byte[BUFFER_SIZE];
            int len;
            while ((len = is.read(buf)) > 0) {
                digest.update(buf, 0, len);
            }
            String hash = DatatypeConverter.printHexBinary(digest.digest()).toLowerCase();

            FileMetadata fileMetadata = fileMetadataMapper.getDataByHash(hash);
            if (fileMetadata != null) {
                ctx.setMetadata(fileMetadata);
                ctx.setUploaded(true);
                return;
            }

            ctx.getMetadata().setSha256Hash(hash);
            ctx.getMetadata().setSize(ctx.getDto().getFile().getSize());
            ctx.getMetadata().setContentType(ctx.getDto().getFile().getContentType());
        }
    }
}
