package com.escapsule.thalitera.event;

import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.json.RegisterVerifyContent;
import com.escapsule.thalitera.model.RegisterVerifyVariables;
import com.escapsule.thalitera.model.TemplateVariables;
import lombok.ToString;

import java.util.List;
import java.util.Objects;

@ToString
public class RegisterVerifyEvent extends BaseNotifyEvent {

    private final RegisterVerifyContent content;

    public RegisterVerifyEvent(Object source, RegisterVerifyContent content) {
        super(source);
        this.content = Objects.requireNonNull(content);
    }

    @Override
    public NotifyType getNotifyType() {
        return NotifyType.REGISTER_VERIFY_EMAIL;
    }

    @Override
    public List<String> getTargetUserEmails() {
        return List.of(content.getEmail());
    }

    @Override
    public TemplateVariables buildVariables() {
        return new RegisterVerifyVariables()
                .withRegisterInfo(content);
    }
}
