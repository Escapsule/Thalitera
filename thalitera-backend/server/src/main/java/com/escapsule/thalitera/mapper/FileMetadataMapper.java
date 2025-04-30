package com.escapsule.thalitera.mapper;

import com.escapsule.thalitera.entity.FileMetadata;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface FileMetadataMapper {

    /**
     * Inserts a new record into the file_metadata table.
     *
     * @param fm The FileMetadata object containing the data to be inserted.
     */
    @Insert("INSERT INTO file_metadata " +
            "(file_key, original_name, content_type, size, sha256_hash, bucket, object_key, uploaded_by) " +
            "VALUES " +
            "(#{fileKey}, #{originalName}, #{contentType}, #{size}, #{sha256Hash}, #{bucket}, #{objectKey}, #{uploadedBy})")
    void insert(FileMetadata fm);

    /**
     * Retrieves a FileMetadata object based on the provided SHA-256 hash.
     *
     * @param hash The SHA-256 hash to search for.
     * @return The FileMetadata object associated with the provided hash, or null if not found.
     */
    @Select("SELECT * FROM file_metadata WHERE sha256_hash = #{hash} LIMIT 1")
    FileMetadata getDataByHash(String hash);
}
