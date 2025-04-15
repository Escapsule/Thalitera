package com.escapsule.thalitera.service;

import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.model.TemplateVariables;

import java.util.List;

public interface NotificationService {

    /**
     * Send notification
     *
     * @param notifyType Notify type
     * @param userEmails User emails
     * @param variables  Variables
     */
    void sendNotification(NotifyType notifyType,
                                 List<String> userEmails,
                                 TemplateVariables variables);
}
