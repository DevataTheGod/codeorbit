#!/bin/bash
# CodeOrbit Repository Reorganization Script
set -e

echo "🏗️ Starting Repository Reorganization..."

# 1. Create directory structures
echo "📂 Creating directories..."
mkdir -p docs/architecture docs/api docs/deployment docs/development docs/database docs/integrations docs/troubleshooting docs/reports
mkdir -p database/schema database/migrations database/seed database/backups database/setup
mkdir -p frontend
mkdir -p backend
mkdir -p functions
mkdir -p scripts
mkdir -p assets
mkdir -p tests
mkdir -p config
mkdir -p archive

# 2. Move source files
echo "⚛️ Moving frontend source files..."
mv src frontend/src
mv index.html frontend/index.html
mv public frontend/public

echo "⚛️ Extracting backend from frontend..."
mv frontend/src/backend backend/backend

# 3. Move Edge Functions and Migrations
echo "🔥 Moving Supabase resources..."
mv supabase/functions/* functions/
mv supabase/migrations/* database/migrations/

# 4. Recreate symlinks for Supabase CLI compatibility
echo "🔗 Creating symlinks for Supabase..."
rm -rf supabase/functions supabase/migrations
ln -s ../functions supabase/functions
ln -s ../database/migrations supabase/migrations

# 5. Move SQL files
echo "🗄️ Moving SQL schema and setup scripts..."
mv COMPLETE_DATABASE_SCHEMA.sql database/schema/COMPLETE_DATABASE_SCHEMA.sql || true
mv SCHEMA_SQL_TO_EXECUTE.sql database/schema/SCHEMA_SQL_TO_EXECUTE.sql || true
mv CREATE_MISSING_DASHBOARD_TABLES.sql database/setup/CREATE_MISSING_DASHBOARD_TABLES.sql || true
mv CREATE_MISSING_HELP_REQUESTS_TABLE.sql database/setup/CREATE_MISSING_HELP_REQUESTS_TABLE.sql || true
mv CREATE_OLD_CHAT_MESSAGES_TABLE.sql database/setup/CREATE_OLD_CHAT_MESSAGES_TABLE.sql || true
mv CREATE_USER_TRIGGER.sql database/setup/CREATE_USER_TRIGGER.sql || true
mv FIX_DATABASE_SYNC.sql database/setup/FIX_DATABASE_SYNC.sql || true

# 6. Move scripts & tests
echo "📜 Moving scripts and tests..."
mv deploy.bat scripts/deploy.bat || true
mv deploy.sh scripts/deploy.sh || true
mv test-chatbot-simulation.ts tests/test-chatbot-simulation.ts || true

# 7. Move docs to subdirectories
echo "📝 Moving documentation to categorized subdirectories..."
mv CHATBOT_SIMULATION_RESULTS.md docs/reports/CHATBOT_SIMULATION_RESULTS.md || true
mv CONVERSATION_PERSISTENCE_GUIDE.md docs/development/CONVERSATION_PERSISTENCE_GUIDE.md || true
mv CREDENTIALS_AND_CODE_CHANGES.md archive/CREDENTIALS_AND_CODE_CHANGES.md || true
mv CSV_DATA_IMPORT_GUIDE.md docs/database/CSV_DATA_IMPORT_GUIDE.md || true
mv DATABASE_COMPARISON.md docs/database/DATABASE_COMPARISON.md || true
mv DATABASE_MIGRATION_GUIDE.md docs/database/DATABASE_MIGRATION_GUIDE.md || true
mv DATABASE_SETUP_CHECKLIST.md docs/database/DATABASE_SETUP_CHECKLIST.md || true
mv DEPLOYMENT_GUIDE.md docs/deployment/DEPLOYMENT_GUIDE.md || true
mv EXECUTE_SCHEMA_QUICK_GUIDE.md docs/database/EXECUTE_SCHEMA_QUICK_GUIDE.md || true
mv GOOGLE_AUTH_OTP_SETUP.md docs/integrations/GOOGLE_AUTH_OTP_SETUP.md || true
mv IDE_FILE_SYSTEM_GUIDE.md docs/architecture/IDE_FILE_SYSTEM_GUIDE.md || true
mv OTP_IMPLEMENTATION_GUIDE.md docs/architecture/OTP_IMPLEMENTATION_GUIDE.md || true
mv OTP_SETUP_GUIDE.md docs/integrations/OTP_SETUP_GUIDE.md || true
mv REQUIREMENTS.md docs/development/REQUIREMENTS.md || true
mv TABLE_MAPPING_GUIDE.md docs/database/TABLE_MAPPING_GUIDE.md || true
mv TODO.md docs/development/TODO.md || true
mv API_ENDPOINTS_REFERENCE.ts docs/api/API_ENDPOINTS_REFERENCE.ts || true

# 8. Copy env templates
echo "⚙️ Setting up config environment templates..."
cp .env.example config/.env.example || true

echo "✅ Reorganization scripting complete!"
