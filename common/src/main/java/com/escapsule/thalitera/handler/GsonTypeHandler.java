package com.escapsule.thalitera.handler;

import com.escapsule.thalitera.adapter.LocalDateTimeTypeAdapter;
import com.escapsule.thalitera.json.Jsonb;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.postgresql.util.PGobject;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

@MappedTypes({Jsonb.class})
public class GsonTypeHandler extends BaseTypeHandler<Jsonb> {
    private static final Gson GSON = new GsonBuilder()
            .registerTypeAdapter(LocalDateTime.class, new LocalDateTimeTypeAdapter())
            .create();

    @Override
    public void setNonNullParameter(PreparedStatement preparedStatement, int i, Jsonb o, JdbcType jdbcType)
            throws SQLException {
        if (preparedStatement != null) {
            PGobject jsonObject = new PGobject();
            jsonObject.setType("jsonb");
            jsonObject.setValue(GSON.toJson(o));
            preparedStatement.setObject(i, jsonObject);
        }
    }

    @Override
    public Jsonb getNullableResult(ResultSet resultSet, String s) throws SQLException {
        String jsonString = resultSet.getString(s);
        return jsonString != null ? GSON.fromJson(jsonString, Jsonb.class) : null;
    }

    @Override
    public Jsonb getNullableResult(ResultSet resultSet, int i) throws SQLException {
        String jsonString = resultSet.getString(i);
        return jsonString != null ? GSON.fromJson(jsonString, Jsonb.class) : null;
    }

    @Override
    public Jsonb getNullableResult(CallableStatement callableStatement, int i) throws SQLException {
        String jsonString = callableStatement.getString(i);
        return jsonString != null ? GSON.fromJson(jsonString, Jsonb.class) : null;
    }
}