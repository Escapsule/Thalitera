package com.escapsule.thalitera.config;

import com.escapsule.thalitera.interceptor.AuthInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    public void addInterceptors(InterceptorRegistry registry) {
        // Register an interceptor to block all requests (excluding static resources).
        registry.addInterceptor(new AuthInterceptor())
                // Intercept all paths
                .addPathPatterns("/**")
                // exclusion path
                .excludePathPatterns(
                        "/user/login",
                        "/user/register",
                        "/user/verify",
                        "/user/forget-password/**",
                        "/public/**",
                        "/error",
                        "/static/**"
                );
    }
}
