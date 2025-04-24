package com.escapsule.thalitera;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@Slf4j
public class ThaliteraBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ThaliteraBackendApplication.class, args);
        log.info("""
                Thalitera Backend Application Started...
                +--------------------------------------------------------------------+
                | ______  __                ___        __                            |
                |/\\__  _\\/\\ \\              /\\_ \\    __/\\ \\__                         |
                |\\/_/\\ \\/\\ \\ \\___      __  \\//\\ \\  /\\_\\ \\ ,_\\    __   _ __    __     |
                |   \\ \\ \\ \\ \\  _ `\\  /'__`\\  \\ \\ \\ \\/\\ \\ \\ \\/  /'__`\\/\\`'__\\/'__`\\   |
                |    \\ \\ \\ \\ \\ \\ \\ \\/\\ \\L\\.\\_ \\_\\ \\_\\ \\ \\ \\ \\_/\\  __/\\ \\ \\//\\ \\L\\.\\_ |
                |     \\ \\_\\ \\ \\_\\ \\_\\ \\__/.\\_\\/\\____\\\\ \\_\\ \\__\\ \\____\\\\ \\_\\\\ \\__/.\\_\\|
                |      \\/_/  \\/_/\\/_/\\/__/\\/_/\\/____/ \\/_/\\/__/\\/____/ \\/_/ \\/__/\\/_/|
                +--------------------------------------------------------------------+""");
    }

}
