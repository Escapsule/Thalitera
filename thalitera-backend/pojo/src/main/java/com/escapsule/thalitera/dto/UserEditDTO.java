package com.escapsule.thalitera.dto;

import com.baomidou.mybatisplus.annotation.TableField;
import com.escapsule.thalitera.handler.PgUUIDTypeHandler;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserEditDTO {
    @NotNull
    @TableField(value = "user_id", typeHandler = PgUUIDTypeHandler.class)
    private UUID userId;
    @NotBlank
    private String status;
}
