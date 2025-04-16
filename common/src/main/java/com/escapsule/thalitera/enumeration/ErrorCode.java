package com.escapsule.thalitera.enumeration;

import lombok.Getter;

@Getter
public enum ErrorCode {


    // 1001 Parameter validation failed
    PARAM_ERROR(1001, "Parameter validation failed."),


    // 2000 ~ 2999 business logic related

    // User 2000 ~ 2199
    USER_NOT_FOUND(2001, "User does not exist."),
    INVALID_PASSWORD_FORMAT(2002, "Invalid encoded password."),
    USER_EXIST(2003, "User exist."),
    USER_EMAIL_OR_TOKEN_INVALID(2004, "User email error or token expired."),
    USER_TOKEN_MISMATCH(2005, "User email verification token not equal."),
    USER_REGISTER_FAILED(2006, "User register failed, please try again."),
    USER_NOT_ACTIVE(2007, "User not active."),
    USER_PASSWORD_INCORRECT(2008, "User password incorrect."),
    USER_IP_ADDRESS_INVALID(2009, "User ip address invalid."),
    USER_AGENT_INVALID(2010, "User agent invalid."),
    USER_NOT_LOGIN(2011, "User not login"),
    EMAIL_VERIFICATION_FAILED(2012, "Email verification failed"),
    USER_NEW_PASSWORD_SAME_TO_OLD(2013, "New password cannot be the same as the old password."),
    INVALID_STATUS(2014, "Invalid user status."),
    USER_STATUS_SAME_TO_OLD(2015, "New status cannot be the same as the old status."),
    PERMISSION_DENIED(2016, "Permission denied."),

    // 2201 ~ 2399 meeting room related
    INVALID_TIME_RANGE(2201, "The start time should be before the end time."),
    CONFLICT_RESERVATION(2202, "The meeting room has been reserved during this time."),
    RESERVATION_NOT_FOUND(2203, "Reservation not found."),
    MEETING_ROOM_NOT_FOUND(2204, "Meeting room not found."),
    CAPACITY_ERROR(2205, "Invalid capacity setting."),
    MISSING_ROOM_ID(2206, "Missing room id."),
    MISSING_RESERVATION_ID(2207, "Missing reservation id."),

    //2401 ~ 2599 notification system related

    NOTIFICATION_CHANNEL_UNSUPPORTED(2401, "Notification channel unsupported."),
    EMAIL_ERROR(2402, "Email error."),


    // 2601 ~ 2699 security related
    CAPTCHA_GENERATION_FAILED(2601, "Captcha generation failed."),
    CAPTCHA_EXPIRED(2602, "Captcha expired."),
    CAPTCHA_INCORRECT(2603, "Captcha incorrect."),


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