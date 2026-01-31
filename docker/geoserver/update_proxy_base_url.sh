#!/bin/sh
set -e


# Función para validar si la entrada es una URL válida
validate_url() {
    url="$1"
    # Expresión regular para validar URLs (http:// o https://, seguido de dominio/IP y opcionalmente puerto/ruta)
    if echo "$url" | grep -E '^https?://([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+(:[0-9]+)?(/.*)?$' >/dev/null 2>&1; then
        return 0 # URL válida
    else
        return 1 # URL no válida
    fi
}

echo "🚀 Iniciando configuración de GeoServer..."

CSP_XML="/opt/geoserver_data/security/csp.xml"
GLOBAL_XML="/opt/geoserver_data/global.xml"
WEB_XML="/usr/local/tomcat/webapps/geoserver/WEB-INF/web.xml"

echo "🔧 Configuración de proxyBaseUrl en GeoServer"

# Verificar si xmlstarlet está instalado
if ! command -v xmlstarlet >/dev/null 2>&1; then
    echo "❌ Error: xmlstarlet no está instalado."
    exit 1
fi

# Verificar si global.xml existe
if [ ! -f "$GLOBAL_XML" ]; then   
    echo "❌ El archivo global.xml no existe en: $GLOBAL_XML"
    echo "Asegúrese de que GeoServer haya sido iniciado al menos una vez."
    exit 1
fi

if [ ! -f "$WEB_XML" ]; then
    echo "❌ El archivo web.xml no existe en: $WEB_XML"
    exit 1
fi

if [ ! -f "$CSP_XML" ]; then
    echo "❌ El archivo csp.xml no existe en: $CSP_XML"
    exit 1
fi

# Solicitar la URL base al usuario
echo "Por favor, ingrese el dominio base para proxyBaseUrl (por ejemplo, https://midominio.com):"
read -r PROXY_BASE_URL

# Validar que se ingresó una URL
if [ -z "$PROXY_BASE_URL" ]; then
    echo "⚠️ No se ingresó ninguna URL. Abortando."
    exit 1
fi
PROXY_BASE_URL_WITH_CONTEXT="${PROXY_BASE_URL%/}/geoserver"
# Validar formato de URL
if validate_url "$PROXY_BASE_URL_WITH_CONTEXT"; then
    echo "⚠️ URL válida: $PROXY_BASE_URL"
else
    echo "❌  Error: Formato de URL inválido. Debe comenzar con http:// o https://"
    exit 1
fi

# Verificar permisos del archivo global.xml
echo "Verificando permisos de $GLOBAL_XML..."
ls -l "$GLOBAL_XML"
chown root:root "$GLOBAL_XML" || echo "❌ No se pudo cambiar propietario de global.xml"
chmod 666 "$GLOBAL_XML" || echo "❌ No se pudo cambiar permisos de global.xml"

echo "Verificando permisos de $CSP_XML..."
ls -l "$CSP_XML"
chown root:root "$CSP_XML" || echo "❌ No se pudo cambiar propietario de csp.xml"
chmod 666 "$CSP_XML" || echo "❌ No se pudo cambiar permisos de csp.xml"

# Mostrar el contenido de global.xml antes de la modificación
echo "⚠️ Contenido de global.xml antes de la modificación:"
cat "$GLOBAL_XML"

# Verificar si proxyBaseUrl existe y añadirlo o actualizarlo (sin namespace)
if xmlstarlet sel -t -c "//proxyBaseUrl" "$GLOBAL_XML" >/dev/null 2>&1; then
    # Si proxyBaseUrl existe, actualizarlo
    if xmlstarlet ed -L \
        -u "//proxyBaseUrl" -v "$PROXY_BASE_URL_WITH_CONTEXT" \
        "$GLOBAL_XML"; then
        echo "✅ Proxy Base URL actualizado a $PROXY_BASE_URL_WITH_CONTEXT"
    else
        echo "❌ Error: No se pudo actualizar proxyBaseUrl."
        exit 1
    fi
