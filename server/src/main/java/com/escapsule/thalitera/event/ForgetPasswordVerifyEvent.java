package com.escapsule.thalitera.event;

import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.model.ForgetPasswordVerifyVariables;
import com.escapsule.thalitera.model.TemplateVariables;

import java.util.List;

public class ForgetPasswordVerifyEvent extends BaseNotifyEvent {
    private final String captchaBase64;

    private final String email;

    public ForgetPasswordVerifyEvent(Object source, String captchaBase64, String email) {
        super(source);
        this.captchaBase64 = captchaBase64;
        this.email = email;
    }

    @Override
    public NotifyType getNotifyType() {
        return NotifyType.FORGET_PASSWORD_VERIFY_EMAIL;
    }

    @Override
    public List<String> getTargetUserEmails() {
        return List.of(email);
    }

    @Override
    public TemplateVariables buildVariables() {
        return new ForgetPasswordVerifyVariables()
                .withCaptchaBase64(captchaBase64)
                .withEmail(email);
    }
}
