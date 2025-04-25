package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.EmailException;
import com.escapsule.thalitera.properties.EmailProperties;

import org.springframework.mail.MailSendException;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.Multipart;
import jakarta.mail.BodyPart;
import jakarta.mail.Message.RecipientType;
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
        // 调用业务
        emailService.sendMail("user@example.com", "Test Subject", "<p>Hello</p>");

        // 捕获 send(...) 传进去的 MimeMessage
        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());

        // 声明并初始化 sentMessage
        MimeMessage sentMessage = captor.getValue();
        sentMessage.saveChanges();

        // 取最外层 content
        Object content = sentMessage.getContent();
        assertTrue(content instanceof jakarta.mail.internet.MimeMultipart);

        jakarta.mail.internet.MimeMultipart mp = (jakarta.mail.internet.MimeMultipart) content;

        // 遍历所有 part，找到 text/html
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

        assertNotNull(html, "应该能找到 HTML 部分");
        assertEquals("<p>Hello</p>", html);
    }



    @Test
    void sendMail_messagingException_shouldThrowEmailException() throws Exception {
        // 将 mimeMessage 换成 spy
        mimeMessage = spy(mimeMessage);
        // mailSender.createMimeMessage() 返回这个 spy
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        // stub spy 的 setFrom(Address) 抛 MessagingException
        doThrow(new jakarta.mail.MessagingException("SMTP failure"))
                .when(mimeMessage).setFrom(any(jakarta.mail.Address.class));

        // 调用：helper.setFrom(...) 底层就会触发上面这个异常
        EmailException ex = assertThrows(EmailException.class, () ->
                emailService.sendMail("user@example.com", "Subject", "Body")
        );

        assertEquals(ErrorCode.EMAIL_ERROR.getCode(), ex.getCode());
        assertTrue(ex.getMessage().contains("SMTP failure"));
    }


}