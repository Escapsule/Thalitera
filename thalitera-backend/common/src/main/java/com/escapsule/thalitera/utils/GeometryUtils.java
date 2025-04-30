package com.escapsule.thalitera.utils;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

public class GeometryUtils {
    private static final GeometryFactory GEOMETRY_FACTORY =
            new GeometryFactory(new PrecisionModel(), 4326);

    /**
     * Create a geographic coordinate point according to the specified longitude and latitude.
     * This method is used to encapsulate geographic coordinates (latitude, longitude) into a Point object,
     * to represent a specific geographic location in a Geographic Information System (GIS).
     *
     * @param longitude Longitude, indicating the position in the east-west direction.
     * @param latitude Latitude, which indicates the location in the north-south direction.
     * @return A Point object, which represents a specific geographic coordinate point.
     */
    public static Point createPoint(double longitude, double latitude) {
        return GEOMETRY_FACTORY.createPoint(new Coordinate(longitude, latitude));
    }
}