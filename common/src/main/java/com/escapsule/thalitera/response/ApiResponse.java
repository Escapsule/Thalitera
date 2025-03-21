package com.escapsule.thalitera.response;


import java.time.Instant;
import java.util.Map;

public record ApiResponse<T>(int code, String message, T data, Instant timestamp) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "Success", data, Instant.now());
    }

    public static ApiResponse<?> error(int code, String message) {
        return new ApiResponse<>(code, message, null, Instant.now());
    }

    public static ApiResponse<?> error(int code, String message, Map<String, String> errors) {
        return new ApiResponse<>(code, message, errors, Instant.now());
    }
}