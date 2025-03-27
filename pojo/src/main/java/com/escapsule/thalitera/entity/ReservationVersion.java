package com.escapsule.thalitera.entity;

import com.escapsule.thalitera.json.BookingHistorySnapshot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationVersion {

    private long versionId;

    private String reservationId;

    /**
     * Save the snapshot of the reservation at the time of operation
     */
    private BookingHistorySnapshot snapshot;

    /**
     * Operation type<br>
     * create: Create a new reservation<br>
     * update: Update an existing reservation<br>
     * delete: Delete an existing reservation<br>
     * See {@link com.escapsule.thalitera.constant.OperationTypeConstant}
     */
    private String operationType;

    /**
     * Operated by user ID
     */
    private String operatedBy;

    private OffsetDateTime operatedAt;

}
