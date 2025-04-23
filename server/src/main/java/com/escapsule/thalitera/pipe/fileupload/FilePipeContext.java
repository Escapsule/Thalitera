package com.escapsule.thalitera.pipe.fileupload;

import com.escapsule.thalitera.dto.FileUploadRequestDTO;
import com.escapsule.thalitera.entity.FileMetadata;
import com.escapsule.thalitera.vo.FileUploadResponseVO;
import io.minio.MinioClient;
import lombok.*;

@Getter
@Setter
public class FilePipeContext {
    private final FileUploadRequestDTO dto;
    private final MinioClient minioClient;
    private final String bucket;
    private FileMetadata metadata;
    private FileUploadResponseVO vo;
    private boolean isUploaded;

    public FilePipeContext(FileUploadRequestDTO dto, MinioClient client, String bucket) {
        this.dto = dto;
        this.minioClient = client;
        this.bucket = bucket;
        this.metadata = new FileMetadata();
        this.vo = new FileUploadResponseVO();
    }
}