else
    # Si proxyBaseUrl no existe, añadirlo
    if xmlstarlet ed -L \
        -s "//settings" -t elem -n "proxyBaseUrl" -v "$PROXY_BASE_URL_WITH_CONTEXT" \
        "$GLOBAL_XML"; then
        echo "✅ Proxy Base URL añadido como $PROXY_BASE_URL_WITH_CONTEXT"
    else
        echo "❌ Error: No se pudo añadir proxyBaseUrl."
        exit 1
    fi
fi

# Mostrar el contenido de global.xml después de la modificación
echo "Contenido de global.xml después de la modificación:"
cat "$GLOBAL_XML"


# ===============================
# Inyectar CSRF whitelist en web.xml
# ===============================
BASE_DOMAIN="${PROXY_BASE_URL#*//}"
CSRF_VALUE="${BASE_DOMAIN},simi_spa-secure"

echo "⚡ Revisando si GEOSERVER_CSRF_WHITELIST ya existe en web.xml..."
if grep -q "GEOSERVER_CSRF_WHITELIST" "$WEB_XML"; then
    echo "✅ GEOSERVER_CSRF_WHITELIST ya existe en web.xml, no se modifica."
else
    echo "👉 Inyectando GEOSERVER_CSRF_WHITELIST..."

    # Importante: usar namespace genérico (_:) porque web.xml declara xmlns en <web-app>
    if xmlstarlet ed -L \
        -s "/_:web-app" -t elem -n "context-paramTMP" -v "" \
        -s "/_:web-app/context-paramTMP" -t elem -n "param-name" -v "GEOSERVER_CSRF_WHITELIST" \
        -s "/_:web-app/context-paramTMP" -t elem -n "param-value" -v "$CSRF_VALUE" \
        -r "/_:web-app/context-paramTMP" -v "context-param" \
        "$WEB_XML"; then
        echo "✅ CSRF whitelist agregado a web.xml"
    else
        echo "❌ Error al inyectar CSRF whitelist en web.xml"
        exit 1
    fi
fi

echo "🔎 Validando inserción en web.xml..."
grep -A2 "GEOSERVER_CSRF_WHITELIST" "$WEB_XML" || echo "❌ No se encontró el bloque esperado en web.xml"


echo "🔍 Verificando estructura de csp.xml..."
xmlstarlet sel -t -c "/config/enabled" "$CSP_XML" || echo "❌ No se encontró el nodo headerConfig en csp.xml"


# Desactivando Content-Security-Policy
echo "🔄 Modificando enableCSPHeader a false en csp.xml..."
    xmlstarlet ed -L \
    -u "/config/enabled" -v "false" \
    "$CSP_XML"


echo "🔎 Validando que CSP esté deshabilitado en csp.xml..."
if xmlstarlet sel -t -v "/config/enabled" "$CSP_XML" | grep -q "false"; then
    echo "✅ Validación exitosa: Content-Security-Policy está deshabilitado."
else
    echo "❌ Validación fallida: Content-Security-Policy sigue habilitado."
    exit 1
fi


# Mostrar Content-Security-Policy
echo "📄 Contenido actual de csp.xml:"
cat "$CSP_XML"


# Reiniciar el servicio de GeoServer (Tomcat)
echo "⏳ Deteniendo GeoServer..."
/usr/local/tomcat/bin/shutdown.sh || echo "❌ No se pudo detener GeoServer, podría no estar en ejecución o ya estar detenido."

# Esperar unos segundos para asegurar que el servicio se detenga completamente
sleep 5

echo "⏳ Iniciando GeoServer..."
/usr/local/tomcat/bin/startup.sh || echo "❌ Error al iniciar GeoServer."

# Mostrar mensaje de confirmación
echo "✅ GeoServer reiniciado para aplicar los cambios en global.xml."