package com.escapsule.thalitera.pipe.fileupload.steps;

import com.escapsule.thalitera.entity.FileMetadata;
import com.escapsule.thalitera.mapper.FileMetadataMapper;
import com.escapsule.thalitera.pipe.fileupload.FilePipeContext;
import com.escapsule.thalitera.pipe.fileupload.FilePipeStep;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Final persistence step that records file metadata in relational storage.
 * <p>
 * Executes as the sixth and final pipeline step ({@code @Order(6)}), this component:
 * <ul>
 *   <li>Enriches metadata with user context information</li>
 *   <li>Persists complete metadata record to database</li>
 *   <li>Serves as system of record for uploaded files</li>
 * </ul>
 * Uses MyBatis mapper interface for database operations with JDBC integration.
 *
 * @author General_K1ng
 * @since 2025-04-19
 */
@Component
@RequiredArgsConstructor
@Order(6)
public class RecordMetadataStep implements FilePipeStep {

    private final FileMetadataMapper fileMetadataMapper;

    /**
     * Executes metadata persistence process.
     * <p>
     * Implementation workflow:
     * <ol>
     *   <li>Retrieve aggregated metadata from processing context</li>
     *   <li>Enrich metadata with uploader identity from DTO</li>
     *   <li>Execute INSERT operation via MyBatis mapper</li>
     * </ol>
     *
     * @param ctx File processing context containing complete metadata
     * @throws Exception For these failure scenarios:
     *                   <ul>
     *                     <li>DataAccessException - database connectivity issues</li>
     *                     <li>NullPointerException - incomplete metadata state</li>
     *                     <li>TransactionException - ACID compliance failures</li>
     *                   </ul>
     */
    @Override
    @Transactional
    public void execute(FilePipeContext ctx) throws Exception {
        if (ctx.isUploaded()) {
            return;
        }
        FileMetadata fm = ctx.getMetadata();
        fm.setUploadedBy(ctx.getDto().getUploadedBy());
        fileMetadataMapper.insert(fm);
    }
}
