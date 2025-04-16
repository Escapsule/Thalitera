package com.escapsule.thalitera.event;

import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.model.ForgetPasswordVerifyVariables;
import com.escapsule.thalitera.model.TemplateVariables;

import java.util.List;
import java.util.UUID;

public class ForgetPasswordVerifyEvent extends BaseNotifyEvent {
    private final String captchaBase64;

    private final UUID uuid;

    public ForgetPasswordVerifyEvent(Object source, String captchaBase64, UUID uuid) {
        super(source);
        this.captchaBase64 = captchaBase64;
        this.uuid = uuid;
    }

    @Override
    public NotifyType getNotifyType() {
        return NotifyType.FORGET_PASSWORD_VERIFY_EMAIL;
    }

    @Override
    public List<UUID> getTargetUser() {
        return List.of(uuid);
    }

    @Override
    public TemplateVariables buildVariables() {
        return new ForgetPasswordVerifyVariables()
                .withCaptchaBase64(captchaBase64)
                .withUuid(uuid);
    }
}
