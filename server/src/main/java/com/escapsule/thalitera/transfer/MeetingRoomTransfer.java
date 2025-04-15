package com.escapsule.thalitera.transfer;

import com.escapsule.thalitera.constant.FacilitiesItemsConstant;
import com.escapsule.thalitera.dto.MeetingRoomDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.json.MeetingRoomFacilities;
import com.escapsule.thalitera.vo.MeetingRoomVO;
import org.json.JSONObject;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Mapper
public interface MeetingRoomTransfer {

    MeetingRoomTransfer INSTANCE = Mappers.getMapper(MeetingRoomTransfer.class);

    @Mapping(target = "facilities", source = "facilities")
    MeetingRoomVO meetingRoom2MeetingRoomVO(MeetingRoom source);

    @Mapping(target = "facilities", expression = "java(mapMapToFacilities(source.getFacilities()))")
    @Mapping(target = "roomId", expression = "java(roomId)")
    @Mapping(target = "status", expression = "java(status)")
    @Mapping(target = "createdAt", expression = "java(OffsetDateTime.now())")
    @Mapping(target = "updatedAt", expression = "java(OffsetDateTime.now())")
    MeetingRoom meetingRoomDTO2MeetingRoom(MeetingRoomDTO source,
                                           UUID roomId,
                                           String status);

    @Mapping(target = "facilities", expression = "java(mapMapToFacilities(source.getFacilities()))")
    @Mapping(target = "createdBy", expression = "java(createdBy)")
    @Mapping(target = "createdAt", expression = "java(createdAt)")
    @Mapping(target = "updatedAt", expression = "java(OffsetDateTime.now())")
    MeetingRoom modifyMeetingRoomDTO2MeetingRoom(MeetingRoomDTO source,
                                                 UUID createdBy,
                                                 OffsetDateTime createdAt);

    default Map<String, Object> mapFacilitiesToMap(MeetingRoomFacilities facilities) {
        if (facilities == null) {
            return null;
        }
        return new JSONObject(facilities).toMap();
    }

    @SuppressWarnings("unchecked")
    default MeetingRoomFacilities mapMapToFacilities(Map<String, Object> facilitiesMap) {
        if (facilitiesMap == null) {
            return null;
        }
        return MeetingRoomFacilities.builder()
                .projector((Boolean) facilitiesMap.get(FacilitiesItemsConstant.PROJECTOR))
                .whiteboard((Integer) facilitiesMap.get(FacilitiesItemsConstant.WHITEBOARD))
                .powerSockets((Integer) facilitiesMap.get(FacilitiesItemsConstant.POWER_SOCKETS))
                .coffeeBreak((Boolean) facilitiesMap.get(FacilitiesItemsConstant.COFFEE_BREAK))
                .specialNotes((List<String>) facilitiesMap.get(FacilitiesItemsConstant.SPECIAL_NOTES))
                .build();
    }
}
