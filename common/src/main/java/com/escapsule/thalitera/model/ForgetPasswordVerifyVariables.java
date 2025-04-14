package com.escapsule.thalitera.model;

public class ForgetPasswordVerifyVariables extends TemplateVariables {
    public ForgetPasswordVerifyVariables withCaptchaBase64(String captchaBase64) {
        bind("captcha_base64", captchaBase64);
        return this;
    }

    public ForgetPasswordVerifyVariables withEmail(String email) {
        bind("email", email);
        return this;
    }
}
