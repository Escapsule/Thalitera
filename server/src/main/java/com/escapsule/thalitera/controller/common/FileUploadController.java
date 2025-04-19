package com.escapsule.thalitera.controller.common;

import com.escapsule.thalitera.dto.FileUploadRequestDTO;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.response.ApiResult;
import com.escapsule.thalitera.service.FileUploadService;
import com.escapsule.thalitera.vo.FileUploadResponseVO;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/files")
@Slf4j
@RequiredArgsConstructor
public class FileUploadController {

    private final FileUploadService fileUploadService;

    @PostMapping("/upload")
    public ApiResult<FileUploadResponseVO> upload(@RequestParam MultipartFile file,
                                                  @RequestParam String action,
                                                  @RequestParam(required = false) UUID roomId,
                                                  HttpSession session) {
        User user  = Optional.ofNullable((User) session.getAttribute("user"))
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_LOGIN));
        FileUploadRequestDTO dto = FileUploadRequestDTO.builder()
                .file(file)
                .action(action)
                .roomId(roomId)
                .uploadedBy(user.getUserId())
                .build();
        return ApiResult.success(fileUploadService.upload(dto));
    }
}
