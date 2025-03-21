package com.escapsule.thalitera.enumeration;

import lombok.Getter;

@Getter
public enum ErrorCode {


    // 1001 Parameter validation failed
    PARAM_ERROR(1001, "Parameter validation failed."),


    // 2000 ~ 2999 business logic related
    USER_NOT_FOUND(2001, "User does not exist.");


    // 3000 ~ 3999 database related



    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

}