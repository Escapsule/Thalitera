package com.escapsule.thalitera.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FileUploadResponseVO {
    private String fileKey;
    private String url;
    private long size;
    private String sha256Hash;
}
