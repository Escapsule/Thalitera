package com.escapsule.thalitera.json;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceFingerprint {
// TODO: If fields are required to be modified.
    private String browser;

    private String os;

    private String screen;

    private String fontsHash;

    private String gpu;

}
