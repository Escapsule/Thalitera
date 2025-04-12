# `application-dev.yml` template

```yaml
spring:
  config:
    base-url: http://xxxxx.xxx # Temporary hardcoding
    activate:
      on-profile: dev
  datasource:
    url: jdbc:postgresql://PROD_DB_HOST:PORT/DB_NAME  # turn to your database
    username: PROD_USERNAME  # database username
    password: PROD_PASSWORD  # database password
  mail:
    username: xxx@xxx.com
    password: abcdefghijklmnopqrstuvwxyz
    protocol: smtp
    properties:
      mail.smtp.auth: true
      mail.smtp.ssl.enable: true
      mail.smtp.connectiontimeout: 5000
      mail.smtp.timeout: 3000
      mail.smtp.writetimeout: 5000
  data:
    redis:
      host: localhost
      password:
      database: 0
```

# env

- postgresql 17.0
- springboot 3.4.3
- redis 