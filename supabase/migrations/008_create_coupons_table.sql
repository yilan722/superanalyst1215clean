-- 创建coupons表
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('fixed_amount', 'percentage')),
  discount_value DECIMAL(10,2) NOT NULL,
  max_discount_amount DECIMAL(10,2), -- 对于百分比折扣，限制最大折扣金额
  min_order_amount DECIMAL(10,2) DEFAULT 0, -- 最低订单金额要求
  max_uses INTEGER, -- 最大使用次数，NULL表示无限制
  used_count INTEGER DEFAULT 0, -- 已使用次数
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建coupon_usage表，记录coupon使用情况
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_id VARCHAR(255), -- Stripe order ID或其他订单ID
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, user_id) -- 每个用户每个coupon只能使用一次
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON public.coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON public.coupon_usage(coupon_id);

-- 插入测试coupon：为liuyilan72@outlook.com用户提供20美金减免
INSERT INTO public.coupons (
  code,
  description,
  discount_type,
  discount_value,
  min_order_amount,
  max_uses,
  valid_until
) VALUES (
  'WELCOME20',
  'Welcome discount for liuyilan72@outlook.com - $20 off',
  'fixed_amount',
  20.00,
  49.00, -- 最低订单金额$49（Basic计划价格）
  1, -- 只能使用1次
  NOW() + INTERVAL '1 year' -- 一年有效期
);

-- 为特定用户创建专属coupon
INSERT INTO public.coupons (
  code,
  description,
  discount_type,
  discount_value,
  min_order_amount,
  max_uses,
  valid_until
) VALUES (
  'LIUYILAN20',
  'Special discount for liuyilan72@outlook.com - $20 off',
  'fixed_amount',
  20.00,
  49.00,
  1,
  NOW() + INTERVAL '1 year'
);

-- 为liuyilan72@outlook.com用户创建三张45美金优惠券
INSERT INTO public.coupons (
  code,
  description,
  discount_type,
  discount_value,
  min_order_amount,
  max_uses,
  valid_until
) VALUES 
(
  'LIUYILAN45A',
  'Premium discount for liuyilan72@outlook.com - $45 off (Coupon A)',
  'fixed_amount',
  45.00,
  49.00,
  1,
  NOW() + INTERVAL '1 year'
),
(
  'LIUYILAN45B',
  'Premium discount for liuyilan72@outlook.com - $45 off (Coupon B)',
  'fixed_amount',
  45.00,
  49.00,
  1,
  NOW() + INTERVAL '1 year'
),
(
  'LIUYILAN45C',
  'Premium discount for liuyilan72@outlook.com - $45 off (Coupon C)',
  'fixed_amount',
  45.00,
  49.00,
  1,
  NOW() + INTERVAL '1 year'
);

-- 创建函数来验证coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code VARCHAR(50),
  p_user_id UUID,
  p_order_amount DECIMAL(10,2)
) RETURNS JSON AS $$
DECLARE
  coupon_record RECORD;
  usage_count INTEGER;
  result JSON;
BEGIN
  -- 查找coupon
  SELECT * INTO coupon_record
  FROM public.coupons
  WHERE code = p_code
    AND is_active = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW());
  
  -- 如果coupon不存在
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invalid coupon code'
    );
  END IF;
  
  -- 检查最低订单金额
  IF p_order_amount < coupon_record.min_order_amount THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Order amount is below minimum requirement'
    );
  END IF;
  
  -- 检查使用次数限制
  IF coupon_record.max_uses IS NOT NULL THEN
    SELECT COUNT(*) INTO usage_count
    FROM public.coupon_usage
    WHERE coupon_id = coupon_record.id;
    
    IF usage_count >= coupon_record.max_uses THEN
      RETURN json_build_object(
        'valid', false,
        'error', 'Coupon usage limit exceeded'
      );
    END IF;
  END IF;
  
  -- 检查用户是否已经使用过这个coupon
  SELECT COUNT(*) INTO usage_count
  FROM public.coupon_usage
  WHERE coupon_id = coupon_record.id AND user_id = p_user_id;
  
  IF usage_count > 0 THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'You have already used this coupon'
    );
  END IF;
  
  -- 计算折扣金额
  DECLARE
    discount_amount DECIMAL(10,2);
  BEGIN
    IF coupon_record.discount_type = 'fixed_amount' THEN
      discount_amount := LEAST(coupon_record.discount_value, p_order_amount);
    ELSE -- percentage
      discount_amount := p_order_amount * (coupon_record.discount_value / 100);
      IF coupon_record.max_discount_amount IS NOT NULL THEN
        discount_amount := LEAST(discount_amount, coupon_record.max_discount_amount);
      END IF;
    END IF;
  END;
  
  -- 返回验证结果
  RETURN json_build_object(
    'valid', true,
    'coupon_id', coupon_record.id,
    'code', coupon_record.code,
    'description', coupon_record.description,
    'discount_type', coupon_record.discount_type,
    'discount_value', coupon_record.discount_value,
    'discount_amount', discount_amount,
    'final_amount', p_order_amount - discount_amount
  );
END;
$$ LANGUAGE plpgsql;

-- 创建函数来应用coupon
CREATE OR REPLACE FUNCTION public.apply_coupon(
  p_coupon_id UUID,
  p_user_id UUID,
  p_order_id VARCHAR(255),
  p_discount_amount DECIMAL(10,2)
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- 记录coupon使用
  INSERT INTO public.coupon_usage (
    coupon_id,
    user_id,
    order_id,
    discount_amount
  ) VALUES (
    p_coupon_id,
    p_user_id,
    p_order_id,
    p_discount_amount
  );
  
  -- 更新coupon使用次数
  UPDATE public.coupons
  SET used_count = used_count + 1,
      updated_at = NOW()
  WHERE id = p_coupon_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Coupon applied successfully'
  );
END;
$$ LANGUAGE plpgsql;
