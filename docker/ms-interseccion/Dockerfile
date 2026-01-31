FROM icr.io/appcafe/open-liberty:kernel-slim-java21-openj9-ubi-minimal

COPY --chown=1001:0 \
    ./docker/ms-interseccion/config \
    /config/

RUN features.sh

COPY --chown=1001:0 \
    ./docker/ms-interseccion/geo-clip.war \
    /config/apps

RUN configure.sh