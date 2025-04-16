package com.escapsule.thalitera.controller.admin;

import com.escapsule.thalitera.dto.MeetingRoomUtilizationDTO;
import com.escapsule.thalitera.service.MeetingRoomStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin/statistics")
@RequiredArgsConstructor
public class AdminStatisticsController {

    private final MeetingRoomStatisticsService statisticsService;

    /**
     * Get the utilization statistics of all meeting rooms within a specified date range.
     * Example request:
     * GET /admin/statistics/meeting-room-utilization?startDate=2025-04-01T00:00:00Z&endDate=2025-04-30T23:59:59Z
     *
     * @param startDate the beginning of the date range (ISO format)
     * @param endDate the end of the date range (ISO format)
     * @return a list of meeting rooms with booked hours, available hours, and utilization rate
     */
    @GetMapping("/meeting-room-utilization")
    public List<MeetingRoomUtilizationDTO> getUtilization(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate
    ) {
        return statisticsService.getUtilizationReport(startDate, endDate);
    }
}
