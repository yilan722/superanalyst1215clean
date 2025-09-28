import React, { useState } from 'react'
import { signUp } from '@/app/services/database/supabase-auth'

export default function EnhancedSignUpExample() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [referralSource, setReferralSource] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // 传递额外的用户数据
      const additionalData = {
        company: company || null,
        phone: phone || null,
        referral_source: referralSource || null,
        subscription_tier: 'Free',  // 可以设置默认订阅层级
        subscription_id: 3,        // 可以设置默认订阅ID
        preferences: {
          theme: 'light',
          language: 'en'
        },
        signup_date: new Date().toISOString(),
        marketing_consent: true
      }

      const result = await signUp(email, password, name, additionalData)
      console.log('✅ 注册成功:', result.user?.id)
      console.log('📊 用户元数据:', result.user?.user_metadata)
      
    } catch (error) {
      console.error('❌ 注册失败:', error)
    }
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div>
        <label>Email:</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
      </div>
      
      <div>
        <label>Password:</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
      </div>
      
      <div>
        <label>Name:</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <div>
        <label>Company:</label>
        <input 
          type="text" 
          value={company} 
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      
      <div>
        <label>Phone:</label>
        <input 
          type="tel" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      
      <div>
        <label>Referral Source:</label>
        <select 
          value={referralSource} 
          onChange={(e) => setReferralSource(e.target.value)}
        >
          <option value="">Select...</option>
          <option value="google">Google</option>
          <option value="facebook">Facebook</option>
          <option value="linkedin">LinkedIn</option>
          <option value="friend">Friend</option>
        </select>
      </div>
      
      <button type="submit">Sign Up</button>
    </form>
  )
}

// 使用示例：
/*
// 基本注册
await signUp('user@example.com', 'password123', 'John Doe')

// 带额外数据的注册
await signUp('user@example.com', 'password123', 'John Doe', {
  company: 'Acme Corp',
  phone: '+1234567890',
  subscription_tier: 'Pro',
  subscription_id: 5,
  referral_source: 'google',
  preferences: {
    theme: 'dark',
    language: 'zh'
  }
})
*/
