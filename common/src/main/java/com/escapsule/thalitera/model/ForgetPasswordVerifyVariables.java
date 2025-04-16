package com.escapsule.thalitera.model;

import java.util.UUID;

public class ForgetPasswordVerifyVariables extends TemplateVariables {
    public ForgetPasswordVerifyVariables withCaptchaBase64(String captchaBase64) {
        bind("captcha_base64", captchaBase64);
        return this;
    }

    public ForgetPasswordVerifyVariables withUuid(UUID uuid) {
        bind("uuid", uuid);
        return this;
    }
}
