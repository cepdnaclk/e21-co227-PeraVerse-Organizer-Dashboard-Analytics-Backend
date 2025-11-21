const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Load env from current CWD first, then fallback to service root (../../.env)
dotenv.config();
const serviceRootEnv = path.resolve(__dirname, "../../.env");
if (
  !process.env.DATABASE_URL &&
  !process.env.DB_PASSWORD &&
  !process.env.PGPASSWORD &&
  fs.existsSync(serviceRootEnv)
) {
  dotenv.config({ path: serviceRootEnv });
}

// Helper: read env with default
const env = (name, def = undefined) => {
  const v = process.env[name];
  return v === undefined || v === "" ? def : v;
};

// Determine SSL setting based on environment and connection string
const shouldEnableSSL = (() => {
  const PGSSLMODE = env("PGSSLMODE", "");
  const DATABASE_SSL = env("DATABASE_SSL", "");
  const DATABASE_URL = env("DATABASE_URL", "");
  // Explicit flags take precedence
  if (DATABASE_SSL) {
    const flag = DATABASE_SSL.toLowerCase();
    if (flag === "true" || flag === "1") return true;
    if (["false", "0", "off"].includes(flag)) return false;
  }
  if (PGSSLMODE) {
    const mode = PGSSLMODE.toLowerCase();
    if (mode === "disable") return false;
    if (["require", "prefer", "verify-ca", "verify-full"].includes(mode)) return true;
  }
  // Check sslmode in connection string if present
  if (DATABASE_URL && /([?&])sslmode=require(?!\w)/i.test(DATABASE_URL)) {
    return true;
  }
  // Default: off for local/self-hosted Postgres which often doesn't support SSL
  return false;
})();

// Build Pool config supporting either a single DATABASE_URL or discrete DB_* vars
function buildPoolConfig() {
  const DATABASE_URL = env("DATABASE_URL", "");
  const ssl = shouldEnableSSL ? { rejectUnauthorized: false } : false;

  if (DATABASE_URL) {
    // Warn if URL likely missing password
    if (!/\/\/[^:]+:[^@]+@/.test(DATABASE_URL)) {
      console.warn("[DB] DATABASE_URL may be missing a password or it's not URL-encoded.");
    }
    return {
      connectionString: DATABASE_URL,
      ssl,
      keepAlive: true,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }

  // Fallback to discrete vars or PG* vars
  const user = env("DB_USER", env("PGUSER", "postgres"));
  const host = env("DB_HOST", env("PGHOST", "localhost"));
  const database = env("DB_NAME", env("PGDATABASE", "postgres"));
  const rawPassword = env("DB_PASSWORD", env("PGPASSWORD", undefined));
  const port = Number(env("DB_PORT", env("PGPORT", "5432")));

  if (rawPassword === undefined) {
    throw new Error(
      "[DB] Password not provided. Set DB_PASSWORD/PGPASSWORD or provide DATABASE_URL."
    );
  }
  const password = String(rawPassword);
  if (password.length === 0) {
    throw new Error("[DB] Password is empty. Check your .env or environment variables.");
  }

  return {
    user,
    host,
    database,
    password,
    port,
    ssl,
    keepAlive: true,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

const pool = new Pool(buildPoolConfig());

// Log when connected
pool.on("connect", () => console.log(`Connected to Postgres (ssl=${shouldEnableSSL ? "on" : "off"})`));

// Handle unexpected errors on idle clients
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  // Optionally: alert or log for monitoring
});

module.exports = pool;
