package com.escapsule.thalitera.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrustDeviceVO {
    private String browser;
    private String os;
    private String ip;
    private String fingerprint;
    private String location;
}
