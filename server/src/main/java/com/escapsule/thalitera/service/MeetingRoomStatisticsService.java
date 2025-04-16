package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.MeetingRoomUtilizationDTO;

import java.time.OffsetDateTime;
import java.util.List;

public interface MeetingRoomStatisticsService {
    List<MeetingRoomUtilizationDTO> getUtilizationReport(OffsetDateTime start, OffsetDateTime end);
}
