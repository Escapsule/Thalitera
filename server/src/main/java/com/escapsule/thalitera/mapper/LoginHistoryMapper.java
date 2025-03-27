package com.escapsule.thalitera.mapper;

import com.escapsule.thalitera.entity.LoginHistory;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface LoginHistoryMapper {

    @Insert("INSERT INTO login_history (user_id, ip_address, device_fingerprint, success, failure_reason, location) " +
            "VALUES (#{userId}, #{ipAddress}, #{deviceFingerprint}, #{success}, #{failureReason}, #{location})")
    void insert(LoginHistory loginHistory);
}
