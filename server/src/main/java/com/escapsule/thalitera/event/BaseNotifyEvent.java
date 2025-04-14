package com.escapsule.thalitera.event;

import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.model.TemplateVariables;
import org.springframework.context.ApplicationEvent;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public abstract class BaseNotifyEvent extends ApplicationEvent {
    private final OffsetDateTime timestamp;

    public BaseNotifyEvent(Object source) {
        super(source);
        this.timestamp = OffsetDateTime.now();
    }

    public abstract NotifyType getNotifyType();
    public abstract List<String> getTargetUserEmails();
    public abstract TemplateVariables buildVariables();
}
