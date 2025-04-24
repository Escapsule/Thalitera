package com.escapsule.thalitera.entity;

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
public class MfaRecoveryCode {
    private Long id;

    private UUID userId;

    private String codeHash;

    private boolean used;

    private OffsetDateTime createdAt;
}
