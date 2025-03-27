package com.escapsule.thalitera.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.FlushMode;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

@Configuration
@EnableRedisHttpSession(
        flushMode = FlushMode.ON_SAVE,
        maxInactiveIntervalInSeconds = 3600,
        redisNamespace = "thalitera:session"     // Redis prefix
)
public class SessionConfiguration {

    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();

        // Set cookie name and domain name
        serializer.setCookieMaxAge(3600);
        serializer.setCookieName("THALITERA_SESSION_ID");
        serializer.setCookiePath("/");

        // security setting
        serializer.setUseHttpOnlyCookie(true);
        // TODO: NO HTTPS in dev env
        // serializer.setUseSecureCookie(true);   // Only transfer under HTTPS
        serializer.setSameSite("Lax");

        return serializer;
    }
}
