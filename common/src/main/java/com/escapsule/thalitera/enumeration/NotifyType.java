package com.escapsule.thalitera.enumeration;

import com.escapsule.thalitera.model.RegisterVerifyVariables;
import com.escapsule.thalitera.model.TemplateVariables;
import lombok.Getter;

@Getter
public enum NotifyType {
    REGISTER_VERIFY_EMAIL(
            "[Thalitera] Verify your email address",
            NotifyChannel.EMAIL,
            "registration-verification-template",
            RegisterVerifyVariables.class
            );

    private final String displayName;
    private final NotifyChannel channel;
    private final String templateName;
    private final Class<? extends TemplateVariables> variablesClass;

    <T extends TemplateVariables> NotifyType(String displayName,
                                             NotifyChannel channel,
                                             String templateName,
                                             Class<T> variablesClass) {
        this.displayName = displayName;
        this.channel = channel;
        this.templateName = templateName;
        this.variablesClass = variablesClass;
    }

    public String getTemplatePath() {
        return channel.templatePrefix() + templateName;
    }

    public void validateVariables(TemplateVariables variables) {
        if (!variablesClass.isInstance(variables)) {
            throw new IllegalArgumentException("Invalid variables type for " + this.name() +
                    ", expected: " + variablesClass.getSimpleName());
        }
    }
}
