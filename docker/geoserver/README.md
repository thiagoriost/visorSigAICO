# Configuración de la URL Base de Proxy en GeoServer

Este README proporciona instrucciones para usar el script `update_proxy_base_url.sh` .

Funciones principales:
- Actualizar el archivo `global.xml` con el valor de `proxyBaseUrl` ingresado por el usuario mas `\geoserver`.
- Configurar el parámetro `GEOSERVER_CSRF_WHITELIST` en `web.xml`, corrigiendo el error 400 al intentar actualizar parametros globales del geoserver.
- Modificar el archivo `csp.xml` para ajustar la política de seguridad de contenidos (**Content-Security-Policy**).

## Requisitos previos

- **Docker y Docker Compose**: Asegúrate de tener instalado Docker Desktop o la CLI de Docker.
- **Contenedor de GeoServer**: El contenedor `geoserver-service` debe estar construido y en ejecución, basado en el `Dockerfile` y `docker-compose.yml` proporcionados.
- **Directorio de datos de GeoServer**: La variable de entorno `${GEOSERVER_VOLUME}` debe apuntar a un directorio que contenga los datos de GeoServer (por ejemplo, `workspaces`, `layers`, `styles`). Si el volumen está vacío, inicialízalo con un directorio de datos válido de GeoServer.
- **Acceso a Docker Exec**: Necesitas acceso a la línea de comandos del contenedor, ya sea a través de la pestaña **Exec** de Docker Desktop o una terminal.

## Archivos

- **`Dockerfile`**: Define la imagen del contenedor de GeoServer, instala `xmlstarlet` y copia el script `update_proxy_base_url.sh`.
- **`docker-compose.yml`**: Configura el contenedor `geoserver-service`, mapea el puerto `8080` y monta el volumen `${GEOSERVER_VOLUME}`.
- **`update_proxy_base_url.sh`**: Script para actualizar o añadir el `proxyBaseUrl` en `global.xml`, validar la URL y reiniciar GeoServer.

## Configuración inicial

1. **Prepara los archivos**:
   - Coloca los siguientes archivos en el directorio `./docker/geoserver`:
     - `Dockerfile`
     - `update_proxy_base_url.sh`
   - Coloca `docker-compose.yml` en el directorio raíz del proyecto.
   - Asegúrate de que `update_proxy_base_url.sh` tenga finales de línea Unix y permisos de ejecución:
     ```bash
     sed -i 's/\r$//' docker/geoserver/update_proxy_base_url.sh
     chmod +x docker/geoserver/update_proxy_base_url.sh
     ```

2. **Configura la variable de entorno `${GEOSERVER_VOLUME}`**:
   - Define `${GEOSERVER_VOLUME}` para que apunte a un directorio en el host donde se almacenarán los datos de GeoServer (por ejemplo, `/ruta/a/geoserver_data`).
   - Ejemplo (Linux/Mac):
     ```bash
     export GEOSERVER_VOLUME=/ruta/a/geoserver_data
     ```
   - Si el directorio está vacío, inicialízalo con un directorio de datos válido de GeoServer (ver **Solución de problemas**).

3. **Construye e inicia el contenedor**:
   - Ejecuta el siguiente comando para construir e iniciar el contenedor de GeoServer:
     ```bash
     docker-compose up --build -d
     ```
   - La bandera `-d` ejecuta el contenedor en modo detached.
   - Verifica que el contenedor esté en ejecución:
     ```bash
     docker ps
     ```
     Busca el contenedor `geoserver-service`.

4. **Verifica GeoServer**:
   - Accede a GeoServer en `http://localhost:8080/geoserver` desde un navegador web.
   - Inicia sesión con las credenciales predeterminadas (usuario: `admin`, contraseña: `geoserver`).
   - Confirma que las capas, workspaces y datastores se cargan correctamente.

## Uso del script `update_proxy_base_url.sh`

El script `update_proxy_base_url.sh` permite establecer o actualizar el `proxyBaseUrl` en el archivo `/opt/geoserver_data/global.xml` después de que GeoServer esté inicializado. Valida que la URL ingresada sea válida, modifica la configuración y reinicia GeoServer para aplicar los cambios.

### Pasos para ejecutar el script

1. **Accede a la línea de comandos del contenedor**:
   - **Usando Docker Desktop**:
     - Abre Docker Desktop y selecciona el contenedor `geoserver-service`.
     - Ve a la pestaña **Exec** (o **CLI** en algunas versiones) para abrir una terminal interactiva.
   - **Usando una terminal**:
     - Ejecuta:
       ```bash
       docker exec -it geoserver-service /bin/sh
       ```

2. **Ejecuta el script**:
   - En la pestaña **Exec** o en la terminal, ejecuta:
     ```bash
     /bin/sh /update_proxy_base_url.sh
     ```
   - El script realizará lo siguiente:
     - Verificará si `xmlstarlet` está instalado.
     - Comprobará que `/opt/geoserver_data/global.xml` existe.
     - Solicitará que ingreses una URL base (por ejemplo, `https://midominio.com/geoserver`). En este punto es importante resaltar que,
       la ruta que se ingrese debe incluir el path /geoserver.
     - Validará que la URL comience con `http://` o `https://`, seguida de un dominio válido, puerto opcional y ruta opcional.
     - Ajustará los permisos de `global.xml` para permitir modificaciones.
     - Actualizará o añadirá el elemento `<proxyBaseUrl>` en `global.xml`.
     - Mostrará el contenido de `global.xml` antes y después de la modificación.
     - Reiniciará GeoServer (Tomcat) para aplicar los cambios.
     - Seguirá los logs de Tomcat para mantener el contenedor en ejecución.

