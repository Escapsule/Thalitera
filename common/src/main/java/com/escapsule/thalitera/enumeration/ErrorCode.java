package com.escapsule.thalitera.enumeration;

import lombok.Getter;

@Getter
public enum ErrorCode {


    // 1001 Parameter validation failed
    PARAM_ERROR(1001, "Parameter validation failed."),


    // 2000 ~ 2999 business logic related
    USER_NOT_FOUND(2001, "User does not exist."),
    EMAIL_ERROR(2002, "Email error."),


    // 3000 ~ 3999 database related


    // 5000 ~ 5999 system level error
    SYSTEM_BUSY(5000, "The system is busy, please try again later."),


    ;


    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

}