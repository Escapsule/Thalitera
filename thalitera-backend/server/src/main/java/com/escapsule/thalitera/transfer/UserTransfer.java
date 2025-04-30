package com.escapsule.thalitera.transfer;

import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.vo.UserVO;
import org.mapstruct.Mapper;

@Mapper
public interface UserTransfer {

    UserTransfer INSTANCE = org.mapstruct.factory.Mappers.getMapper(UserTransfer.class);

    UserVO user2UserVO(User source);
}
