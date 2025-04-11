package com.escapsule.thalitera.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {

    private String reservationId;

    private String roomId;

    @NotBlank
    private String userId;

    private List<String> attendees;

    private Integer attendeesCount;

    private String purpose;

    @Future
    public OffsetDateTime startTime;

    @Future
    public OffsetDateTime endTime;

    public Object facilities;

    public String building;

    public Integer floor;
}
