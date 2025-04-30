package com.escapsule.thalitera.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserLoginDTO {
    @NotNull
    private String email;
    @NotNull
    private String password;

    /**
     * TOTP code
     * could be null if not a new device
     */
    private String totpCode;

    /**
     * TOTP recovery code
     */
    private String recoveryCode;
}
