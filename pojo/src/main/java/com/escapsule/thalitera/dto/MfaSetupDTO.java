package com.escapsule.thalitera.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MfaSetupDTO {
    private String qrCode;
    private List<String> recoveryCodes;
}
