FROM sbtscala/scala-sbt:openjdk-11.0.16_1.8.1_2.13.10 as build-env

WORKDIR /app

COPY build.sbt ./
COPY src ./src
COPY project ./project

RUN sbt assembly

FROM gcr.io/distroless/java11-debian11

COPY --from=build-env /app/target/scala-2.13/hello-world.jar /
EXPOSE 9000
CMD ["hello-world.jar"]
