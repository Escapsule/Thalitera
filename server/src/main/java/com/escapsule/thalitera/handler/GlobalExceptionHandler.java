package com.escapsule.thalitera.handler;

import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.validation.FieldError;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    //Handling business exceptions
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ApiResponse<?>> handleBusinessException(BaseException ex,
                                                                  WebRequest request) {
        ApiResponse<?> response = ApiResponse.error(ex.getCode(), ex.getMessage());
        log.error("Business Exceptions: {}", ex.getCode());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Handling parameter validation exceptions
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fieldError -> Optional.of(fieldError.getDefaultMessage())
                                .orElse("Invalid field value.")
                ));
        log.error("Parameter validation errors: {} ", errors);
        return ResponseEntity.badRequest().body(
                ApiResponse.error(ErrorCode.PARAM_ERROR.getCode(),
                        ErrorCode.PARAM_ERROR.getMessage(),
                        errors)
        );
    }

    //Handling other uncaught exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGlobalException(Exception ex) {
        log.error("System Exceptions: ", ex);
        return ResponseEntity.internalServerError().body(
                ApiResponse.error(500, "The system is busy, please try again later.")
        );
    }
}