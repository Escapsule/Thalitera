package com.escapsule.thalitera.exception;

import com.escapsule.thalitera.enumeration.ErrorCode;

public class EmailException extends BaseException{
    public EmailException(ErrorCode errorCode) {
        super(errorCode);
    }

    public EmailException(ErrorCode errorCode, String additionalMessage) {
        super(errorCode.getCode(), errorCode.getMessage() + ": " + additionalMessage);
    }
}
