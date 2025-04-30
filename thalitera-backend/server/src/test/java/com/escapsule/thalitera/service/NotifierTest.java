package com.escapsule.thalitera.service;

import com.escapsule.thalitera.enumeration.NotifyChannel;
import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.model.TemplateVariables;
import com.escapsule.thalitera.service.impl.EmailNotifier;
import com.escapsule.thalitera.service.EmailService;
import com.escapsule.thalitera.service.TemplateService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = EmailNotifier.class)
class NotifierTest {

    @Autowired
    private EmailNotifier notifier;

    @MockitoBean
    private EmailService emailService;

    @MockitoBean
    private TemplateService templateService;

    @Test
    void supportsChannel_onlyEmail() {
        assertTrue(notifier.supportsChannel(NotifyChannel.EMAIL));
        for (NotifyChannel ch : NotifyChannel.values()) {
            if (ch != NotifyChannel.EMAIL) {
                assertFalse(notifier.supportsChannel(ch));
            }
        }
    }

    @Test
    void notify_rendersTemplateAndSendsMail() {
        String to = "user@example.com";
        NotifyType type = NotifyType.REGISTER_VERIFY_EMAIL;
        TemplateVariables vars = mock(TemplateVariables.class);

        // stub template rendering
        when(templateService.render(type, vars)).thenReturn("<h1>Hello</h1>");

        // exercise
        notifier.notify(to, type, vars);

        // verify render then email
        verify(templateService).render(type, vars);
        verify(emailService).sendMail(
                eq(to),
                eq(type.getDisplayName()),
                eq("<h1>Hello</h1>")
        );
    }
}
