package com.escapsule.thalitera.pipe.fileupload;

public interface FilePipeStep {
    void execute(FilePipeContext ctx) throws Exception;
}
