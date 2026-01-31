# Etapa 1: Compilación
FROM node:22-alpine AS build

# Instalar dependencias de compilación si son necesarias
RUN apk add --no-cache make g++ python3

# Instalar gettext-bin (que incluye envsubst)
RUN apk add --no-cache gettext

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de package.json y package-lock.json e instala las dependencias
COPY package*.json ./
RUN npm install

# Copia el resto del código de la aplicación y realiza el build
COPY . .

# Compila aplicaciones modo producción
RUN npx ng build --configuration=development --base-href /
RUN npx ng build cric --configuration=development --base-href /cric/
RUN npx ng build aiso --configuration=development --base-href /aiso/
RUN npx ng build opiac --configuration=development --base-href /opiac/
RUN npx ng build gobiernomayor --configuration=development --base-href /gobiernomayor/
RUN npx ng build linea-negra --configuration=development --base-href /linea-negra/


# Etapa 2: Nginx para servir los archivos compilados
FROM nginx:alpine

# Copia los archivos del build desde la etapa anterior
COPY --from=build /app/dist/visor-geografico-estandar-2024/browser /usr/share/nginx/html/playground
COPY --from=build /app/dist/cric/browser /usr/share/nginx/html/cric
COPY --from=build /app/dist/aiso/browser /usr/share/nginx/html/aiso
COPY --from=build /app/dist/opiac/browser /usr/share/nginx/html/opiac
COPY --from=build /app/dist/gobiernomayor/browser /usr/share/nginx/html/gobiernomayor
COPY --from=build /app/dist/linea-negra/browser /usr/share/nginx/html/linea-negra

# Permisos de archivos y directorios en /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# Copia el archivo de configuración personalizado de Nginx
COPY ./docker/ngnix-angular/nginx.conf /etc/nginx/nginx.conf

# Expone el puerto 80
EXPOSE 80

# Inicia el servidor Nginx
CMD ["nginx", "-g", "daemon off;"]
