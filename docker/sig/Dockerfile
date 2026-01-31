FROM eclipse-temurin:17-jdk

ENV WILDFLY_VERSION=27.0.1.Final
ENV WILDFLY_HOME=/opt/wildfly

RUN groupadd -r wildfly && useradd -r -g wildfly wildfly

#versionanterior
#RUN curl -L https://download.jboss.org/wildfly/${WILDFLY_VERSION}/wildfly-${WILDFLY_VERSION}.tar.gz | tar -xz -C /opt \
 #   && mv /opt/wildfly-${WILDFLY_VERSION} ${WILDFLY_HOME}

RUN curl -L https://github.com/wildfly/wildfly/releases/download/${WILDFLY_VERSION}/wildfly-${WILDFLY_VERSION}.tar.gz | tar -xz -C /opt \
    && mv /opt/wildfly-${WILDFLY_VERSION} ${WILDFLY_HOME}

COPY ./wildfly/modules/ ${WILDFLY_HOME}/modules/
COPY ./wildfly/standalone/configuration/standalone.xml ${WILDFLY_HOME}/standalone/configuration/standalone.xml

COPY ./wildfly/standalone/deployments/*.war ${WILDFLY_HOME}/standalone/deployments

# script wait-for-it
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

RUN chown -R wildfly:wildfly ${WILDFLY_HOME}/

WORKDIR ${WILDFLY_HOME}
USER wildfly

# anterior EXPOSE 8080

# anterior CMD ["sh", "-c", "${WILDFLY_HOME}/bin/standalone.sh -b 0.0.0.0"]

EXPOSE 8080 9990

# Comando que usa las variables de entorno DB_HOST y DB_PORT
CMD ["sh", "-c", "/wait-for-it.sh $DB_HOST:$DB_PORT --timeout=60 --strict -- ${WILDFLY_HOME}/bin/standalone.sh -b 0.0.0.0 -bmanagement 0.0.0.0"]