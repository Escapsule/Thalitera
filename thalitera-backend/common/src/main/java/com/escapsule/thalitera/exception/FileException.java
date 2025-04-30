package com.escapsule.thalitera.exception;

import com.escapsule.thalitera.enumeration.ErrorCode;

public class FileException extends BaseException {
    public FileException(int code, String message) {
        super(code, message);
    }

    public FileException(ErrorCode errorCode) {
        super(errorCode);
    }

    public FileException(ErrorCode errorCode, String additionalMessage) {
        super(errorCode.getCode(), additionalMessage + ": " + errorCode.getMessage());
    }
}
