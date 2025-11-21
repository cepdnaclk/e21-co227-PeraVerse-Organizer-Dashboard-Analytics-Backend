# overview_analytics service

This service connects to PostgreSQL using `pg`.

## SSL behavior

Local PostgreSQL often does not support SSL, while hosted providers (e.g., Supabase) require it. To avoid the common error `The server does not support SSL connections`, SSL is enabled only when explicitly requested.

Order of precedence for enabling SSL:
1. `DATABASE_SSL=true|1`
2. `PGSSLMODE` in `require|prefer|verify-ca|verify-full` (set `disable` to force off)
3. Connection string containing `sslmode=require`
4. Default: SSL disabled

When connected, the service logs:
```
Connected to Postgres (ssl=on|off)
```

## Environment variables

See `.env.example` for a ready-to-copy template. Common setups:

### Local Postgres (no SSL)
```
PGSSLMODE=disable
DATABASE_SSL=false
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
```

### Hosted (Supabase, etc.)
```
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DB
PGSSLMODE=require
DATABASE_SSL=true
```

Alternatively, you can use:
```
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DB?sslmode=require
```

## Troubleshooting
- Error: `The server does not support SSL connections` → set `PGSSLMODE=disable` or `DATABASE_SSL=false`.
- Error: certificate related in cloud → make sure SSL is on: `PGSSLMODE=require` or `DATABASE_SSL=true` or `sslmode=require` in `DATABASE_URL`.
