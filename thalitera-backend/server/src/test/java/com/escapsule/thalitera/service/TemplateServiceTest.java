package com.escapsule.thalitera.service;

import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.enumeration.NotifyChannel;
import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.exception.NotificationException;
import com.escapsule.thalitera.model.RegisterVerifyVariables;
import com.escapsule.thalitera.model.TemplateVariables;
import com.escapsule.thalitera.service.impl.TemplateServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = TemplateServiceImpl.class)
class TemplateServiceTest {

    @Autowired
    private TemplateService service;

    @MockitoBean
    private TemplateEngine emailTemplateEngine;

    private TemplateVariables vars;
    private NotifyType emailType;
    private NotifyType nonEmailType;

    @BeforeEach
    void setUp() {
        vars = mock(TemplateVariables.class);
        when(vars.toMap()).thenReturn(Map.of("foo", "bar"));

        emailType = mock(NotifyType.class);
        when(emailType.getChannel()).thenReturn(NotifyChannel.EMAIL);
        when(emailType.getTemplatePath()).thenReturn("dummyPath");
        doNothing().when(emailType).validateVariables(any());

        nonEmailType = mock(NotifyType.class);
        when(nonEmailType.getChannel()).thenReturn(NotifyChannel.WEB_PUSH);
        when(nonEmailType.getTemplatePath()).thenReturn("dummyWebPath");
        doNothing().when(nonEmailType).validateVariables(any());
    }



    @Test
    void render_email_callsTemplateEngine() {
        String tplPath = emailType.getTemplatePath();
        when(emailTemplateEngine.process(eq(tplPath), any(Context.class)))
                .thenReturn("<html>ok</html>");

        String out = service.render(emailType, vars);

        assertEquals("<html>ok</html>", out);
        verify(emailTemplateEngine).process(eq(tplPath), any(Context.class));
    }

    @Test
    void render_nonEmail_throwsNotificationException() {
        if (nonEmailType == null) {
            return;
        }
        NotificationException ex = assertThrows(NotificationException.class,
                () -> service.render(nonEmailType, vars));
        assertEquals(ErrorCode.NOTIFICATION_CHANNEL_UNSUPPORTED.getCode(), ex.getCode());
    }
}
