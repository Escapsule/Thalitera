package com.escapsule.thalitera.service;

import com.escapsule.thalitera.config.OssConfiguration;
import com.escapsule.thalitera.dto.FileUploadRequestDTO;
import com.escapsule.thalitera.pipe.fileupload.FilePipeContext;
import com.escapsule.thalitera.pipe.fileupload.FilePipeExecutor;
import com.escapsule.thalitera.service.impl.FileUploadServiceImpl;
import com.escapsule.thalitera.vo.FileUploadResponseVO;
import io.minio.MinioClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = FileUploadServiceImpl.class)
class FileUploadServiceTest {
    @Autowired
    private FileUploadServiceImpl service;

    @MockitoBean
    private MinioClient minioClient;

    @MockitoBean
    private FilePipeExecutor executor;

    @MockitoBean
    private OssConfiguration ossConfiguration;

    private FileUploadRequestDTO dto;
    private UUID userId;
    private UUID roomId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        roomId = UUID.randomUUID();


        MockMultipartFile file = new MockMultipartFile(
                "file",
                "foo.txt",
                "text/plain",
                "hello".getBytes()
        );

        dto = FileUploadRequestDTO.builder()
                .file(file)
                .uploadedBy(userId)
                .action("upload")
                .roomId(roomId)
                .build();

        when(ossConfiguration.getBucket()).thenReturn("test-bucket");
    }

    @Test
    void upload_whenExecutorSucceeds_returnsVoFromContext() throws Exception {
        FileUploadResponseVO expectedVo = new FileUploadResponseVO();
        expectedVo.setUrl("https://cdn.example.com/foo.txt");

        doAnswer(invocation -> {
            FilePipeContext ctx = invocation.getArgument(0);
            ReflectionTestUtils.setField(ctx, "vo", expectedVo);
            return null;
        }).when(executor).execute(any(FilePipeContext.class));

        FileUploadResponseVO actual = service.upload(dto);
        assertSame(expectedVo, actual);

        verify(executor).execute(argThat(ctx ->
                "test-bucket".equals(ctx.getBucket())
                        && ctx.getDto().getUploadedBy().equals(userId)
                        && ctx.getDto().getRoomId().equals(roomId)
                        && ctx.getDto().getFile().getOriginalFilename().equals("foo.txt")
        ));
    }
    @Test
    void upload_whenExecutorThrows_wrapsInRuntimeException() throws Exception {
        doThrow(new Exception("pipe error"))
                .when(executor).execute(any(FilePipeContext.class));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.upload(dto));
        assertTrue(ex.getCause() instanceof Exception);
        assertEquals("pipe error", ex.getCause().getMessage());
    }

}
