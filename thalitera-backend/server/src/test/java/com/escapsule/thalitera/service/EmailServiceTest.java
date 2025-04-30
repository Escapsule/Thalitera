package com.escapsule.thalitera.service;

import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.EmailException;
import com.escapsule.thalitera.properties.EmailProperties;
import com.escapsule.thalitera.service.impl.EmailServiceImpl;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.mockito.ArgumentCaptor;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = EmailServiceImpl.class)
class EmailServiceTest {

    @Autowired
    private EmailServiceImpl emailService;

    @MockitoBean
    private JavaMailSender mailSender;

    @MockitoBean
    private EmailProperties emailProperties;

    private MimeMessage mimeMessage;

    @BeforeEach
    void setUp() {
        Session session = Session.getInstance(new Properties());
        mimeMessage = new MimeMessage(session);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(emailProperties.getUsername()).thenReturn("noreply@thalitera.com");
        when(emailProperties.getHost()).thenReturn("smtp.thalitera.com");
    }

    @Test
    void sendMail_success_shouldInvokeJavaMailSender() throws Exception {

        emailService.sendMail("user@example.com", "Test Subject", "<p>Hello</p>");

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());

        MimeMessage sentMessage = captor.getValue();
        sentMessage.saveChanges();

        Object content = sentMessage.getContent();
        assertTrue(content instanceof jakarta.mail.internet.MimeMultipart);

        jakarta.mail.internet.MimeMultipart mp = (jakarta.mail.internet.MimeMultipart) content;

        String html = null;
        for (int i = 0; i < mp.getCount(); i++) {
            jakarta.mail.BodyPart part = mp.getBodyPart(i);
            String ct = part.getContentType().toLowerCase();
            if (ct.contains("text/html")) {
                html = (String) part.getContent();
                break;
            }
            Object inner = part.getContent();
            if (inner instanceof jakarta.mail.internet.MimeMultipart) {
                jakarta.mail.internet.MimeMultipart mp2 = (jakarta.mail.internet.MimeMultipart) inner;
                for (int j = 0; j < mp2.getCount(); j++) {
                    jakarta.mail.BodyPart p2 = mp2.getBodyPart(j);
                    if (p2.getContentType().toLowerCase().contains("text/html")) {
                        html = (String) p2.getContent();
                        break;
                    }
                }
                if (html != null) break;
            }
        }

        assertNotNull(html, "Find HTML");
        assertEquals("<p>Hello</p>", html);
    }

    @Test
    void sendMail_messagingException_shouldThrowEmailException() throws Exception {
        mimeMessage = spy(mimeMessage);
        // mailSender.createMimeMessage()
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        doThrow(new jakarta.mail.MessagingException("SMTP failure"))
                .when(mimeMessage).setFrom(any(jakarta.mail.Address.class));

        EmailException ex = assertThrows(EmailException.class, () ->
                emailService.sendMail("user@example.com", "Subject", "Body")
        );
        assertEquals(ErrorCode.EMAIL_ERROR.getCode(), ex.getCode());
        assertTrue(ex.getMessage().contains("SMTP failure"));
    }

}