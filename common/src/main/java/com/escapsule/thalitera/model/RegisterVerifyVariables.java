package com.escapsule.thalitera.model;

import com.escapsule.thalitera.json.RegisterVerifyContent;

public class RegisterVerifyVariables extends TemplateVariables {
    public RegisterVerifyVariables withRegisterInfo(RegisterVerifyContent content) {
        bind("verification_url", content.getVerifyURL());
        bind("email", content.getEmail());
        return this;
    }
}
