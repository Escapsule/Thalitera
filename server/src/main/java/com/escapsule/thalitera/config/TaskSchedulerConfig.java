package com.escapsule.thalitera.config;

import com.escapsule.thalitera.properties.TaskConfigProperties;
import com.escapsule.thalitera.properties.TaskConfigProperties.TaskDefinition;
import com.escapsule.thalitera.task.BaseScheduledTask;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.Trigger;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.support.CronTrigger;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Configuration
@EnableScheduling
@EnableConfigurationProperties(TaskConfigProperties.class)
public class TaskSchedulerConfig {
    private final Map<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();
    private final TaskConfigProperties taskConfig;
    private final ThreadPoolTaskScheduler taskScheduler;
    private final List<BaseScheduledTask> taskBeans;

    public TaskSchedulerConfig(
            TaskConfigProperties taskConfig,
            List<BaseScheduledTask> taskBeans,
            ThreadPoolTaskScheduler taskScheduler) {
        this.taskConfig = taskConfig;
        this.taskBeans = taskBeans;
        this.taskScheduler = taskScheduler;
        scheduleTasks();
    }

    /**
     * Automatically schedule tasks after the initialization of the Spring container is completed.
     * <p>
     * In Spring container initialization, this method will get all tasks from the configuration,
     * filter out the enabled tasks, and register them one by one.
     * Use the @PostConstruct annotation to ensure that it is executed after dependency injection is completed.
     */
    @PostConstruct
    private void scheduleTasks() {
        taskConfig.getTasks().stream()
                .filter(TaskDefinition::isEnabled)
                .forEach(this::registerTask);
    }

    /**
     * Register a task with the task scheduler.
     * <p>
     * This method is used to register a task with the task scheduler.
     * It uses the task name to find the corresponding task bean from the taskBeans list.
     * If the task bean is found, it creates a trigger based on the cron expression in the configuration,
     * and then schedules the task with the task scheduler.
     *
     * @param config The task configuration containing the task name and cron expression.
     */
    private void registerTask(TaskDefinition config) {
        taskBeans.stream()
                .filter(task -> task.getTaskName().equals(config.getName()))
                .findFirst()
                .ifPresent(task -> {
                    Trigger trigger = new CronTrigger(config.getCron());
                    ScheduledFuture<?> future = taskScheduler.schedule(task, trigger);
                    scheduledTasks.put(config.getName(), future);
                });
    }

}
