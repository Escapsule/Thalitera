package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.LoginHistoryQueryDTO;
import com.escapsule.thalitera.entity.LoginHistory;
import com.escapsule.thalitera.vo.LoginHistoryVO;

import java.util.List;
import java.util.UUID;

public interface LoginHistoryService {

    /**
     * Add failed login attempt
     *
     * @param history login history
     */
    void addFailedAttempt(LoginHistory history);

    /**
     * Get user login history
     *
     * @param userId user id
     * @param dto login history query
     * @return List of LoginHistoryVO
     */
    List<LoginHistoryVO> getLoginHistory(UUID userId, LoginHistoryQueryDTO dto);
}
