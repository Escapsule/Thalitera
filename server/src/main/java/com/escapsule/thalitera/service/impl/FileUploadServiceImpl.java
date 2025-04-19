package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.config.OssConfiguration;
import com.escapsule.thalitera.dto.FileUploadRequestDTO;
import com.escapsule.thalitera.pipe.fileupload.FilePipeContext;
import com.escapsule.thalitera.pipe.fileupload.FilePipeExecutor;
import com.escapsule.thalitera.service.FileUploadService;
import com.escapsule.thalitera.vo.FileUploadResponseVO;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FileUploadServiceImpl implements FileUploadService {

    private final MinioClient minioClient;
    private final FilePipeExecutor executor;
    private final OssConfiguration ossConfiguration;


    @Override
    public FileUploadResponseVO upload(FileUploadRequestDTO dto) {
        FilePipeContext ctx = new FilePipeContext(
                dto,
                minioClient,
                ossConfiguration.getBucket()
        );
        try {
            executor.execute(ctx);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return ctx.getVo();
    }
}
