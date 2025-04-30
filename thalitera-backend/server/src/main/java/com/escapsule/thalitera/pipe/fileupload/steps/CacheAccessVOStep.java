package com.escapsule.thalitera.pipe.fileupload.steps;

import com.escapsule.thalitera.config.OssConfiguration;
import com.escapsule.thalitera.pipe.fileupload.FilePipeContext;
import com.escapsule.thalitera.pipe.fileupload.FilePipeStep;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Final presentation layer step that generates access credentials and caches resources.
 * <p>
 * Executes as the seventh pipeline step ({@code @Order(7)}), this component:
 * <ul>
 *   <li>Constructs direct access URL for uploaded content</li>
 *   <li>Populates client-facing Value Object (VO) with access metadata</li>
 *   <li>Maintains Redis cache for URL access patterns</li>
 * </ul>
 * The 1-hour cache duration balances accessibility needs with storage costs.
 *
 * @author General_K1ng
 * @since 2025-04-19
 */
@Component
@RequiredArgsConstructor
@Order(7)
public class CacheAccessVOStep implements FilePipeStep {

    private static final String CACHE_KEY_PREFIX = "file:url:";
    private final OssConfiguration ossConfiguration;

    /**
     * Executes final presentation layer processing and caching.
     * <p>
     * Implementation workflow:
     * <ol>
     *   <li>Build direct access URL using OSS endpoint configuration</li>
     *   <li>Populate VO with:
     *     <ul>
     *       <li>Access URL</li>
     *       <li>File checksum</li>
     *       <li>Original file size</li>
     *       <li>File identifier</li>
     *     </ul>
     *   </li>
     *   <li>Cache URL in Redis with 1-hour expiration</li>
     * </ol>
     *
     * @param ctx Processing context containing metadata and VO container
     * @throws Exception For these failure scenarios:
     *                   <ul>
     *                     <li>ConfigurationException - Invalid OSS endpoint</li>
     *                     <li>NullPointerException - Incomplete metadata state</li>
     *                   </ul>
     */
    @Override
    public void execute(FilePipeContext ctx) throws Exception {
        String url = constructAccessUrl(ctx);
        populateValueObject(ctx, url);
    }

    /**
     * Constructs OSS access URL from configuration and context.
     *
     * @param ctx Processing context containing bucket and file key
     * @return Fully qualified access URL
     */
    private String constructAccessUrl(FilePipeContext ctx) {
        return ossConfiguration.getEndpoint() + "/"
                + ctx.getBucket() + "/"
                + ctx.getMetadata().getFileKey();
    }

    /**
     * Populates client-facing value object with access metadata.
     *
     * @param ctx Processing context containing VO
     * @param url Constructed access URL
     */
    private void populateValueObject(FilePipeContext ctx, String url) {
        ctx.getVo().setUrl(url);
        ctx.getVo().setSha256Hash(ctx.getMetadata().getSha256Hash());
        ctx.getVo().setSize(ctx.getMetadata().getSize());
        ctx.getVo().setFileKey(ctx.getMetadata().getFileKey().toString());
    }

}
