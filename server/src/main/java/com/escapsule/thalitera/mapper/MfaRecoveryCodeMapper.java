package com.escapsule.thalitera.mapper;

import com.escapsule.thalitera.entity.MfaRecoveryCode;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;
import java.util.UUID;

@Mapper
public interface MfaRecoveryCodeMapper {
    /**
     * Insert batch of recovery codes
     * @param codes list of recovery codes
     * @param userId user id
     */
    void insertBatch(List<String> codes, UUID userId);

    /**
     * Find valid recovery codes
     * @param userId user id
     * @return list of recovery codes
     */
    @Select("SELECT * FROM mfa_recovery_code " +
            "WHERE user_id = #{userId} AND used = FALSE")
    List<MfaRecoveryCode> findValidCodes(UUID userId);

    /**
     * Update recovery code as used
     * @param id recovery code id
     */
    @Update("UPDATE mfa_recovery_code SET used = TRUE WHERE id = #{id}")
    void updateCodeUsed(Long id);

    @Delete("DELETE FROM mfa_recovery_code WHERE user_id = #{userId}")
    void deleteByUserId(UUID userId);
}
