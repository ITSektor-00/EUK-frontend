# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app

# Copy Maven files
COPY pom.xml .

# Copy source code
COPY src src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

# Set EUK environment variables
ENV SPRING_PROFILES_ACTIVE=prod
ENV EUK_ALLOWED_DOMAINS=https://euk.vercel.app,https://euk-it-sectors-projects.vercel.app
ENV EUK_RATE_LIMIT_ENABLED=true
ENV EUK_RATE_LIMIT_MAX_REQUESTS=150

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/test/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"] 