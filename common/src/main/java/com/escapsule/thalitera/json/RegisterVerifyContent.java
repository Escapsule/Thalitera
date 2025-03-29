package com.escapsule.thalitera.json;

import com.escapsule.thalitera.utils.TokenUtils;
import lombok.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.Serializable;

@EqualsAndHashCode(callSuper = true)
@Data
public class RegisterVerifyContent extends NotifyContent implements Serializable {
    private String email;
    private String verifyUrl;

    public RegisterVerifyContent(String email, String verifyUrl) {
        this.email = email;
        this.verifyUrl = verifyUrl + "?email=" + email + "&token=" + TokenUtils.generateShortToken();
    }

    public String getToken() {
        return verifyUrl.split("token=")[1];
    }
}
