package com.escapsule.thalitera.transfer;

import com.escapsule.thalitera.constant.FacilitiesItemsConstant;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.json.MeetingRoomFacilities;
import com.escapsule.thalitera.vo.MeetingRoomVO;
import org.json.JSONObject;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.Map;

@Mapper
public interface MeetingRoomTransfer {

    MeetingRoomTransfer INSTANCE = Mappers.getMapper(MeetingRoomTransfer.class);

    @Mapping(target = "facilities", source = "facilities")
    MeetingRoomVO meetingRoom2MeetingRoomVO(MeetingRoom source);

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
