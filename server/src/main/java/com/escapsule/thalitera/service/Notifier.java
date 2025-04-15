package com.escapsule.thalitera.service;

import com.escapsule.thalitera.enumeration.NotifyChannel;
import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.model.TemplateVariables;

public interface Notifier {

    /**
     * Check if the notifier supports the specified channel.
     *
     * @param channel Notification channel
     * @return True if the notifier supports the specified channel, false otherwise.
     */
    boolean supportsChannel(NotifyChannel channel);

    /**
     * Execute the notification operation.
     *
     * @param userEmail Target user's email.
     * @param notifyType Notification type
     * @param variables Template parameters
     */
    void notify(String userEmail, NotifyType notifyType, TemplateVariables variables);
}