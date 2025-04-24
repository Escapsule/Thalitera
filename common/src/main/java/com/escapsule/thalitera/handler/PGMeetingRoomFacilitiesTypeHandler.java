package com.escapsule.thalitera.handler;

import com.escapsule.thalitera.json.MeetingRoomFacilities;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;
import org.postgresql.util.PGobject;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.*;

@MappedJdbcTypes(JdbcType.OTHER)
@MappedTypes(MeetingRoomFacilities.class)
public class PGMeetingRoomFacilitiesTypeHandler extends BaseTypeHandler<MeetingRoomFacilities> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i,
                                    MeetingRoomFacilities parameter, JdbcType jdbcType)
            throws SQLException {
        try {
            PGobject pgObject = new PGobject();
            pgObject.setType("jsonb");
            String json = objectMapper.writeValueAsString(parameter);
            pgObject.setValue(json);
            ps.setObject(i, pgObject);
        } catch (Exception e) {
            throw new SQLException("Error converting MeetingRoomFacilities to JSONB", e);
        }
    }

    @Override
    public MeetingRoomFacilities getNullableResult(ResultSet rs, String columnName)
            throws SQLException {
        return parseJson(rs.getString(columnName));
    }

    @Override
    public MeetingRoomFacilities getNullableResult(ResultSet rs, int columnIndex)
            throws SQLException {
        return parseJson(rs.getString(columnIndex));
    }

    @Override
    public MeetingRoomFacilities getNullableResult(CallableStatement cs, int columnIndex)
            throws SQLException {
        return parseJson(cs.getString(columnIndex));
    }

    private MeetingRoomFacilities parseJson(String json) throws SQLException {
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, MeetingRoomFacilities.class);
        } catch (Exception e) {
            throw new SQLException("Failed to parse JSONB to MeetingRoomFacilities", e);
        }
    }
}