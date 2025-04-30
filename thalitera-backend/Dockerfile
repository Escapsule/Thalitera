FROM maven:3.9-eclipse-temurin-17 AS builder
LABEL authors="Escapsule"

COPY .mvn/settings.xml /root/.m2/settings.xml

WORKDIR /build
COPY .mvn .mvn
COPY pom.xml .
COPY common/pom.xml common/
COPY pojo/pom.xml pojo/
COPY server/pom.xml server/

RUN mvn -B dependency:go-offline

COPY common/src common/src
COPY pojo/src pojo/src
COPY server/src server/src

RUN mvn package -DskipTests -Dmaven.javadoc.skip=true \
    && mv server/target/server-*.jar server/target/server.jar

FROM eclipse-temurin:17-jre-jammy

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN useradd -m -d /app appuser && chown -R appuser:appuser /app
USER appuser

WORKDIR /app
COPY --from=builder --chown=appuser:appuser /build/server/target/server.jar .

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

EXPOSE 8080
CMD ["java", "-jar", "server.jar", "--spring.profiles.active=prod"]