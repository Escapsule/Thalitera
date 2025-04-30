package com.escapsule.thalitera.vo;

import com.escapsule.thalitera.json.DeviceFingerprint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginHistoryVO {

    private OffsetDateTime loginTime;

    private boolean success;

    private String failureReason;

    private TrustDeviceVO trustDevice;
}
