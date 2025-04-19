package com.escapsule.thalitera.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@TableName("file_metadata")
public class FileMetadata {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("file_key")
    private UUID fileKey;

    @TableField("original_name")
    private String originalName;

    @TableField("content_type")
    private String contentType;

    @TableField("size")
    private Long size;

    @TableField("sha256_hash")
    private String sha256Hash;

    @TableField("bucket")
    private String bucket;

    @TableField("object_key")
    private String objectKey;

    @TableField("created_at")
    private OffsetDateTime createdAt;

    @TableField("uploaded_by")
    private UUID uploadedBy;
}
