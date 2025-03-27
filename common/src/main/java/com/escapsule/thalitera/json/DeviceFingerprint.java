package com.escapsule.thalitera.json;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceFingerprint extends Jsonb implements Serializable {
// TODO: If fields are required to be modified.
    private String browser;

    private String os;
}
