package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.LoginHistoryQueryDTO;
import com.escapsule.thalitera.entity.LoginHistory;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.mapper.LoginHistoryMapper;
import com.escapsule.thalitera.service.impl.LoginHistoryServiceImpl;
import com.escapsule.thalitera.vo.LoginHistoryVO;
import com.escapsule.thalitera.vo.TrustDeviceVO;
import com.jthinking.common.util.ip.IPInfoUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = LoginHistoryServiceImpl.class)
class LoginHistoryServiceTest {

    @Autowired
    private LoginHistoryService service;

    @MockitoBean
    private LoginHistoryMapper loginHistoryMapper;
    private UUID userId;
    private LoginHistoryQueryDTO query;
    private LoginHistory entity;
    private LoginHistoryVO vo;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        query = new LoginHistoryQueryDTO();
        query.setStartTime(OffsetDateTime.now().minusDays(1));
        query.setEndTime(OffsetDateTime.now().plusDays(1));

        entity = new LoginHistory();

        TrustDeviceVO td = TrustDeviceVO.builder()
                .ip("1.2.3.4")
                .location(null)
                .build();

        vo = LoginHistoryVO.builder()
                .loginTime(OffsetDateTime.now())
                .success(false)
                .failureReason("fail")
                .trustDevice(td)
                .build();
    }

    @Test
    void addFailedAttempt_shouldCallMapperInsert() {
        service.addFailedAttempt(entity);
        verify(loginHistoryMapper, times(1)).insert(eq(entity));
    }

    @Test
    void getLoginHistory_whenEmpty_shouldThrowBaseException() {
        when(loginHistoryMapper.getLastByFingerprint(eq(userId), eq(query)))
                .thenReturn(Collections.emptyList());

        BaseException ex = assertThrows(BaseException.class,
                () -> service.getLoginHistory(userId, query));
        assertEquals(ErrorCode.USER_DONT_HAVE_LOGIN_HISTORY.getCode(), ex.getCode());
    }


    @Test
    void getLoginHistory_whenNonEmpty_shouldReturnVoAndSetLocation() {
        when(loginHistoryMapper.getLastByFingerprint(eq(userId), eq(query)))
                .thenReturn(List.of(vo));

        List<LoginHistoryVO> result = service.getLoginHistory(userId, query);

        assertNotNull(result);
        assertEquals(1, result.size());

        LoginHistoryVO r = result.get(0);
        assertSame(vo, r);

        String ip = r.getTrustDevice().getIp();
        var info = IPInfoUtils.getIpInfo(ip);
        String expected = Optional.ofNullable(info)
                .map(i -> String.join(" ",
                        i.getCountry(),
                        i.getProvince(),
                        i.getAddress()))
                .orElse("");

        assertEquals(expected, r.getTrustDevice().getLocation());

        verify(loginHistoryMapper, times(1)).getLastByFingerprint(userId, query);
    }

}