package com.escapsule.thalitera.properties;


import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@ConfigurationProperties(prefix = "spring.mail")
@Component
public class EmailProperties {

    private String host;

    private String username;

    private String password;

    private String protocol;
}
