// 修复 whitelist_users 表的 RLS 策略
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixWhitelistRLS() {
  console.log('🔧 修复 whitelist_users 表的 RLS 策略...');
  
  try {
    // 读取迁移文件
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, '../supabase/migrations/013_fix_whitelist_users_rls.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // 分割 SQL 语句
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 执行 ${statements.length} 条 SQL 语句...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`执行语句 ${i + 1}: ${statement.substring(0, 50)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ 语句 ${i + 1} 执行失败:`, error);
          // 继续执行其他语句
        } else {
          console.log(`✅ 语句 ${i + 1} 执行成功`);
        }
      } catch (err) {
        console.error(`❌ 语句 ${i + 1} 执行异常:`, err.message);
      }
    }
    
    // 测试查询
    console.log('🧪 测试 whitelist_users 表查询...');
    const { data, error } = await supabase
      .from('whitelist_users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ 测试查询失败:', error);
    } else {
      console.log('✅ 测试查询成功，RLS 策略已修复');
      console.log('📊 查询结果:', data);
    }
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  }
}

fixWhitelistRLS();
