package com.escapsule.thalitera.task;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class BaseScheduledTask implements Runnable {
    public abstract String getTaskName();

    @Override
    public void run() {
        try {
            log.info("[Task] {} started...", getTaskName());
            executeTask();
            log.info("[Task] {} completed", getTaskName());
        } catch (Exception e) {
            log.error("[Task] {} failed: {}", getTaskName(), e.getMessage());
        }
    }

    protected abstract void executeTask();
}
