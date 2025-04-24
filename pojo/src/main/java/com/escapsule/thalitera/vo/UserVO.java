package com.escapsule.thalitera.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserVO implements Serializable {
    private UUID userId;
    private String avatar;
    private String username;
    private String email;
    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
