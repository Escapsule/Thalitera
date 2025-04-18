package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.dto.LoginHistoryQueryDTO;
import com.escapsule.thalitera.entity.LoginHistory;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.mapper.LoginHistoryMapper;
import com.escapsule.thalitera.service.LoginHistoryService;
import com.escapsule.thalitera.vo.LoginHistoryVO;
import com.jthinking.common.util.ip.IPInfoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoginHistoryServiceImpl implements LoginHistoryService {

    private final LoginHistoryMapper loginHistoryMapper;

    /**
     * Add failed login history
     *
     * @param history login history
     */
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void addFailedAttempt(LoginHistory history) {
        loginHistoryMapper.insert(history);
    }

    /**
     * Get login history
     *
     * @param userId user id
     * @param dto    login history query dto
     * @return login history list
     */
    @Override
    public List<LoginHistoryVO> getLoginHistory(UUID userId, LoginHistoryQueryDTO dto) {
        List<LoginHistoryVO> voList = loginHistoryMapper.getLastByFingerprint(userId, dto);
        if (voList.isEmpty()) {
            throw new BaseException(ErrorCode.USER_DONT_HAVE_LOGIN_HISTORY);
        }
        voList.forEach(vo -> vo.getTrustDevice().setLocation(
                    Optional.ofNullable(IPInfoUtils.getIpInfo(vo.getTrustDevice().getIp()))
                    .map(ipInfo -> String.join(" ",
                            ipInfo.getCountry(),
                            ipInfo.getProvince(),
                            ipInfo.getAddress()))
                    .orElse("")
            )
        );
        return voList;
    }
}
