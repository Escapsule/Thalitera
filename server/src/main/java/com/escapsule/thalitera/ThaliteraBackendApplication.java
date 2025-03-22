package com.escapsule.thalitera;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@Slf4j
public class ThaliteraBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ThaliteraBackendApplication.class, args);
        log.info("Thalitera Backend Application Started...\n" +
                "+--------------------------------------------------------------------+\n" +
                "| ______  __                ___        __                            |\n" +
                "|/\\__  _\\/\\ \\              /\\_ \\    __/\\ \\__                         |\n" +
                "|\\/_/\\ \\/\\ \\ \\___      __  \\//\\ \\  /\\_\\ \\ ,_\\    __   _ __    __     |\n" +
                "|   \\ \\ \\ \\ \\  _ `\\  /'__`\\  \\ \\ \\ \\/\\ \\ \\ \\/  /'__`\\/\\`'__\\/'__`\\   |\n" +
                "|    \\ \\ \\ \\ \\ \\ \\ \\/\\ \\L\\.\\_ \\_\\ \\_\\ \\ \\ \\ \\_/\\  __/\\ \\ \\//\\ \\L\\.\\_ |\n" +
                "|     \\ \\_\\ \\ \\_\\ \\_\\ \\__/.\\_\\/\\____\\\\ \\_\\ \\__\\ \\____\\\\ \\_\\\\ \\__/.\\_\\|\n" +
                "|      \\/_/  \\/_/\\/_/\\/__/\\/_/\\/____/ \\/_/\\/__/\\/____/ \\/_/ \\/__/\\/_/|\n" +
                "+--------------------------------------------------------------------+");
    }

}
