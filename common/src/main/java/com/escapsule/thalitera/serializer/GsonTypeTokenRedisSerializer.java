package com.escapsule.thalitera.serializer;

import com.google.gson.Gson;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.SerializationException;

import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;

public class GsonTypeTokenRedisSerializer<T> implements RedisSerializer<T> {

    private static final Gson GSON = new Gson();
    private final Type type;

    public GsonTypeTokenRedisSerializer(Type type) {
        this.type = type;
    }

    @Override
    public byte[] serialize(T t) throws SerializationException {
        if (t == null) return new byte[0];
        return GSON.toJson(t).getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public T deserialize(byte[] bytes) throws SerializationException {
        if (bytes == null || bytes.length == 0) return null;
        String json = new String(bytes, StandardCharsets.UTF_8);
        return GSON.fromJson(json, type);
    }
}
