// 测试 whitelist_users 表查询
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testWhitelistQuery() {
  console.log('🧪 测试 whitelist_users 表查询...');
  
  try {
    // 测试查询所有白名单用户
    console.log('1. 查询所有白名单用户...');
    const { data: allUsers, error: allError } = await supabase
      .from('whitelist_users')
      .select('*');
    
    if (allError) {
      console.error('❌ 查询所有用户失败:', allError);
    } else {
      console.log('✅ 查询所有用户成功:', allUsers);
    }
    
    // 测试查询特定邮箱
    console.log('2. 查询特定邮箱...');
    const { data: specificUser, error: specificError } = await supabase
      .from('whitelist_users')
      .select('*')
      .eq('email', 'superanalystpro@gmail.com')
      .maybeSingle();
    
    if (specificError) {
      console.error('❌ 查询特定用户失败:', specificError);
    } else {
      console.log('✅ 查询特定用户成功:', specificUser);
    }
    
    // 测试查询不存在的邮箱
    console.log('3. 查询不存在的邮箱...');
    const { data: nonExistentUser, error: nonExistentError } = await supabase
      .from('whitelist_users')
      .select('*')
      .eq('email', 'nonexistent@example.com')
      .maybeSingle();
    
    if (nonExistentError) {
      console.error('❌ 查询不存在用户失败:', nonExistentError);
    } else {
      console.log('✅ 查询不存在用户成功 (应该为 null):', nonExistentUser);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

testWhitelistQuery();
