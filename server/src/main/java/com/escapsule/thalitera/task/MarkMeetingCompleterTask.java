package com.escapsule.thalitera.task;

import com.escapsule.thalitera.constant.ReservationStatusConstant;
import com.escapsule.thalitera.constant.ScheduleTaskConstant;
import com.escapsule.thalitera.mapper.ReservationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Component
@RequiredArgsConstructor
public class MarkMeetingCompleterTask extends BaseScheduledTask {

    private final ReservationMapper reservationMapper;

    @Override
    public String getTaskName() {
        return ScheduleTaskConstant.MARK_COMPLETED_MEETING_TASK;
    }

    @Override
    protected void executeTask() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        reservationMapper.updateReservationCompletedBefore(now, ReservationStatusConstant.COMPLETED);
    }
}
