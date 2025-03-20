# `application-dev.yml` 配置模板

```yaml
dev:
  application:
    name: Thalitera-Backend
  datasource:
    url: 
    username: 
    password: 
    driver-class-name: 
    hikari:
      connection-timeout: 
      maximum-pool-size: 

  mybatis-plus:
    configuration:
      # 全局设置
      map-underscore-to-camel-case:
      log-impl:
      auto-mapping-behavior:

      # PostgreSQL 特殊配置
      jdbc-type-for-null:

    global-config:
      db-config:
        id-type:
        logic-delete-field:
        logic-not-delete-value:
        logic-delete-value: 

    # Mapper 文件配置
    mapper-locations: 
    type-aliases-package:

  # 日志配置
  logging:
    level:
      com.escapsule.thalitera.mapper:
```

# 环境

- postgresql 17
- springboot 3.4.3
- redis 