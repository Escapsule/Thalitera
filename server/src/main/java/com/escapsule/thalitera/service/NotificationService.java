package com.escapsule.thalitera.service;

import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.model.TemplateVariables;

import java.util.List;
import java.util.UUID;

public interface NotificationService {

    /**
     * Send notification
     *
     * @param notifyType Notify type
     * @param users      Users
     * @param variables  Variables
     */
    void sendNotification(NotifyType notifyType,
                                 List<UUID> users,
                                 TemplateVariables variables);
}
