package com.escapsule.thalitera.exception;

import com.escapsule.thalitera.enumeration.ErrorCode;

public class NotificationException extends BaseException {
    public NotificationException(ErrorCode errorCode) {
        super(errorCode);
    }

    public NotificationException(ErrorCode errorCode, String extraMessage) {
        super(errorCode.getCode(), extraMessage);
    }
}
