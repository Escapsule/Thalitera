package com.escapsule.thalitera.dto;

import com.baomidou.mybatisplus.annotation.TableField;
import com.escapsule.thalitera.handler.PgUUIDTypeHandler;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Data
public class MeetingRoomDTO {

    @TableField(value = "room_id", typeHandler = PgUUIDTypeHandler.class)
    private UUID roomId;

    @NotBlank
    private String name;

    @Positive
    private int capacityMin;

    @Positive
    private int capacityMax;

    @NotBlank
    private String building;

    @NotNull
    private Integer floor;

    private String status;

    private Map<String, Object> facilities;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

    private String image;
}
