// Debug script to check subscription data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugSubscriptionData() {
  console.log('🔍 Debugging Subscription Data...\n');
  
  try {
    // 1. Check subscription tiers
    console.log('📊 Subscription Tiers:');
    const { data: tiers, error: tiersError } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('id');
    
    if (tiersError) {
      console.error('❌ Error fetching tiers:', tiersError);
    } else {
      tiers.forEach(tier => {
        console.log(`  ID: ${tier.id}, Name: ${tier.name}, Monthly Limit: ${tier.monthly_report_limit}, Price: $${tier.price_monthly}`);
      });
    }
    
    console.log('\n');
    
    // 2. Check users with subscriptions
    console.log('👥 Users with Subscriptions:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        subscription_id,
        subscription_end,
        paid_reports_used,
        free_reports_used,
        subscription_tiers!subscription_id(
          id,
          name,
          monthly_report_limit,
          price_monthly
        )
      `)
      .not('subscription_id', 'is', null)
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      users.forEach(user => {
        console.log(`  User: ${user.email}`);
        console.log(`    Subscription ID: ${user.subscription_id}`);
        console.log(`    Subscription End: ${user.subscription_end}`);
        console.log(`    Tier: ${user.subscription_tiers?.name || 'null'}`);
        console.log(`    Monthly Limit: ${user.subscription_tiers?.monthly_report_limit || 'null'}`);
        console.log(`    Reports Used: ${user.paid_reports_used + user.free_reports_used}`);
        console.log('');
      });
    }
    
    // 3. Check if subscription is active
    if (users.length > 0) {
      const user = users[0];
      if (user.subscription_end) {
        const endDate = new Date(user.subscription_end);
        const isActive = endDate > new Date();
        console.log(`🔍 Subscription Active Check for ${user.email}:`);
        console.log(`  End Date: ${endDate.toISOString()}`);
        console.log(`  Current Date: ${new Date().toISOString()}`);
        console.log(`  Is Active: ${isActive}`);
        console.log(`  Monthly Limit: ${isActive ? (user.subscription_tiers?.monthly_report_limit || 0) : 0}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugSubscriptionData();
