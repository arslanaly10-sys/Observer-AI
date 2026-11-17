#!/usr/bin/env bash
# Builds the database for the end-to-end pipeline test (tests/e2e) on a plain Postgres.
set -euo pipefail
cd "$(dirname "$0")/../.."
DB=${E2E_DB:-observer_e2e}
psql -U postgres -q -c "drop database if exists $DB" -c "create database $DB"
psql -U postgres -d $DB -q -v ON_ERROR_STOP=1 -f supabase/tests/auth-shim.sql
for f in supabase/migrations/*.sql; do psql -U postgres -d $DB -q -v ON_ERROR_STOP=1 -f "$f"; done
psql -U postgres -d $DB -q -v ON_ERROR_STOP=1 -f tests/e2e/seed.sql
echo "e2e database ready: $DB"
