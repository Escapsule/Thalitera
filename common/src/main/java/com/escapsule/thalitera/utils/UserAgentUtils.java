package com.escapsule.thalitera.utils;

import nl.basjes.parse.useragent.UserAgent;
import nl.basjes.parse.useragent.UserAgentAnalyzer;

public class UserAgentUtils {
    //  Create a global singleton parser (thread-safe)
    private static final UserAgentAnalyzer uaa = UserAgentAnalyzer
            .newBuilder()
            .hideMatcherLoadStats()
            .withCache(10000)
            .build();

    public static String parseBrowser(UserAgent userAgent) {
        String browserName = userAgent.getValue("AgentName");
        String browserVersion = userAgent.getValue("AgentVersion");
        return browserName + " " + browserVersion;
    }

    public static String parseOS(UserAgent userAgent) {
        String osName = userAgent.getValue("OperatingSystemName");
        String osVersion = userAgent.getValue("OperatingSystemVersion");
        return osName + " " + osVersion;
    }

    public static UserAgent parse(String userAgentString) {
        return uaa.parse(userAgentString);
    }
}
