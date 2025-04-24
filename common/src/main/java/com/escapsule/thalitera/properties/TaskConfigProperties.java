package com.escapsule.thalitera.properties;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "timer.scheduled-tasks")
public class TaskConfigProperties {
    private List<TaskDefinition> tasks = new ArrayList<>();

    @Data
    public static class TaskDefinition {
        private String name;
        private String cron;
        private boolean enabled;
    }
}
