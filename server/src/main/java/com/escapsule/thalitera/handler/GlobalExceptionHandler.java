package com.escapsule.thalitera.handler;

import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.exception.NotificationException;
import com.escapsule.thalitera.response.ApiResult;
import jakarta.mail.MessagingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.CannotGetJdbcConnectionException;
import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
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

    //  Handling business exceptions
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ApiResult<?>> handleBusinessException(BaseException ex,
                                                                WebRequest request) {
        ApiResult<?> response = ApiResult.error(ex.getCode(), ex.getMessage());
        log.error("Business Exceptions: {}", ex.getCode());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Handling parameter validation exceptions
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResult<?>> handleValidationException(MethodArgumentNotValidException ex) {
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
                ApiResult.error(ErrorCode.PARAM_ERROR.getCode(),
                        ErrorCode.PARAM_ERROR.getMessage(),
                        errors)
        );
    }

    //  Handling email exceptions
    @ExceptionHandler(MessagingException.class)
    public ResponseEntity<ApiResult<?>> handleEmailException(MessagingException ex) {
        ApiResult<?> response = ApiResult.error(ErrorCode.EMAIL_ERROR.getCode(),
                ErrorCode.EMAIL_ERROR.getMessage() + ": " + ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    //  Handling notification exceptions
    @ExceptionHandler(NotificationException.class)
    public ResponseEntity<ApiResult<?>> handleNotificationException(NotificationException ex,
                                                                    WebRequest request) {
        ApiResult<?> response = ApiResult.error(ex.getCode(), ex.getMessage());
        log.error("The notification service is abnormal: code={}, msg={}", ex.getCode(), ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    //  Handling other uncaught exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResult<?>> handleGlobalException(Exception ex) {
        log.error("System Exceptions: ", ex);
        return ResponseEntity.internalServerError().body(
                ApiResult.error(ErrorCode.SYSTEM_BUSY.getCode(), ErrorCode.SYSTEM_BUSY.getMessage())
        );
    }

    // Handling HTTP method exceptions
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResult<?>> handleGlobalException(HttpRequestMethodNotSupportedException ex, WebRequest request) {
        ApiResult<?> response = ApiResult.error(HttpStatus.METHOD_NOT_ALLOWED.value(),
                HttpStatus.METHOD_NOT_ALLOWED.getReasonPhrase());
        log.error("HTTP method not supported: {}", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.METHOD_NOT_ALLOWED);
    }

    // Handling database connection exceptions
    @ExceptionHandler({
            CannotCreateTransactionException.class,
            CannotGetJdbcConnectionException.class
    })
    public ResponseEntity<ApiResult<?>> handleGlobalException(CannotCreateTransactionException ex, WebRequest request) {
        ApiResult<?> response = ApiResult.error(ErrorCode.DATABASE_CONNECTION_ERROR.getCode(),
                ErrorCode.DATABASE_CONNECTION_ERROR.getMessage());
        log.error("Database connection error: {}", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}