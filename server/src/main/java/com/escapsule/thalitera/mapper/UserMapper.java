package com.escapsule.thalitera.mapper;

import com.escapsule.thalitera.entity.Reservation;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.handler.DFListTypeHandler;
import com.escapsule.thalitera.handler.PGUUIDListTypeHandler;
import com.escapsule.thalitera.json.DeviceFingerprint;
import jakarta.validation.constraints.NotNull;
import org.apache.ibatis.annotations.*;

import java.time.OffsetDateTime;
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
    @Results({
            @Result(property = "trustedDevice", column = "trusted_devices", typeHandler = DFListTypeHandler.class)
    })
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
    @Result(property = "attendees",
            column = "attendees",
            typeHandler = PGUUIDListTypeHandler.class)
    List<Reservation> getUserRelatedReservations(UUID userId);

    /**
     * Update user password hash
     *
     * @param encode encoded password
     * @param email user email
     */
    @Update("UPDATE users SET password_hash = #{encode} WHERE email = #{email}")
    void updatePasswordHash(String encode, String email);

    /**
     * Get all users
     *
     * @return List of users
     */
    @Select("SELECT * FROM users")
    List<User> getAllUsers();

    /**
     * Get user by id
     *
     * @param userId user id
     * @return User entity
     */
    @Select("SELECT * FROM users WHERE user_id = #{userId}")
    @Results({
            @Result(property = "trustedDevice", column = "trusted_devices", typeHandler = DFListTypeHandler.class)
    })
    User getUserById(@NotNull UUID userId);

    /**
     * Update user status by id
     *
     * @param userId user id
     * @param status user status
     */
    @Select("UPDATE users SET status = #{status}, updated_at = now() " +
            "WHERE user_id = #{userId}")
    void updateUserStatusById(
            @NotNull(message = "User ID cannot be null") UUID userId,
            @NotNull(message = "Status cannot be null") String status
    );

    /**
     * Update user MFA secret
     *
     * @param userId user id
     * @param secret MFA secret
     */
    @Update("UPDATE users SET " +
            "mfa_secret = #{secret}, mfa_enable = #{mfaEnable}, updated_at = now()" +
            "WHERE user_id = #{userId}")
    void updateMfaSecret(UUID userId, boolean mfaEnable, String secret);

    /**
     * Update user trusted device
     *
     * @param userId user id
     * @param trustedDevice trusted device
     */
    @Update("UPDATE users SET " +
            "trusted_devices = #{trustedDevice, typeHandler=com.escapsule.thalitera.handler.DFListTypeHandler}, " +
            "updated_at = now() " +
            "WHERE user_id = #{userId}")
    void updateTrustedDevice(UUID userId, List<DeviceFingerprint> trustedDevice);

    /**
     * Update user avatar
     *
     * @param url avatar url
     * @param uploadedBy user id
     */
    @Update("UPDATE users SET avatar = #{url}, updated_at = now() WHERE user_id = #{uploadedBy}")
    void updateAvatar(String url, UUID uploadedBy);

    /**
     * Get users by emails
     *
     * @param emails list of user emails
     * @return List of users
     */
    @Result(property = "trustedDevice", column = "trusted_devices", typeHandler = DFListTypeHandler.class)
    List<User> getUsersByEmails(List<String> emails);
    
    /**
     * Update username by id
     *
     * @param userId user id
     * @param username user name
     */
    @Update("UPDATE users SET username = #{username}, updated_at = now() WHERE user_id = #{userId}")
    void updateUserNameById(UUID userId, String username);

    /**
     * Get users by ids
     *
     * @param ids list of user ids
     * @return List of users
     */
    @Result(property = "trustedDevice", column = "trusted_devices", typeHandler = DFListTypeHandler.class)
    List<User> getUsersByIds(List<UUID> ids);

    @Delete("DELETE FROM users WHERE created_at < #{offsetDateTime} and status = 'pending'")
    void deleteExpiredPendingUser(OffsetDateTime offsetDateTime);
}
