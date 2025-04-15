package com.escapsule.thalitera.dto;

import com.baomidou.mybatisplus.annotation.TableField;
import com.escapsule.thalitera.handler.PgUUIDTypeHandler;
import jakarta.validation.constraints.Future;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {

    @TableField(value = "reservation_id", typeHandler = PgUUIDTypeHandler.class)
    private UUID reservationId;

    @TableField(value = "room_id", typeHandler = PgUUIDTypeHandler.class)
    private UUID roomId;

    @TableField(value = "user_id", typeHandler = PgUUIDTypeHandler.class)
    private UUID userId;

    private List<String> attendees;

    private Integer attendeesCount;

    private String purpose;

    @Future
    private OffsetDateTime startTime;

    @Future
    private OffsetDateTime endTime;

    private LinkedHashMap<String, Object> facilities;

    private String building;

    private Integer floor;
}
