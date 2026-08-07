const fs = require('fs')

console.log('📊 Database Schema Setup')
console.log('========================\n')

const sqlContent = fs.readFileSync(__dirname + '/../supabase/migrations/001_init.sql', 'utf8')

console.log('⚠️ Note: Direct SQL execution requires Supabase admin credentials.')
console.log('\n📋 To apply the schema manually:')
console.log('1. Go to: https://supabase.com/dashboard/project/ibgxezibscvdyjpxlglv')
console.log('2. Navigate to: SQL Editor')
console.log('3. Create a new query and paste:\n')
console.log('---')
console.log(sqlContent)
console.log('---')
console.log('\n4. Click "Run"')
console.log('\n✅ Or use Supabase CLI:\n')
console.log('supabase db push')
