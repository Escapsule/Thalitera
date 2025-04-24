package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.NotifyChannel;
import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.model.TemplateVariables;
import com.escapsule.thalitera.service.EmailService;
import com.escapsule.thalitera.service.Notifier;
import com.escapsule.thalitera.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmailNotifier implements Notifier {

    private final EmailService emailService;
    private final TemplateService templateService;

    /**
     * Check if the notifier supports the specified channel.
     *
     * @param channel Notification channel
     * @return True if the notifier supports the specified channel, false otherwise.
     */
    @Override
    public boolean supportsChannel(NotifyChannel channel) {
        return channel == NotifyChannel.EMAIL;
    }

    /**
     * Execute the notification operation.
     *
     * @param userEmail Target user's email.
     * @param notifyType Notification type
     * @param variables Template parameters
     */
    @Override
    public void notify(String userEmail, NotifyType notifyType, TemplateVariables variables) {
        String content = templateService.render(notifyType, variables);

        emailService.sendMail(
                userEmail,
                notifyType.getDisplayName(),
                content);
    }

}
