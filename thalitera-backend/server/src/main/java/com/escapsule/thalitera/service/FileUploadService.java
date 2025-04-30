package com.escapsule.thalitera.service;

import com.escapsule.thalitera.dto.FileUploadRequestDTO;
import com.escapsule.thalitera.vo.FileUploadResponseVO;

public interface FileUploadService {

    FileUploadResponseVO upload(FileUploadRequestDTO dto);
}
