package com.escapsule.thalitera;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@Slf4j
public class ThaliteraBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ThaliteraBackendApplication.class, args);
        log.info("Thalitera Backend Application Started...");
        log.info("+--------------------------------------------------------------------+");
        log.info("| ______  __                ___        __                            |");
        log.info("|/\\__  _\\/\\ \\              /\\_ \\    __/\\ \\__                         |");
        log.info("|\\/_/\\ \\/\\ \\ \\___      __  \\//\\ \\  /\\_\\ \\ ,_\\    __   _ __    __     |");
        log.info("|   \\ \\ \\ \\ \\  _ `\\  /'__`\\  \\ \\ \\ \\/\\ \\ \\ \\/  /'__`\\/\\`'__\\/'__`\\   |");
        log.info("|    \\ \\ \\ \\ \\ \\ \\ \\/\\ \\L\\.\\_ \\_\\ \\_\\ \\ \\ \\ \\_/\\  __/\\ \\ \\//\\ \\L\\.\\_ |");
        log.info("|     \\ \\_\\ \\ \\_\\ \\_\\ \\__/.\\_\\/\\____\\\\ \\_\\ \\__\\ \\____\\\\ \\_\\\\ \\__/.\\_\\|");
        log.info("|      \\/_/  \\/_/\\/_/\\/__/\\/_/\\/____/ \\/_/\\/__/\\/____/ \\/_/ \\/__/\\/_/|");
        log.info("+--------------------------------------------------------------------+");
    }

}
