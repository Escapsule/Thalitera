package com.escapsule.thalitera.response;


import java.io.Serializable;
import java.time.Instant;
import java.util.Map;

public record ApiResult<T>(int code, String message, T data, Instant timestamp) implements Serializable {

    public static <T> ApiResult<T> success() {
        return new ApiResult<>(200, "Success", null, Instant.now());
    }

    public static <T> ApiResult<T> success(T data) {
        return new ApiResult<>(200, "Success", data, Instant.now());
    }

    public static ApiResult<?> error(int code, String message) {
        return new ApiResult<>(code, message, null, Instant.now());
    }

    public static ApiResult<?> error(int code, String message, Map<String, String> errors) {
        return new ApiResult<>(code, message, errors, Instant.now());
    }
}