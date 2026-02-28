# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/family-ranking-*.jar app.jar

# Render sets PORT (default 10000); Spring Boot uses it via application.yml
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
