/**
 * Documents every environment variable backend/config/config.php reads,
 * with safe placeholders — never real credentials (section 85). Kept in
 * sync with phpConfigGenerator.js by listing the exact same keys; if a new
 * config value is ever added there, it belongs here too.
 */
export function generateEnvExample() {
  return `# Copy this file to .env and fill in real values for your environment.
# Never commit the real .env file — only this example belongs in version control.

# MySQL connection (used only if you enabled database storage)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=formforge
DB_USER=root
DB_PASSWORD=

# Where uploaded files are stored. Keep this outside your web server's public
# document root so uploaded files can never be requested (and therefore never
# executed) directly by URL.
UPLOAD_DIR=../../uploads

# Origin allowed to call this API from a browser (e.g. https://example.com).
# "*" allows any origin — fine for local development, narrow it for production.
CORS_ALLOWED_ORIGIN=*
`
}
