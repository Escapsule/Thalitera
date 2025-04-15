package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.exception.EmailException;
import com.escapsule.thalitera.exception.NotificationException;
import com.escapsule.thalitera.model.TemplateVariables;
import com.escapsule.thalitera.service.NotificationService;
import com.escapsule.thalitera.service.Notifier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final List<Notifier> notifiers;

    /**
     * Send notification to user
     *
     * @param notifyType Notify type
     * @param userEmails target user emails
     * @param variables  template variables
     */
    @Override
    public void sendNotification(NotifyType notifyType,
                                 List<String> userEmails,
                                 TemplateVariables variables) {
        validateParameters(notifyType, variables);

        Notifier notifier = notifiers.stream()
                .filter(n -> n.supportsChannel(notifyType.getChannel()))
                .findFirst()
                .orElseThrow(() -> new NotificationException(
                        ErrorCode.NOTIFICATION_CHANNEL_UNSUPPORTED,
                        String.format("Current channel unsupported: %s", notifyType.getChannel()))
                );

        userEmails.forEach(email -> {
                    try {
                        notifier.notify(
                                email,
                                notifyType,
                                variables
                        );
                    } catch (EmailException e) {
                        log.error("Failed to send notification to user: {}", email, e);
                        throw new NotificationException(
                                ErrorCode.EMAIL_ERROR,
                                String.format("Failed to send notification to user: %s", email)
                        );
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
