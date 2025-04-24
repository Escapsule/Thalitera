package com.escapsule.thalitera.handler;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.postgresql.util.PGobject;

import java.lang.reflect.Field;
import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

public class PGMeetingRoomFacilitiesMapTypeHandler extends BaseTypeHandler<Map<String, Object>> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i,
                                    Map<String, Object> parameter, JdbcType jdbcType)
            throws SQLException {
        PGobject pgObject = new PGobject();
        pgObject.setType("jsonb");
        pgObject.setValue(serialize(parameter));
        ps.setObject(i, pgObject);
    }

    @Override
    public Map<String, Object> getNullableResult(ResultSet rs, String columnName)
            throws SQLException {
        return deserialize(rs.getString(columnName));
    }

    @Override
    public Map<String, Object> getNullableResult(ResultSet rs, int columnIndex)
            throws SQLException {
        return deserialize(rs.getString(columnIndex));
    }

    @Override
    public Map<String, Object> getNullableResult(CallableStatement cs, int columnIndex)
            throws SQLException {
        return deserialize(cs.getString(columnIndex));
    }

    private String serialize(Map<String, Object> facilities) {
        try {
            Map<String, Object> map = new HashMap<>();
            for (Field field : facilities.getClass().getDeclaredFields()) {
                JsonProperty annotation = field.getAnnotation(JsonProperty.class);
                if (annotation != null) {
                    field.setAccessible(true);
                    Object value = field.get(facilities);
                    map.put(annotation.value(), value);
                }
            }
            return new ObjectMapper()
                    .writeValueAsString(map);
        } catch (Exception e) {
            throw new RuntimeException("Error serializing facilities", e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> deserialize(String json) {
        try {
            Map<String, Object> map = new ObjectMapper()
                    .readValue(json, Map.class);

            Map<String, Object> facilities = new HashMap<>();
            for (Field field : facilities.getClass().getDeclaredFields()) {
                JsonProperty annotation = field.getAnnotation(JsonProperty.class);
                if (annotation != null && map.containsKey(annotation.value())) {
                    field.setAccessible(true);
                    field.set(facilities, map.get(annotation.value()));
                }
            }
            return facilities;
        } catch (Exception e) {
            throw new RuntimeException("Error deserializing facilities", e);
        }
    }
}