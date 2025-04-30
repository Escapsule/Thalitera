package com.escapsule.thalitera.config;


import com.escapsule.thalitera.serializer.GsonTypeTokenRedisSerializer;
import com.google.gson.reflect.TypeToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.lang.reflect.Type;
import java.util.List;

@Slf4j
@Configuration
public class RedisConfiguration {
    @Bean
    public RedisTemplate<String, List<String>> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, List<String>> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory);
        redisTemplate.setKeySerializer(new StringRedisSerializer());

        Type type = new TypeToken<List<String>>() {}.getType();
        redisTemplate.setValueSerializer(new GsonTypeTokenRedisSerializer<>(type));

        return redisTemplate;
    }
}