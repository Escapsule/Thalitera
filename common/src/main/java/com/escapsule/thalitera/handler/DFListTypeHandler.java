package com.escapsule.thalitera.handler;

import com.escapsule.thalitera.json.DeviceFingerprint;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;
import org.postgresql.util.PGobject;

import java.lang.reflect.Type;
import java.sql.*;
import java.util.Collections;
import java.util.List;

@MappedTypes(List.class)
@MappedJdbcTypes(JdbcType.OTHER)
public class DFListTypeHandler extends BaseTypeHandler<List<DeviceFingerprint>> {
    private static final Gson GSON = new Gson();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<DeviceFingerprint> parameter, JdbcType jdbcType)
            throws SQLException {
        String json = GSON.toJson(parameter);

        PGobject pg = new PGobject();
        pg.setType("jsonb");
        pg.setValue(json);

        ps.setObject(i, pg, Types.OTHER);
    }

    @Override
    public List<DeviceFingerprint> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return parseJsonArray(rs.getString(columnName));
    }

    @Override
    public List<DeviceFingerprint> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return parseJsonArray(rs.getString(columnIndex));
    }

    @Override
    public List<DeviceFingerprint> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return parseJsonArray(cs.getString(columnIndex));
    }

    private List<DeviceFingerprint> parseJsonArray(String json) {
        if (json == null || json.isEmpty()) {
            return Collections.emptyList();
        }
        Type listType = new TypeToken<List<DeviceFingerprint>>() {}.getType();
        return GSON.fromJson(json, listType);
    }
}
