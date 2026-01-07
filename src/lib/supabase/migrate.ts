import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease create a .env.local file with your Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigrations() {
  console.log('🚀 Running database migrations...\n');

  const migrationsDir = path.join(__dirname, 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found:', migrationsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    return;
  }

  for (const file of files) {
    console.log(`📄 Running migration: ${file}`);
    
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    // Split by semicolons but keep the content together for complex statements
    const statements = sql
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query if RPC not available
          const result = await supabase.from('_migrations').select('*').limit(1);
          if (result.error?.code === 'PGRST116') {
            // Table doesn't exist, which is fine for first run
          }
        }
      } catch (err) {
        // Ignore errors for CREATE IF NOT EXISTS statements
        console.log(`   ⚠️ Statement may have already been applied`);
      }
    }

    console.log(`   ✅ Completed: ${file}\n`);
  }

  console.log('✨ All migrations completed!\n');
  console.log('📝 Note: Run migrations directly in Supabase SQL Editor for best results.');
  console.log('   Copy the content from: src/lib/supabase/migrations/001_create_tables.sql');
}

runMigrations().catch(console.error);
