package com.escapsule.thalitera.handler;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;

import java.io.IOException;
import java.sql.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class PGUUIDListTypeHandler extends BaseTypeHandler<List<UUID>> {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<UUID> parameter, JdbcType jdbcType) throws SQLException {
        try {
            // Convert the list of UUIDs to JSON string
            String json = objectMapper.writeValueAsString(parameter);
            ps.setObject(i, json, Types.OTHER);
        } catch (Exception ex) {
            throw new SQLException("Error converting List<UUID> to JSON", ex);
        }
    }

    @Override
    public List<UUID> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String json = rs.getString(columnName);
        return convertJsonToUUIDList(json);
    }

    @Override
    public List<UUID> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String json = rs.getString(columnIndex);
        return convertJsonToUUIDList(json);
    }

    @Override
    public List<UUID> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String json = cs.getString(columnIndex);
        return convertJsonToUUIDList(json);
    }

    private List<UUID> convertJsonToUUIDList(String json) throws SQLException {
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            // First, read the JSON array as a list of strings
            List<String> stringList = objectMapper.readValue(json, new TypeReference<>() {
            });
            // Then convert each string to a UUID
            return stringList.stream()
                    .map(UUID::fromString)
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new SQLException("Error parsing JSON to List<UUID>", e);
        }
    }
}
