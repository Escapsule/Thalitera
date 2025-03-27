package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.entity.LoginHistory;
import com.escapsule.thalitera.mapper.LoginHistoryMapper;
import com.escapsule.thalitera.service.LoginHistoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoginHistoryServiceImpl implements LoginHistoryService {

    private final LoginHistoryMapper loginHistoryMapper;

    public LoginHistoryServiceImpl(LoginHistoryMapper loginHistoryMapper) {
        this.loginHistoryMapper = loginHistoryMapper;
    }


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
