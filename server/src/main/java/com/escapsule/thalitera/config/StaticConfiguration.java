package com.escapsule.thalitera.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Data
public class StaticConfiguration {
    @Value("${spring.mail.url}")
    private String verifyUrl;


}