package com.escapsule.thalitera.service;

import com.escapsule.thalitera.entity.LoginHistory;

public interface LoginHistoryService {


    /**
     * Add failed login attempt
     *
     * @param history login history
     */
    void addFailedAttempt(LoginHistory history);
}
