package com.escapsule.thalitera.constant;

public class UserStatusConstant {

    /**
     * Waiting for Email validation (new user)
     */
    public static final String PENDING = "pending";

    /**
     * Normal status
     */
    public static final String ACTIVE = "active";

    /**
     * The account was locked for too many login failure
     */
    public static final String LOCKED = "locked";

    /**
     * Manually banned by Admin
     */
    public static final String DISABLED = "disabled";

    /**
     * Admin account
     */
    public static final String ADMIN = "admin";
}
