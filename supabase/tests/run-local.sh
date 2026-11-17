#!/usr/bin/env bash
# Runs the Observer migrations and RLS tests against a throwaway database on a plain Postgres.
# Usage: PGHOST=/path/to/socket PGPORT=5544 supabase/tests/run-local.sh
set -uo pipefail
cd "$(dirname "$0")/../.."
DB=observer_rls_test
psql -U postgres -q -c "drop database if exists $DB" -c "create database $DB" || exit 1
psql -U postgres -d $DB -q -v ON_ERROR_STOP=1 -f supabase/tests/auth-shim.sql || exit 1
for f in supabase/migrations/*.sql; do
  echo "migrate  $f"
  psql -U postgres -d $DB -q -v ON_ERROR_STOP=1 -f "$f" || exit 1
done
code=0
for t in supabase/tests/*.test.sql; do
  echo "test     $t"
  out=$(psql -U postgres -d $DB -v ON_ERROR_STOP=1 -f "$t" 2>&1); c=$?
  echo "$out" | grep -E "PASS|FAIL|ERROR|PASSED" | sed 's/^psql:[^ ]* NOTICE:  //'
  [ $c -ne 0 ] && { code=$c; break; }
done
exit $code
