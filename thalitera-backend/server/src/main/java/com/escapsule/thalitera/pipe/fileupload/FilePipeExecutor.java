package com.escapsule.thalitera.pipe.fileupload;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class FilePipeExecutor {
    private final List<FilePipeStep> steps;

    /**
     * Execute all the steps in the file pipeline.
     * <p>
     * This method will sequentially invoke each step in the file pipeline and pass the context object to each step.
     * If any step throws an exception during execution, the method will throw that exception upward.
     *
     * @param ctx A file pipe context object, which contains the data and state needed during execution.
     * @throws Exception If an exception is thrown at any step during execution, throw that exception.
     */
    public void execute(FilePipeContext ctx) throws Exception {
        for (FilePipeStep step : steps) {
            step.execute(ctx);
        }
    }
}
