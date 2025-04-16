package com.escapsule.thalitera.enumeration;

import lombok.Getter;

@Getter
public enum NotifyChannel {
    EMAIL("email"),
    WEB_PUSH("web"),
    // TODO: add more channels
    SMS("sms");

    private final String channelCode;

    NotifyChannel(String channelCode) {
        this.channelCode = channelCode;
    }

    public String templatePrefix() {
        return channelCode + "/";
    }
}
