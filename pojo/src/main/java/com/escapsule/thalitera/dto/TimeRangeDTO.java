package com.escapsule.thalitera.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TimeRangeDTO {
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
}
