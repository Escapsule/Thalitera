package com.escapsule.thalitera.enumeration;

import com.escapsule.thalitera.model.*;
import lombok.Getter;

@Getter
public enum NotifyType {
    REGISTER_VERIFY_EMAIL(
            "[Thalitera] Verify your email address",
            NotifyChannel.EMAIL,
            "registration-verification-template",
            RegisterVerifyVariables.class
            ),
    FORGET_PASSWORD_VERIFY_EMAIL(
            "[Thalitera] Reset your password",
            NotifyChannel.EMAIL,
            "forget-password-verification-template",
            ForgetPasswordVerifyVariables.class
            ),
    RESERVATION_INIT_EMAIL(
            "[Thalitera] Check your new reservation",
            NotifyChannel.EMAIL,
            "reservation-init-notification-template",
            ReservationInitAndCancelNotifyVariables.class
            ),
    RESERVATION_UPDATE_EMAIL(
            "[Thalitera] Your reservation has been updated",
            NotifyChannel.EMAIL,
            "reservation-update-notification-template",
            ReservationUpdateNotifyVariables.class
            ),
    RESERVATION_CANCEL_EMAIL(
            "[Thalitera] Your reservation has been canceled",
            NotifyChannel.EMAIL,
            "reservation-cancel-notification-template",
            ReservationInitAndCancelNotifyVariables.class
            ),
    RESERVATION_REMIND_EMAIL(
            "[Thalitera] Your reservation is about to start",
            NotifyChannel.EMAIL,
            "reservation-remind-notification-template",
            ReservationRemindNotifyVariables.class
            ),
    ;

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
