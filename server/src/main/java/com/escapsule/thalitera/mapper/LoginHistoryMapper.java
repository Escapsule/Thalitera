package com.escapsule.thalitera.mapper;

import com.escapsule.thalitera.dto.LoginHistoryQueryDTO;
import com.escapsule.thalitera.entity.LoginHistory;
import com.escapsule.thalitera.vo.LoginHistoryVO;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface LoginHistoryMapper {

    /**
     * Insert login history
     *
     * @param loginHistory login history
     */
    @Insert("INSERT INTO login_history (user_id, ip_address, device_fingerprint, success, failure_reason, location) " +
            "VALUES (#{userId}, #{ipAddress}, #{deviceFingerprint}, #{success}, #{failureReason}, #{location})")
    void insert(LoginHistory loginHistory);


    /**
     * Get last login history by fingerprint
     *
     * @param userId user id
     * @param dto login history query
     * @return login history
     */
    List<LoginHistoryVO> getLastByFingerprint(@Param("userId")UUID userId,
                                              @Param("dto")LoginHistoryQueryDTO dto);
}
