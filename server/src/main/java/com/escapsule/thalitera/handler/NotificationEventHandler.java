package com.escapsule.thalitera.handler;

import com.escapsule.thalitera.event.*;
import com.escapsule.thalitera.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
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
                event.getTargetUser(),
                event.buildVariables()
        );
    }

    @Async("notificationThreadPool")
    @EventListener
    public void handleForgetPasswordVerifyEvent(ForgetPasswordVerifyEvent event) {
        log.info("Successfully handle the forget password verification notification event: {}", event);
        notificationService.sendNotification(
                event.getNotifyType(),
                event.getTargetUser(),
                event.buildVariables()
        );
    }

    @Async("notificationThreadPool")
    @EventListener
    public void handleReservationInitAndCancelNotifyEvent(ReservationInitAndCancelNotifyEvent event) {
        log.info("Successfully handle the reservation init or cancel notification event: {}", event);
        notificationService.sendNotification(
                event.getNotifyType(),
                event.getTargetUser(),
                event.buildVariables()
        );
    }

    @Async("notificationThreadPool")
    @EventListener
    public void handleReservationUpdateNotifyEvent(ReservationUpdateNotifyEvent event) {
        log.info("Successfully handle the reservation update notification event: {}", event);
        notificationService.sendNotification(
                event.getNotifyType(),
                event.getTargetUser(),
                event.buildVariables()
        );
    }

    @Async("notificationThreadPool")
    @EventListener
    public void handleReservationRemindNotifyEvent(ReservationRemindNotifyEvent event) {
        log.info("Successfully handle the reservation remind notification event: {}", event);
        notificationService.sendNotification(
                event.getNotifyType(),
                event.getTargetUser(),
                event.buildVariables()
        );
    }
}
