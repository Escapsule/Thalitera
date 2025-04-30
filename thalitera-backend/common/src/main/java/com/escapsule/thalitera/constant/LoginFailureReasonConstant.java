package com.escapsule.thalitera.constant;

public class LoginFailureReasonConstant {

    /**
     * Wrong password
     */
    public static final String INVALID_CREDENTIALS = "invalid_credentials";

    /**
     * Account is locked
     */
    public static final String ACCOUNT_LOCKED = "account_locked";

    /**
     * MFA verification code timeout
     */
    public static final String MFA_TIMEOUT = "mfa_timeout";

    /**
     * IP is in the blacklist
     */
    public static final String IP_BLACKLISTED = "ip_blacklisted";

    /**
     * Device is not trusted and does not pass the MFA verification
     */
    public static final String DEVICE_MISMATCH = "device_mismatch";

}
