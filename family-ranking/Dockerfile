# Build stage - use Debian base (not Alpine) for better compatibility on Render
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Limit Maven memory to avoid OOM on Render free tier (512MB)
ENV MAVEN_OPTS="-Xmx384m -Xms128m -XX:+UseSerialGC"

COPY pom.xml .
RUN mvn dependency:go-offline -B -q

COPY src ./src
RUN mvn clean package -DskipTests -B -q

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=build /app/target/family-ranking-*.jar app.jar

# Render sets PORT; Spring Boot reads it via application.yml
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
