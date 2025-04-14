package com.escapsule.thalitera.enumeration;

public enum NotifyChannel {
    EMAIL("email"),
    WEB_PUSH("web"),
    SMS("sms");

    private final String channelCode;

    NotifyChannel(String channelCode) {
        this.channelCode = channelCode;
    }

    public String templatePrefix() {
        return channelCode + "/";
    }
}
