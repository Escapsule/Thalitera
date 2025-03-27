package com.escapsule.thalitera.handler;

// common/src/main/java/com/escapsule/thalitera/handler/GeographyPointTypeHandler.java
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKBReader;
import org.locationtech.jts.io.WKBWriter;
import org.postgresql.util.PGobject;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@MappedTypes(Point.class)
@MappedJdbcTypes(JdbcType.OTHER)
public class GeographyPointTypeHandler extends BaseTypeHandler<Point> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Point point, JdbcType jdbcType) throws SQLException {
        byte[] wkb = new WKBWriter(2, true).write(point);
        PGobject pgObject = new PGobject();
        pgObject.setType("geography");
        pgObject.setValue(WKBWriter.toHex(wkb));
        ps.setObject(i, pgObject);
    }

    @Override
    public Point getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return parseGeography(rs.getObject(columnName));
    }

    @Override
    public Point getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return parseGeography(rs.getObject(columnIndex));
    }

    @Override
    public Point getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return parseGeography(cs.getObject(columnIndex));
    }

    private Point parseGeography(Object pgObject) {
        if (pgObject == null) return null;
        try {
            String value = pgObject.toString();
            String hexEwkb = value.split(";")[1];
            byte[] wkb = WKBReader.hexToBytes(hexEwkb);
            return (Point) new WKBReader().read(wkb);
        } catch (ParseException e) {
            throw new RuntimeException("Failed to parse PostGIS geography", e);
        }
    }
}