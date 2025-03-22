package com.escapsule.thalitera.mapper;

import com.escapsule.thalitera.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

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
    void insert(User user);

    /**
     *  Update user status
     *
     * @param email user email
     * @param status user status
     */
    @Update("UPDATE users SET status = #{status} WHERE email = #{email}")
    void updateStatus(String email, String status);
}