3. **Ingresa una URL válida**:
   - Cuando se te solicite, ingresa una URL válida (por ejemplo, `https://midominio.com/geoserver`, `http://example.com:8080/geoserver`).
   - Si la URL no es válida (por ejemplo, `invalid`, `ftp://localhost`), el script mostrará un error y pedirá que intentes de nuevo.
   - Ejemplos de URLs válidas:
     - `https://midominio.com/geoserver`
     - `http://example.com`
     - `https://mi-dominio.org:8080/geoserver/rest`
   - Ejemplos de URLs no válidas:
     - `ftp://localhost`
     - `https://`
     - `invalid`

4. **Verifica los cambios**:
   - Revisa la salida del script para confirmar que `proxyBaseUrl` se actualizó o añadió.
   - Inspecciona `global.xml`:
     ```bash
     docker exec geoserver-service cat /opt/geoserver_data/global.xml
     ```
     - Busca el elemento `<proxyBaseUrl>` dentro de `<settings>` con la URL ingresada.
   - Accede a `http://localhost:8080/geoserver` para asegurarte de que GeoServer está funcionando y la configuración se aplicó.

### Solución de problemas

#### El script no se ejecuta
- **Error: `xmlstarlet` no está instalado**:
  - Verifica que el `Dockerfile` incluya:
    ```dockerfile
    RUN apt-get update && apt-get install -y xmlstarlet
    ```
  - Reconstruye el contenedor:
    ```bash
    docker-compose up --build
    ```
- **Error: `global.xml` no existe**:
  - Asegúrate de que GeoServer esté inicializado accediendo a `http://localhost:8080/geoserver`.
  - Verifica si `/opt/geoserver_data/global.xml` existe:
    ```bash
    docker exec geoserver-service ls -l /opt/geoserver_data
    ```
  - Si falta, reinicia el contenedor para que GeoServer lo genere:
    ```bash
    docker-compose restart
    ```

#### Error de URL no válida
- Si el script rechaza tu URL, asegúrate de que siga el formato `http://` o `https://`, seguido de un dominio válido (por ejemplo, `localhost`, `example.com`) y, opcionalmente, un puerto o ruta.
- Prueba la URL manualmente:
  ```bash
  echo "https://localhost/geoserver" | grep -E '^https?://([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+(:[0-9]+)?(/.*)?$'
  ```
  - Si falla, ajusta la URL e intenta de nuevo.

#### GeoServer no se reinicia
- Si el script falla al reiniciar GeoServer:
  - Revisa los logs de Tomcat:
    ```bash
    docker exec geoserver-service cat /usr/local/tomcat/logs/catalina.out
    ```
  - Detén e inicia Tomcat manualmente:
    ```bash
    docker exec geoserver-service /usr/local/tomcat/bin/shutdown.sh
    docker exec geoserver-service /usr/local/tomcat/bin/catalina.sh start
    ```

#### Las capas no se cargan
- Si las capas, workspaces o datastores no aparecen:
  - Inspecciona el volumen:
    ```bash
    docker exec geoserver-service ls -l /opt/geoserver_data
    ```
    - Deberías ver directorios como `workspaces`, `styles`, `layers`, `data`, `datastores`.
  - Si el volumen está vacío, inicialízalo:
    - Ejecuta un contenedor temporal de GeoServer para configurar capas:
      ```bash
      docker run --rm -it -p 8080:8080 docker.osgeo.org/geoserver:2.28.0
      ```
    - Configura capas en `http://localhost:8080/geoserver` (usuario: `admin`, contraseña: `geoserver`).
    - Copia el directorio de datos a `${GEOSERVER_VOLUME}`:
      ```bash
      docker cp <contenedor_temporal>:/opt/geoserver_data/. $GEOSERVER_VOLUME
      ```
    - Reinicia el contenedor:
      ```bash
      docker-compose restart
      ```
  - Alternativamente, prueba sin volumen editando `docker-compose.yml`:
    ```yaml
    volumes:
      # - ${GEOSERVER_VOLUME}:/opt/geoserver_data
    ```
    - Reconstruye y ejecuta:
      ```bash
      docker-compose up --build
      ```
## Ejemplo de ejecución

1. Inicia el contenedor:
   ```bash
   docker-compose up -d
   ```

2. Ejecuta el script:
   ```bash
   docker exec -it geoserver-service /bin/sh /update_proxy_base_url.sh
   ```

3. Salida de ejemplo:
   ```
   Por favor, ingrese la URL base para proxyBaseUrl (por ejemplo, https://localhost/geoserver):
   invalid
   Error: 'invalid' no es una URL válida. Debe comenzar con http:// o https://, seguido de un dominio válido (por ejemplo, https://example.com/geoserver). Intente de nuevo.
   Por favor, ingrese la URL base para proxyBaseUrl (por ejemplo, https://localhost/geoserver):
   https://localhost/geoserver
   URL válida: https://localhost/geoserver
   Verificando permisos de /opt/geoserver_data/global.xml...
   -rw-rw-rw- 1 root root 2602 Aug  4 13:36 /opt/geoserver_data/global.xml
   Contenido de global.xml antes de la modificación:
   <global>...</global>
   Proxy Base URL añadido como https://localhost/geoserver
   Contenido de global.xml después de la modificación:
   <global><settings><proxyBaseUrl>https://localhost/geoserver</proxyBaseUrl>...</settings>...</global>
   Reiniciando el servicio GeoServer...
   GeoServer reiniciado, siguiendo logs...
   ```

## Notas
- El script asume que GeoServer está en ejecución y ha generado `/opt/geoserver_data/global.xml`.
- La validación de la URL asegura que comience con `http://` o `https://`, seguido de un dominio válido, puerto opcional y ruta opcional.
- Después de ejecutar el script, GeoServer se reinicia para aplicar los cambios, lo que puede tomar algunos segundos.

