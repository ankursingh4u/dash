import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = createAdminClient();

    const adminEmail = 'admin@codershive.com';
    const adminPassword = 'Admin@123';

    // First, check if the user already exists in Supabase Auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === adminEmail);

    let authUserId: string | undefined;

    if (existingUser) {
      authUserId = existingUser.id;
      console.log('Admin user already exists in auth');
    } else {
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          name: 'System Admin',
          role: 'system_admin'
        }
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        return NextResponse.json({
          success: false,
          error: `Auth error: ${authError.message}`,
        }, { status: 500 });
      }

      authUserId = authUser?.user?.id;
    }

    // Try to create the users table if it doesn't exist
    // Note: This requires the table to be created via Supabase Dashboard SQL Editor
    // The following is just to insert/update the admin record

    if (authUserId) {
      // Check if user record exists
      const { data: existingUserRecord } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUserId)
        .single();

      if (!existingUserRecord) {
        // Insert user record
        const { error: insertError } = await supabase.from('users').insert({
          id: authUserId,
          email: adminEmail,
          password_hash: 'supabase_auth',
          name: 'System Admin',
          role: 'system_admin',
        });

        if (insertError) {
          console.log('User table insert error (table may not exist yet):', insertError.message);
          // This is okay - might need to create tables via Supabase Dashboard
        }
      }
    }

    // Insert default platforms if the table exists
    const platforms = [
      { name: 'ClickBank', slug: 'clickbank', description: 'Digital products marketplace', base_url: 'https://clickbank.com' },
      { name: 'Digistore24', slug: 'digistore24', description: 'Digital products and services', base_url: 'https://digistore24.com' },
      { name: 'MaxBounty', slug: 'maxbounty', description: 'CPA affiliate network', base_url: 'https://maxbounty.com' },
      { name: 'ShareASale', slug: 'shareasale', description: 'Affiliate marketing network', base_url: 'https://shareasale.com' },
    ];

    const { data: existingPlatforms } = await supabase.from('platforms').select('id');

    if (!existingPlatforms || existingPlatforms.length === 0) {
      const { error: platformError } = await supabase.from('platforms').insert(platforms);
      if (platformError) {
        console.log('Platform insert error (table may not exist yet):', platformError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully in Supabase Auth. You can now login.',
      admin: {
        email: adminEmail,
        password: adminPassword
      },
      note: 'If you see database errors, please run the SQL schema in Supabase Dashboard SQL Editor.'
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Setup failed'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to setup the database and create admin user',
    sqlSchema: `
-- Run this SQL in Supabase Dashboard SQL Editor to create tables:

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) DEFAULT 'supabase_auth',
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('system_admin', 'admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platforms table
CREATE TABLE IF NOT EXISTS platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  base_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Identities table
CREATE TABLE IF NOT EXISTS identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  country VARCHAR(100),
  address TEXT,
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Burned', 'Pending Docs')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Websites table
CREATE TABLE IF NOT EXISTS websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  niche VARCHAR(100),
  platform_ids TEXT[],
  identity_id UUID REFERENCES identities(id),
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type VARCHAR(50) NOT NULL,
  last_four VARCHAR(4) NOT NULL,
  expiry_date VARCHAR(10) NOT NULL,
  identity_id UUID REFERENCES identities(id),
  billing_address TEXT,
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Blocked')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advertisers table
CREATE TABLE IF NOT EXISTS advertisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES platforms(id),
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_name VARCHAR(255),
  commission_rate DECIMAL(5,2),
  payment_terms VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Pending')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Accounts table
CREATE TABLE IF NOT EXISTS platform_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES platforms(id),
  account_name VARCHAR(255) NOT NULL,
  account_email VARCHAR(255) NOT NULL,
  affiliate_id VARCHAR(100),
  encrypted_password TEXT,
  identity_id UUID REFERENCES identities(id),
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Pending')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES platforms(id),
  account_id UUID REFERENCES platform_accounts(id),
  advertiser_id UUID REFERENCES advertisers(id),
  order_number VARCHAR(100) NOT NULL,
  product_name VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Declined', 'Refunded')),
  order_date TIMESTAMP WITH TIME ZONE NOT NULL,
  refund_reminder_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Undo History table
CREATE TABLE IF NOT EXISTS undo_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  entity_name VARCHAR(255),
  previous_data JSONB,
  new_data JSONB,
  reverted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE undo_history ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for authenticated users for now)
CREATE POLICY "Allow all for authenticated users" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON platforms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON identities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON websites FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON cards FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON advertisers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON platform_accounts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON undo_history FOR ALL USING (auth.role() = 'authenticated');

-- Insert default platforms
INSERT INTO platforms (name, slug, description, base_url) VALUES
  ('ClickBank', 'clickbank', 'Digital products marketplace', 'https://clickbank.com'),
  ('Digistore24', 'digistore24', 'Digital products and services', 'https://digistore24.com'),
  ('MaxBounty', 'maxbounty', 'CPA affiliate network', 'https://maxbounty.com'),
  ('ShareASale', 'shareasale', 'Affiliate marketing network', 'https://shareasale.com')
ON CONFLICT (slug) DO NOTHING;
    `
  });
}
