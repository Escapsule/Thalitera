package com.escapsule.thalitera.pipe.fileupload.steps;

import com.escapsule.thalitera.pipe.fileupload.FilePipeContext;
import com.escapsule.thalitera.pipe.fileupload.FilePipeStep;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.UUID;

/**
 * Final upload stage handling object storage operations for different file sources.
 * <p>
 * Executes as the fifth pipeline step ({@code @Order(5)}), this component:
 * <ul>
 *   <li>Manages unified upload to MinIO object storage</li>
 *   <li>Handles both in-memory content and temporary file sources</li>
 *   <li>Preserves final storage metadata in processing context</li>
 * </ul>
 * Implements streaming upload to minimize memory pressure for large files.
 *
 * @author General_K1ng
 * @since 2025-04-19
 */
@Component
@Order(5)
public class UploadChunksStep implements FilePipeStep {

    /** Identifier prefix for in-memory stored content */
    private static final String IN_MEMORY_PREFIX = "in-memory:";

    /**
     * Executes final upload to object storage.
     * <p>
     * Operational workflow:
     * <ol>
     *   <li>Resolve input source based on storage strategy marker</li>
     *   <li>Configure MinIO upload parameters with proper:
     *     <ul>
     *       <li>Bucket name from execution context</li>
     *       <li>UUID-based object identifier</li>
     *       <li>Content type preservation</li>
     *     </ul>
     *   </li>
     *   <li>Stream content directly to MinIO storage</li>
     *   <li>Finalize metadata with storage location details</li>
     * </ol>
     *
     * @param ctx Processing context containing storage configuration and data
     * @throws Exception For these failure scenarios:
     *                   <ul>
     *                     <li>FileNotFoundException - if temp file was removed</li>
     *                     <li>InvalidObjectKeyException - for malformed UUID</li>
     *                     <li>MinIO API errors - connection/authentication issues</li>
     *                     <li>IOErrors - during stream operations</li>
     *                   </ul>
     */
    @Override
    @Transactional
    public void execute(FilePipeContext ctx) throws Exception {
        if (ctx.isUploaded()) {
            return;
        }
        final String objectKey = ctx.getMetadata().getObjectKey();
        final UUID fileKey = ctx.getMetadata().getFileKey();
        final String bucket = ctx.getBucket();
        final MinioClient client = ctx.getMinioClient();

        try (InputStream inputStream = resolveInputStream(objectKey, ctx)) {
            performMinioUpload(client, bucket, fileKey, inputStream, ctx);
            persistStorageMetadata(ctx, bucket, objectKey);
        }
    }

    /**
     * Resolves input stream based on storage strategy.
     *
     * @param objectKey Storage strategy identifier from previous steps
     * @param ctx Processing context containing upload data
     * @return Appropriate input stream for content source
     * @throws Exception If stream resolution fails
     */
    private InputStream resolveInputStream(String objectKey, FilePipeContext ctx) throws Exception {
        if (objectKey.startsWith(IN_MEMORY_PREFIX)) {
            return ctx.getDto().getFile().getInputStream();
        }
        return new FileInputStream(new File(objectKey));
    }

    /**
     * Executes MinIO putObject operation with proper configuration.
     *
     * @param client Configured MinIO client instance
     * @param bucket Target bucket name
     * @param fileKey Unique file identifier
     * @param stream Content input stream
     * @param ctx Processing context for metadata
     * @throws Exception If MinIO operation fails
     */
    private void performMinioUpload(MinioClient client,
                                    String bucket,
                                    UUID fileKey,
                                    InputStream stream,
                                    FilePipeContext ctx) throws Exception {
        client.putObject(
                PutObjectArgs.builder()
                        .bucket(bucket)
                        .object(fileKey.toString())
                        .stream(
                                stream,
                                ctx.getDto().getFile().getSize(),
                                -1
                        )
                        .contentType(ctx.getDto().getFile().getContentType())
                        .build()
        );
    }

    /**
     * Finalizes metadata with storage location details.
     *
     * @param ctx Processing context to update
     * @param bucket Storage bucket name
     * @param objectKey Final object identifier
     */
    private void persistStorageMetadata(FilePipeContext ctx, String bucket, String objectKey) {
        ctx.getMetadata().setBucket(bucket);
        ctx.getMetadata().setObjectKey(objectKey);
    }
}