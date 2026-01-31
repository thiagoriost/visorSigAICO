
FROM docker.osgeo.org/geoserver:2.28.0

# Asignar permisos carpeta temporal
RUN chmod 777 /tmp

# Instalar xmlstarlet for XML manipulation
RUN apt-get update && apt-get install -y xmlstarlet

# Copiar el script de actualización
COPY ./update_proxy_base_url.sh /update_proxy_base_url.sh

# Exponer el puerto por defecto
EXPOSE 8080


