package com.escapsule.thalitera.task;

import com.escapsule.thalitera.constant.ScheduleTaskConstant;
import com.escapsule.thalitera.event.ReservationRemindNotifyEvent;
import com.escapsule.thalitera.mapper.ReservationMapper;
import com.escapsule.thalitera.properties.ConfigProperties;
import com.escapsule.thalitera.vo.ReservationVO;
import com.escapsule.thalitera.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RemindUserMeetingTask extends BaseScheduledTask {

    private final ReservationMapper reservationMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final ConfigProperties configProperties;

    @Override
    public String getTaskName() {
        return ScheduleTaskConstant.REMIND_USER_MEETING_IS_ABOUT_TO_START_TASK;
    }

    @Override
    protected void executeTask() {
        List<ReservationVO> reservations = reservationMapper.getReservationsByExactTime(
                OffsetDateTime.now(ZoneOffset.UTC)
                        .plusMinutes(40)
                        .truncatedTo(ChronoUnit.SECONDS)
        );
        reservations.forEach(reservation -> {
            List<UserVO> users = new ArrayList<>(reservation.getAttendees());
            List<UUID> targetUsers = new ArrayList<>(users.stream()
                    .map(UserVO::getUserId)
                    .toList());
            targetUsers.add(reservation.getUserId());
            eventPublisher.publishEvent(
                    new ReservationRemindNotifyEvent(
                            this,
                            reservation.getMeetingRoom().getName(),
                            reservation.getStartTime().toLocalDateTime(),
                            reservation.getEndTime().toLocalDateTime(),
                            ChronoUnit.MINUTES.between(
                                    reservation.getStartTime().toLocalDateTime(),
                                    reservation.getEndTime().toLocalDateTime()),
                            reservation.getMeetingRoom().getBuilding(),
                            Integer.parseInt(reservation.getMeetingRoom().getFloor()),
                            reservation.getUserName(),
                            reservation.getAttendees().stream().map(UserVO::getUsername).toList(),
                            targetUsers,
                            configProperties.getBaseUrl(),
                            reservation.getPurpose()
                    )
            );
        });

    }
}
