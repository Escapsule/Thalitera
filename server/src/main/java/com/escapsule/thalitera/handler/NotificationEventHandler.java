package com.escapsule.thalitera.handler;

import com.escapsule.thalitera.event.RegisterVerifyEvent;
import com.escapsule.thalitera.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventHandler {
    private final NotificationService notificationService;

    @Async("notificationThreadPool")
    @TransactionalEventListener
    public void handleRegisterVerifyEvent(RegisterVerifyEvent event) {
        log.info("Successfully handle the registration verification notification event: {}", event);
        notificationService.sendNotification(
                event.getNotifyType(),
                event.getTargetUserEmails(),
                event.buildVariables()
        );
    }
}
