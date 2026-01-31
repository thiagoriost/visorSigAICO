#!/bin/bash

set -e

BACKUP_FILE="./docker-entrypoint-initdb.d/backup/sig_opiac.backup"

# Verifica si el archivo .backup existe
if [ -f "$BACKUP_FILE" ]; then
    echo "Restaurando base de datos desde $BACKUP_FILE"
    pg_restore --verbose --no-owner --no-acl --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$BACKUP_FILE"
else
    echo "No se encontró el archivo de respaldo: $BACKUP_FILE"
fi