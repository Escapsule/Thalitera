package com.escapsule.thalitera.utils;

import lombok.RequiredArgsConstructor;
import nl.basjes.parse.useragent.UserAgent;
import nl.basjes.parse.useragent.UserAgentAnalyzer;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserAgentUtils {
    //  Create a global singleton parser (thread-safe)
    private final UserAgentAnalyzer UAA;

    public String parseBrowser(UserAgent userAgent) {
        String browserName = userAgent.getValue("AgentName");
        String browserVersion = userAgent.getValue("AgentVersion");
        return browserName + " " + browserVersion;
    }

    public String parseOS(UserAgent userAgent) {
        String osName = userAgent.getValue("OperatingSystemName");
        String osVersion = userAgent.getValue("OperatingSystemVersion");
        return osName + " " + osVersion;
    }

    public UserAgent parse(String userAgentString) {
        return UAA.parse(userAgentString);
    }
}
