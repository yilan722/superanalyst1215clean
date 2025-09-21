# Subscription Tiers Implementation

## 📋 Overview

This document describes the implementation of the new `subscription_tiers` table and related functionality for managing different subscription levels in the TopAnalyst application.

## 🗄️ Database Schema

### Table: `subscription_tiers`

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique identifier |
| `name` | VARCHAR(50) | Tier name (Free, Basic, Pro, Business, Enterprise) |
| `daily_report_limit` | INTEGER | Maximum reports allowed per day |
| `additional_purchase` | DECIMAL(10,2) | Price per additional report beyond daily limit |
| `monthly_report_limit` | INTEGER | Maximum reports allowed per month (0 = unlimited) |
| `price_monthly` | DECIMAL(10,2) | Monthly subscription price |
| `features` | JSONB | JSON object containing tier features and capabilities |
| `is_active` | BOOLEAN | Whether this tier is currently available |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## 🎯 Subscription Tiers

### 1. Free Tier
- **Price**: $0/month
- **Daily Limit**: 1 report
- **Additional Purchase**: $0 (not available)
- **Features**: Basic AI analysis, basic charts
- **Target**: New users, trial users

### 2. Basic Tier
- **Price**: $9.99/month
- **Daily Limit**: 5 reports
- **Additional Purchase**: $2.99/report
- **Features**: AI analysis, basic charts, email support
- **Target**: Individual investors

### 3. Pro Tier
- **Price**: $29.99/month
- **Daily Limit**: 20 reports
- **Additional Purchase**: $1.99/report
- **Features**: All Basic features + priority support + advanced analytics
- **Target**: Active traders, financial professionals

### 4. Business Tier
- **Price**: $79.99/month
- **Daily Limit**: 50 reports
- **Additional Purchase**: $1.49/report
- **Features**: All Pro features + custom reports + API access
- **Target**: Small businesses, investment firms

### 5. Enterprise Tier
- **Price**: $199.99/month
- **Daily Limit**: 200 reports
- **Additional Purchase**: $0.99/report
- **Features**: All Business features + dedicated support + custom integrations + white label
- **Target**: Large enterprises, financial institutions

## 📁 Files Created

### 1. Database Migration
- **File**: `supabase/migrations/011_create_subscription_tiers.sql`
- **Purpose**: Creates the table, indexes, RLS policies, and inserts default data

### 2. TypeScript Types
- **File**: `types/subscription.ts`
- **Purpose**: Type definitions for subscription tiers and related interfaces

### 3. Subscription Service
- **File**: `lib/subscription-service.ts`
- **Purpose**: Business logic for managing subscription tiers and user subscriptions

### 4. Migration Script
- **File**: `scripts/apply-subscription-tiers-migration.js`
- **Purpose**: Applies the database migration

### 5. Test Script
- **File**: `scripts/test-subscription-tiers.js`
- **Purpose**: Tests the subscription tiers functionality

## 🚀 Usage Examples

### Get All Active Tiers
```typescript
import { SubscriptionService } from '@/lib/subscription-service'

const tiers = await SubscriptionService.getActiveTiers()
console.log(tiers)
```

### Get User Subscription Info
```typescript
const userInfo = await SubscriptionService.getUserSubscriptionInfo(userId)
console.log(userInfo)
// Output: {
//   current_tier: 'Free',
//   daily_reports_used: 0,
//   daily_reports_remaining: 1,
//   can_generate_report: true,
//   upgrade_available: true
// }
```

### Check Report Generation Permission
```typescript
const canGenerate = await SubscriptionService.canUserGenerateReport(userId)
if (canGenerate.canGenerate) {
  // User can generate report
} else {
  // Show upgrade modal with canGenerate.reason
}
```

### Get Tier Comparison for Pricing Page
```typescript
const comparison = await SubscriptionService.getTierComparison()
// Returns tiers with isPopular and isRecommended flags
```

## 🔧 Migration Instructions

### 1. Apply the Migration
```bash
node scripts/apply-subscription-tiers-migration.js
```

### 2. Test the Implementation
```bash
node scripts/test-subscription-tiers.js
```

### 3. Verify in Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to Table Editor
- Check that `subscription_tiers` table exists
- Verify that 5 tiers are inserted (Free, Basic, Pro, Business, Enterprise)

## 🔒 Security Features

### Row Level Security (RLS)
- **Public Read Access**: Anyone can read subscription tiers (for pricing page)
- **Service Role Only**: Only service role can modify subscription tiers
- **User Data Protection**: User subscription data is protected by existing RLS policies

### Data Validation
- Unique constraint on tier names
- Proper data types and constraints
- JSON schema validation for features

## 📊 Integration Points

### 1. User Registration
- New users automatically get 'Free' tier
- `free_reports_used` field tracks usage

### 2. Report Generation
- Check user's tier and limits before generation
- Increment usage counters after generation
- Show upgrade prompts when limits reached

### 3. Subscription Management
- Link user subscriptions to tier names
- Handle tier upgrades and downgrades
- Manage subscription expiration

### 4. Pricing Page
- Display all active tiers
- Show feature comparisons
- Highlight popular/recommended tiers

## 🎨 Frontend Integration

### Subscription Modal Updates
```typescript
// In subscription modal component
const tiers = await SubscriptionService.getActiveTiers()
const userInfo = await SubscriptionService.getUserSubscriptionInfo(userId)

// Show appropriate upgrade options based on current tier
```

### Report Generation Flow
```typescript
// In report generation component
const canGenerate = await SubscriptionService.canUserGenerateReport(userId)

if (!canGenerate.canGenerate) {
  if (canGenerate.reason === 'No free report quota left') {
    // Show subscription modal with specific message
    setShowSubscriptionModal(true)
    toast.error('No free report quota left')
  }
}
```

## 🔄 Future Enhancements

### 1. Dynamic Pricing
- Admin interface to modify tier pricing
- A/B testing for different pricing strategies
- Regional pricing support

### 2. Feature Flags
- Enable/disable features per tier
- Gradual feature rollouts
- Custom feature sets

### 3. Usage Analytics
- Track tier usage patterns
- Identify upgrade opportunities
- Monitor feature adoption

### 4. Automated Billing
- Integration with Stripe for recurring billing
- Prorated upgrades/downgrades
- Invoice generation

## 📝 Notes

- The migration includes proper indexes for performance
- All timestamps are automatically managed
- Features are stored as JSONB for flexibility
- The system is designed to be easily extensible
- Backward compatibility is maintained with existing user data

## ✅ Testing Checklist

- [ ] Migration runs successfully
- [ ] All 5 tiers are created with correct data
- [ ] RLS policies work correctly
- [ ] Service functions work as expected
- [ ] Frontend integration works
- [ ] User subscription logic works
- [ ] Report generation limits work
- [ ] Upgrade flows work correctly
