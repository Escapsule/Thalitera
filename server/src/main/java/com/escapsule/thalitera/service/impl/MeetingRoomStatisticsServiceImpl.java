package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.dto.MeetingRoomUtilizationDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.mapper.ReservationMapper;
import com.escapsule.thalitera.service.MeetingRoomStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MeetingRoomStatisticsServiceImpl implements MeetingRoomStatisticsService {

    private final ReservationMapper reservationMapper;
    private final MeetingRoomMapper meetingRoomMapper;

    @Override
    public List<MeetingRoomUtilizationDTO> getUtilizationReport(OffsetDateTime start, OffsetDateTime end) {
        if (start.isAfter(end)) {
            throw new BaseException(ErrorCode.INVALID_TIME_RANGE);
        }
        // ✅ Fetch all meeting rooms from DB
        List<MeetingRoom> rooms = meetingRoomMapper.getAllMeetingRooms();
        List<MeetingRoomUtilizationDTO> results = new ArrayList<>();

        for (MeetingRoom room : rooms) {
            UUID roomId = room.getRoomId();

            double bookedHours = reservationMapper.getTotalBookedHours(roomId, start, end);
            double availableHours = countWorkdaysHours(start.toLocalDate(), end.toLocalDate());

            BigDecimal rate = (availableHours > 0)
                    ? BigDecimal.valueOf(bookedHours).divide(BigDecimal.valueOf(availableHours), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            results.add(new MeetingRoomUtilizationDTO(
                    roomId,
                    room.getName(),
                    bookedHours,
                    availableHours,
                    rate
            ));
        }

        return results;
    }

    // ✅ Helper to calculate available hours based on workdays (Mon–Fri)
    private long countWorkdaysHours(LocalDate start, LocalDate end) {
        long hours = 0;
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            DayOfWeek day = date.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                hours += 8;
            }
        }
        return hours;
    }
}
