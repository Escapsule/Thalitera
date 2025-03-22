package com.escapsule.thalitera.transfer;

import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.vo.MeetingRoomVO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface MeetingRoomTransfer {

    MeetingRoomTransfer INSTANCE = Mappers.getMapper(MeetingRoomTransfer.class);

    MeetingRoomVO meetingRoom2MeetingRoomVO(MeetingRoom meetingRoom);
}
