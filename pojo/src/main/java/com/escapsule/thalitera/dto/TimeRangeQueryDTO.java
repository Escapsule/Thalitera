package com.escapsule.thalitera.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TimeRangeQueryDTO {
    private UUID roomId;
    private OffsetDateTime dateTime;
}
