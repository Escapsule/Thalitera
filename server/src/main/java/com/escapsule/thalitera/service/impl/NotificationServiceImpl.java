package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.constant.NotificationStatusConstant;
import com.escapsule.thalitera.entity.Notification;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.exception.EmailException;
import com.escapsule.thalitera.exception.NotificationException;
import com.escapsule.thalitera.mapper.NotificationMapper;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.model.TemplateVariables;
import com.escapsule.thalitera.service.NotificationService;
import com.escapsule.thalitera.service.Notifier;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final List<Notifier> notifiers;
    private final UserMapper userMapper;
    private final NotificationMapper notificationMapper;

    /**
     * Send notification to user
     *
     * @param notifyType Notify type
     * @param users      target user emails
     * @param variables  template variables
     */
    @Override
    public void sendNotification(NotifyType notifyType,
                                 List<UUID> users,
                                 TemplateVariables variables) {
        validateParameters(notifyType, variables);

        Notifier notifier = notifiers.stream()
                .filter(n -> n.supportsChannel(notifyType.getChannel()))
                .findFirst()
                .orElseThrow(() -> new NotificationException(
                        ErrorCode.NOTIFICATION_CHANNEL_UNSUPPORTED,
                        String.format("Current channel unsupported: %s", notifyType.getChannel()))
                );

        List<Notification> notificationsToInsert = new ArrayList<>(users.size());

        users.forEach(uuid -> {
            String failureReason = null;
            String status = NotificationStatusConstant.PENDING;

            try {
                notifier.notify(
                        userMapper.getUserById(uuid).getEmail(),
                        notifyType,
                        variables
                );
                status = NotificationStatusConstant.SENT;
            } catch (EmailException e) {
                log.error("The notification failed to be sent to the user: {}", uuid, e);
                status = NotificationStatusConstant.FAILED;
                failureReason = StringUtils.truncate(e.getMessage(), 255);
            } finally {
                // Build a notification record object (without inserting it immediately).
                notificationsToInsert.add(buildNotification(
                        uuid,
                        notifyType,
                        variables,
                        status,
                        failureReason
                ));
            }
        });

        if (!notificationsToInsert.isEmpty()) {
            try {
                notificationMapper.batchInsert(notificationsToInsert);
                log.info("Success to batch insert notification: {}", notificationsToInsert.size());
            } catch (Exception e) {
                log.error("Batch insertion of notification records failed", e);
                fallbackInsert(notificationsToInsert);
            }
        }
    }

    /**
     * Build notification record
     *
     * @param recipient      target user email
     * @param notifyType     Notify type
     * @param variables      template variables
     * @param status         notification status
     * @param failureReason  failure reason
     * @return Notification record
     */
    private Notification buildNotification(UUID recipient,
                                           NotifyType notifyType,
                                           TemplateVariables variables,
                                           String status,
                                           String failureReason) {
        return Notification.builder()
                .type(notifyType.getChannel().getChannelCode())
                .recipient(recipient)
                .content(variables)
                .status(status)
                .failureReason(failureReason)
                .build();
    }

    /**
     * Fallback insert notification record
     *
     * @param notifications notification records
     */
    private void fallbackInsert(List<Notification> notifications) {
        notifications.forEach(notification -> {
            try {
                notificationMapper.insert(notification);
            } catch (Exception ex) {
                log.error("Failure to insert the downgrade single entry user: {}", notification.getRecipient(), ex);
            }
        });
    }

    /**
     * Validate parameters
     *
     * @param type       Notify type
     * @param variables  template variables
     */
    private void validateParameters(NotifyType type, TemplateVariables variables) {
        type.validateVariables(variables);
    }
}
