package com.escapsule.thalitera.pipe.fileupload.steps;

import com.escapsule.thalitera.pipe.fileupload.FilePipeContext;
import com.escapsule.thalitera.pipe.fileupload.FilePipeStep;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Pipeline step responsible for generating unique identifiers for file processing.
 * <p>
 * This component executes as the second step in the file upload processing pipeline ({@code @Order(2)}).
 * It generates two critical pieces of metadata:
 * <ol>
 *   <li>A unique file key using UUID v4 for secure referencing</li>
 *   <li>Preservation of original filename for client-facing operations</li>
 * </ol>
 *
 * @author General_K1ng
 * @since 2025-04-19
 */
@Component
@Order(2)
public class GenerateUniqueKeyStep implements FilePipeStep {

    /**
     * Executes the metadata generation step in the file processing pipeline.
     * <p>
     * Performs two essential operations in sequence:
     * <ul>
     *   <li>Generates a RFC 4122-compliant UUID version 4 for unique file identification</li>
     *   <li>Preserves original filename from client upload for audit and display purposes</li>
     * </ul>
     *
     * @param ctx File processing context containing both business data (DTO) and system metadata
     * @throws Exception Implementing class may throw specific exceptions for error handling
     */
    @Override
    public void execute(FilePipeContext ctx) throws Exception {
        UUID uniqueKey = UUID.randomUUID();
        ctx.getMetadata().setFileKey(uniqueKey);
        ctx.getMetadata().setOriginalName(ctx.getDto().getFile().getOriginalFilename());
    }
}
