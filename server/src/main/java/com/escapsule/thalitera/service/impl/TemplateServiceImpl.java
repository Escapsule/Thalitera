package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.exception.NotificationException;
import com.escapsule.thalitera.model.TemplateVariables;
import com.escapsule.thalitera.service.TemplateService;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class TemplateServiceImpl implements TemplateService {

    private final TemplateEngine emailTemplateEngine;
    // TODO private final webTemplateEngine;

    public TemplateServiceImpl(TemplateEngine templateEngine) {
        this.emailTemplateEngine = templateEngine;
    }

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
    @Override
    public String render(NotifyType notifyType, TemplateVariables variables) {
        notifyType.validateVariables(variables);

        Context context = new Context();
        context.setVariables(variables.toMap());

        return switch (notifyType.getChannel()) {
            case EMAIL -> emailTemplateEngine.process(
                    notifyType.getTemplatePath(),
                    context
            );
//            case WEB_UI -> webTemplateEngine.process(
//                    notifyType.getTemplatePath(),
//                    context
//            );
            default -> throw new NotificationException(
                    ErrorCode.NOTIFICATION_CHANNEL_UNSUPPORTED,
                    String.format("Current channel unsupported: %s", notifyType.getChannel()));
        };
    }
}
