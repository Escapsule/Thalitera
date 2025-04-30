package com.escapsule.thalitera.service;

import com.escapsule.thalitera.entity.Notification;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.enumeration.NotifyChannel;
import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.exception.EmailException;
import com.escapsule.thalitera.exception.NotificationException;
import com.escapsule.thalitera.mapper.NotificationMapper;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.model.TemplateVariables;
import com.escapsule.thalitera.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = NotificationServiceImpl.class)
class NotificationServiceTest {

    @Autowired
    private NotificationService service;

    @MockitoBean
    private NotificationMapper notificationMapper;

    @MockitoBean
    private UserMapper userMapper;

    @MockitoBean
    private Notifier notifier;

    private TemplateVariables variables;
    private UUID userId;
    private List<UUID> userIds;
    private User user;
    private NotifyType notifyType;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        userIds = List.of(userId);

        variables = mock(TemplateVariables.class);

        user = new User();
        user.setEmail("user@example.com");

        notifyType = mock(NotifyType.class);
        when(notifyType.getChannel()).thenReturn(NotifyChannel.EMAIL);
        when(notifyType.getTemplatePath()).thenReturn("dummy");
        doNothing().when(notifyType).validateVariables(any());
    }

    @Test
    void sendNotification_success_shouldCallBatchInsert() {
        // arrange
        when(userMapper.getUserById(userId)).thenReturn(user);
        when(notifier.supportsChannel(NotifyChannel.EMAIL)).thenReturn(true);

        // act
        service.sendNotification(notifyType, userIds, variables);

        // assert
        verify(notifier).notify(eq(user.getEmail()), eq(notifyType), eq(variables));
        verify(notificationMapper).batchInsert(anyList());
    }

    @Test
    void sendNotification_notifyFails_shouldFallbackToInsert() {
        // arrange
        when(userMapper.getUserById(userId)).thenReturn(user);
        when(notifier.supportsChannel(NotifyChannel.EMAIL)).thenReturn(true);

        doThrow(new RuntimeException("DB error")).when(notificationMapper).batchInsert(anyList());

        // act
        service.sendNotification(notifyType, userIds, variables);

        // assert
        verify(notificationMapper).batchInsert(anyList());
        verify(notificationMapper, atLeastOnce()).insert(any(Notification.class));
    }

    @Test
    void sendNotification_whenNoSupportedNotifier_shouldThrow() {
        // arrange
        when(notifier.supportsChannel(any())).thenReturn(false);

        // act + assert
        NotificationException ex = assertThrows(NotificationException.class, () ->
                service.sendNotification(notifyType, userIds, variables)
        );
        assertEquals(ErrorCode.NOTIFICATION_CHANNEL_UNSUPPORTED.getCode(), ex.getCode());
    }

    @Test
    void sendNotification_whenEmailException_shouldMarkFailed() {
        // arrange
        when(userMapper.getUserById(userId)).thenReturn(user);
        when(notifier.supportsChannel(NotifyChannel.EMAIL)).thenReturn(true);

        doThrow(new EmailException(ErrorCode.EMAIL_ERROR, "Email send fail"))
                .when(notifier).notify(anyString(), any(), any());


        // act
        service.sendNotification(notifyType, userIds, variables);

        // assert
        verify(notifier).notify(eq(user.getEmail()), eq(notifyType), eq(variables));
        verify(notificationMapper).batchInsert(argThat(list -> {
            Notification n = list.get(0);
            return "failed".equalsIgnoreCase(n.getStatus()) && n.getFailureReason() != null;
        }));
    }
}
