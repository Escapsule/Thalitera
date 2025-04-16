package com.escapsule.thalitera.mapper;

import com.escapsule.thalitera.entity.Notification;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface NotificationMapper {

    /**
     * Batch insert notifications into the database.
     *
     * @param notifications The list of notifications to be inserted.
     */
    void batchInsert(List<Notification> notifications);

    /**
     * Insert a single notification into the database.
     *
     * @param notification The notification to be inserted.
     */
    @Insert("INSERT INTO notifications (recipient, type, recipient, content, status, failure_reason) " +
            "VALUES (#{recipient}, #{type}, #{recipient}, #{content}, #{status}, #{failureReason})")
    void insert(Notification notification);
}
