package com.escapsule.thalitera.service;

import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.exception.NotificationException;
import com.escapsule.thalitera.model.TemplateVariables;

public interface TemplateService {

    /**
     * Render the notification content according to the notification type and template variables.
     * <p>
     * This method first verifies whether the incoming template variables meet
     * the requirements of the notification type,and then renders the notification content
     * using the corresponding template engine according to the channel and
     * template path corresponding to the notification type.
     *
     * @param notifyType Notification type, including the template path and channel information.
     * @param variables Template variables, which are used to render notification content.
     * @return The notification content string after rendering.
     * @throws NotificationException If the notification channel does not support it, throw this exception.
     */
    String render(NotifyType notifyType, TemplateVariables variables);

}
