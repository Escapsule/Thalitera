package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.EmailException;
import com.escapsule.thalitera.properties.EmailProperties;
import com.escapsule.thalitera.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    // Inject the JavaMailSender and EmailProperties objects
    private final JavaMailSender mailSender;
    private final EmailProperties emailProperties;

    /**
     * Send an email with the specified parameters.
     *
     * @param to      The recipient's email address.
     * @param subject The subject of the email.
     * @param content The content of the email.
     * <p>
     * This method uses the JavaMailSender interface and the MimeMessageHelper class to construct and send messages
     * It sets the sender, recipient, subject, and body of the email, and handles exceptions during email delivery
     * If the message is sent successfully, it logs a success message; if it fails, it logs an error message and throws a custom exception
     */
    @Override
    public void sendMail(String to, String subject, String content) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

            helper.setFrom(emailProperties.getUsername());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);

            mailSender.send(msg);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", to, e);
            throw new EmailException(ErrorCode.EMAIL_ERROR, e.getMessage());
        }
    }
}
