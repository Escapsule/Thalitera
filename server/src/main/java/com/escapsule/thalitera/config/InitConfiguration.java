package com.escapsule.thalitera.config;

import com.escapsule.thalitera.adapter.InstantTypeAdapter;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import nl.basjes.parse.useragent.UserAgentAnalyzer;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;

@Configuration
public class InitConfiguration {

    /**
     * Create and configure a UserAgentAnalyzer instance.
     * <p>
     * This method uses Spring's @Bean annotation to provide
     * an instance of UserAgentAnalyzer to the Spring container.
     * UserAgentAnalyzer is used to parse the user agent string to
     * determine the client's operating system, browser, and other information.
     *
     * @return An instance of UserAgentAnalyzer,
     * which has been configured with a cache size and hidden matching load statistics information.
     */
    @Bean
    public UserAgentAnalyzer userAgentAnalyzer() {
        return UserAgentAnalyzer.newBuilder()
                .hideMatcherLoadStats()
                .withCache(10000)
                .build();
    }
}
