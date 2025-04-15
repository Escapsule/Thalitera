package com.escapsule.thalitera.handler;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;
import org.postgresql.util.PGobject;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;
import java.util.List;

@MappedJdbcTypes(JdbcType.OTHER)
@MappedTypes(List.class)
public class PGListTypeHandler extends BaseTypeHandler<List<String>> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<String> parameter, JdbcType jdbcType) throws SQLException {
        try {
            PGobject pgObject = new PGobject();
            pgObject.setType("jsonb");
            String json = objectMapper.writeValueAsString(parameter);
            pgObject.setValue(json);
            ps.setObject(i, pgObject);
        } catch (JsonProcessingException e) {
            throw new SQLException("Error converting list to JSON", e);
        }
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return parseJson(rs.getObject(columnName));
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return parseJson(rs.getObject(columnIndex));
    }

    @Override
    public List<String> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return parseJson(cs.getObject(columnIndex));
    }

    private List<String> parseJson(Object value) throws SQLException {
        if (value == null) {
            return Collections.emptyList();
        }

        String json;
        if (value instanceof PGobject pgObject) {
            json = pgObject.getValue();
        } else if (value instanceof String) {
            json = (String) value;
        } else {
            throw new SQLException("Unexpected type for JSONB field: " + value.getClass().getName());
        }

        if (json == null || json.isEmpty()) {
            return Collections.emptyList();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            throw new SQLException("Error parsing JSON from attendees column", e);
        }
    }
}