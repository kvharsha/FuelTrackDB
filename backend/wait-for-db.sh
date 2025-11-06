#!/bin/sh
# wait-for-db.sh
# Minimal, POSIX-compatible wait script. Accepts optional positional
# arguments: host port -- followed by the command to exec. Environment
# variables DB_USER/DB_PASSWORD are preferred and will be used when set.

# Defaults (can be overridden by env vars or positional args)
DEFAULT_DB_HOST=${1:-db}
DEFAULT_DB_PORT=${2:-3306}

# If the script is invoked with two args and then a command, shift them
# so $@ is the command to run after the DB is ready.
if [ $# -ge 2 ]; then
  DB_HOST=$1
  DB_PORT=$2
  shift 2
else
  DB_HOST=${DB_HOST:-$DEFAULT_DB_HOST}
  DB_PORT=${DB_PORT:-$DEFAULT_DB_PORT}
fi

# Credentials - prefer environment variables; fall back to defaults used
# when the compose file doesn't provide a .env
DB_USER=${DB_USER:-fueltrack_user}
DB_PASSWORD=${DB_PASSWORD:-H@rsha9242218653}

echo "Waiting for database ${DB_HOST}:${DB_PORT} to accept connections..."
# Try a few variants for maximum compatibility with different mysqlclient versions.
# 1) Try with --ssl=0 (works for many MariaDB-derived clients)
# 2) If that errors with 'unknown variable', try without the SSL flag
# 3) As a last resort, try the Unix socket on the DB container (works locally)
while :; do
  # Attempt 1: --ssl=0
  mysqladmin ping -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" --silent --ssl=0 >/dev/null 2>&1 && break

  # Attempt 2: plain ping (no SSL flag)
  mysqladmin ping -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USER}" -p"${DB_PASSWORD}" --silent >/dev/null 2>&1 && break

  # Attempt 3: try socket check by exec'ing into the db container (best-effort)
  if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' | grep -q "fueltrack_db_container"; then
    docker exec fueltrack_db_container sh -c 'mysqladmin ping -S /var/run/mysqld/mysqld.sock --silent' >/dev/null 2>&1 && break
  fi

  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is fully ready - executing command: $@"
exec "$@"
