package com.escapsule.thalitera.mapper;

import com.escapsule.thalitera.entity.Reservation;
import com.escapsule.thalitera.entity.User;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;
import java.util.UUID;

@Mapper
public interface UserMapper {

    /**
     *  Find user by email
     *
     * @param email user email
     * @return User entity
     */
    @Select("SELECT * FROM users WHERE email = #{email}")
    User getUserByEmail(String email);

    /**
     *  Insert user
     *
     * @param user user entity
     */
    @Insert("INSERT INTO users (user_id, email, password_hash, username)" +
            "VALUES (#{userId}, #{email}, #{passwordHash}, #{username})")
    void insert(User user);

    /**
     *  Update user status
     *
     * @param email user email
     * @param status user status
     */
    @Update("UPDATE users SET status = #{status} WHERE email = #{email}")
    void updateStatus(String email, String status);

    /**
     * Get user's related reservations
     *
     * @param userId user id
     * @return List of reservations
     */
    @Select("SELECT * FROM reservations " +
            "WHERE user_id = #{userId} " +
            "OR attendees @> jsonb_build_array(#{userId}::text)")
    List<Reservation> getUserRelatedReservations(UUID userId);
}
