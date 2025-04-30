package com.escapsule.thalitera.json;

import com.escapsule.thalitera.utils.TokenUtils;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class RegisterVerifyContent extends Jsonb implements Serializable {
    private String email;
    private UUID uuid;
    private String verifyURL;

    public RegisterVerifyContent(String email, String baseUrl, UUID uuid) {
        this.email = email;
        this.uuid = uuid;
        this.verifyURL = baseUrl +
                "/user/verify?email=" + email +
                "&token=" + TokenUtils.generateShortToken();
    }

    public String getToken() {
        return verifyURL.split("token=")[1];
    }
}
