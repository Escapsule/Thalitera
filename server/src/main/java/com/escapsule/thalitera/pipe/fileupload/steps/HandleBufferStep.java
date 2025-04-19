package com.escapsule.thalitera.pipe.fileupload.steps;

import com.escapsule.thalitera.pipe.fileupload.FilePipeContext;
import com.escapsule.thalitera.pipe.fileupload.FilePipeStep;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

/**
 * File storage strategy handler that implements size-based buffering decisions.
 * <p>
 * Executes as the fourth step in the processing pipeline ({@code @Order(4)}), this component:
 * <ul>
 *   <li>Implements a tiered storage strategy based on file size threshold</li>
 *   <li>Manages in-memory buffering for small files (≤3MB)</li>
 *   <li>Handles temporary file creation for larger uploads</li>
 * </ul>
 * The 3MB threshold represents a balance between memory efficiency and I/O performance.
 *
 * @author General_K1ng
 * @since 2025-04-19
 */
@Component
@Order(4)
public class HandleBufferStep implements FilePipeStep {

    private static final long MAX_BUFFER_SIZE = 3L * 1024 * 1024;
    private static final String IN_MEMORY_PREFIX = "in-memory:";
    private static final String TEMP_UPLOAD_PREFIX = "upload-";
    private static final String TEMP_UPLOAD_SUFFIX = ".tmp";
    /**
     * Executes buffering strategy based on file size.
     * <p>
     * Implementation logic:
     * <ol>
     *   <li>For files ≤3MB:
     *     <ul>
     *       <li>Marks content for in-memory storage</li>
     *       <li>Uses UUID file key as identifier</li>
     *     </ul>
     *   </li>
     *   <li>For files >3MB:
     *     <ul>
     *       <li>Creates secure temporary file</li>
     *       <li>Streams content to disk</li>
     *       <li>Records filesystem path in metadata</li>
     *     </ul>
     *   </li>
     * </ol>
     *
     * @param ctx File processing context with upload data and metadata
     * @throws Exception in these cases:
     *                  <ul>
     *                    <li>IllegalStateException - if temp file creation fails</li>
     *                    <li>IOException - during file transfer operations</li>
     *                    <li>SecurityException - insufficient filesystem permissions</li>
     *                  </ul>
     */
    @Override
    public void execute(FilePipeContext ctx) throws Exception {
        MultipartFile file = ctx.getDto().getFile();
        if (file.getSize() < MAX_BUFFER_SIZE) {
            ctx.getMetadata().setObjectKey(IN_MEMORY_PREFIX + ctx.getMetadata().getFileKey());
        } else {
            File tmp = File.createTempFile(TEMP_UPLOAD_PREFIX, TEMP_UPLOAD_SUFFIX);
            file.transferTo(tmp);
            ctx.getMetadata().setObjectKey(tmp.getAbsolutePath());
        }
    }
}
