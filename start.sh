#!/bin/sh
# Si DATABASE_URL est vide, on le construit depuis les variables Postgres individuelles
if [ -z "$DATABASE_URL" ] && [ -n "$PGHOST" ]; then
  export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
  echo "DATABASE_URL construit depuis les variables PG : postgresql://${PGUSER}:***@${PGHOST}:${PGPORT}/${PGDATABASE}"
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERREUR : DATABASE_URL non défini et variables PGHOST/PGUSER manquantes."
  echo "Connecte le service Postgres dans Railway via une Variable Reference."
  exit 1
fi

npm run db:setup && npm run start
