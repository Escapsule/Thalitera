package com.escapsule.thalitera.task;

import com.escapsule.thalitera.constant.ScheduleTaskConstant;
import com.escapsule.thalitera.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
@RequiredArgsConstructor
public class DeleteExpiredPendingUserTask extends BaseScheduledTask {

    private final UserMapper userMapper;

    @Override
    public String getTaskName() {
        return ScheduleTaskConstant.DELETE_EXPIRED_PENDING_USER_TASK;
    }

    @Override
    protected void executeTask() {
        userMapper.deleteExpiredPendingUser(OffsetDateTime.now().minusMinutes(10));
    }
}
