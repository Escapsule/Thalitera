package com.escapsule.thalitera.pipe.fileupload.steps;

import com.escapsule.thalitera.constant.FileUploadMethodConstant;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.FileException;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.pipe.fileupload.FilePipeContext;
import com.escapsule.thalitera.pipe.fileupload.FilePipeStep;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(8)
public class InvokeBusinessService implements FilePipeStep {

    private final UserMapper userMapper;
    private final MeetingRoomMapper meetingRoomMapper;

    /**
     * Invoke business service based on the action.
     *
     * @param ctx the context
     * @throws FileException Throw an exception when the business service fails.
     */
    @Override
    public void execute(FilePipeContext ctx) {
        String action = ctx.getDto().getAction();
        switch (action) {
            case FileUploadMethodConstant.AVATAR -> {
                try {
                    userMapper.updateAvatar(ctx.getVo().getUrl(), ctx.getDto().getUploadedBy());
                } catch (Exception e) {
                    throw new FileException(ErrorCode.AVATAR_UPDATE_FAILED, e.getMessage());
                }
            }
            case FileUploadMethodConstant.MEETING_ROOM -> {
                try {
                    meetingRoomMapper.updateMeetingRoomImage(ctx.getVo().getUrl(), ctx.getDto().getRoomId());
                } catch (Exception e) {
                    throw new FileException(ErrorCode.MEETING_ROOM_IMAGE_UPDATE_FAILED, e.getMessage());
                }
            }
            default -> {
                throw new FileException(ErrorCode.INVALID_FILE_UPLOAD_ACTION);
            }
        }
    }
}
