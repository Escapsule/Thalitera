# `application-dev.yml` template

```yaml
spring:
  config:
    activate:
      on-profile: dev # active environment
  datasource:
    url: jdbc:postgresql://PROD_DB_HOST:PORT/DB_NAME  # turn to your database
    username: PROD_USERNAME  # database username
    password: PROD_PASSWORD  # database password
```

# env

- postgresql 17.4
- springboot 3.4.3
- redis 