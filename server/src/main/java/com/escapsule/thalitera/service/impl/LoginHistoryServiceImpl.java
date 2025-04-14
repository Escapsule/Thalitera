package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.entity.LoginHistory;
import com.escapsule.thalitera.mapper.LoginHistoryMapper;
import com.escapsule.thalitera.service.LoginHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LoginHistoryServiceImpl implements LoginHistoryService {

    private final LoginHistoryMapper loginHistoryMapper;

    /**
     * Add failed login history
     *
     * @param history login history
     */
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void addFailedAttempt(LoginHistory history) {
        loginHistoryMapper.insert(history);
    }
}
