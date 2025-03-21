package com.escapsule.thalitera.service;

public interface EmailService {

    /**
     * Send an email with the specified parameters.
     *
     * @param to      The recipient's email address.
     * @param subject The subject of the email.
     * @param content The content of the email.
     */
    void sendMail(String to, String subject, String content);
}
