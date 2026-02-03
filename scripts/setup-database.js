const { Client } = require('pg');

const DATABASE_PASSWORD = process.env.SUPABASE_DB_PASSWORD || process.argv[2];

if (!DATABASE_PASSWORD) {
  console.error('Please provide the database password as an argument or set SUPABASE_DB_PASSWORD env variable');
  console.error('Usage: node scripts/setup-database.js YOUR_PASSWORD');
  process.exit(1);
}

const connectionString = `postgresql://postgres.pnhiohdiywvbzqsvznny:${DATABASE_PASSWORD}@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres`;

const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Insert default platforms
INSERT INTO platforms (name, slug, description, base_url) VALUES
  ('ClickBank', 'clickbank', 'Digital products marketplace', 'https://clickbank.com'),
  ('Digistore24', 'digistore24', 'Digital products and services', 'https://digistore24.com'),
  ('MaxBounty', 'maxbounty', 'CPA affiliate network', 'https://maxbounty.com'),
  ('ShareASale', 'shareasale', 'Affiliate marketing network', 'https://shareasale.com')
ON CONFLICT (slug) DO NOTHING;

-- Insert admin user (you'll need to create the auth user separately via Supabase Auth)
INSERT INTO users (id, email, name, role) VALUES
  (gen_random_uuid(), 'admin@codershive.com', 'System Admin', 'system_admin')
ON CONFLICT (email) DO NOTHING;
`;

async function setupDatabase() {
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Supabase database...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Running schema...');
    await client.query(schema);
    console.log('Schema created successfully!');

    // Verify tables
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\nCreated tables:');
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));

    console.log('\n✅ Database setup complete!');
    console.log('\nAdmin credentials:');
    console.log('  Email: admin@codershive.com');
    console.log('  Password: Admin@123');
    console.log('\nNote: Click "Setup Database" on the login page to create the auth user.');

  } catch (error) {
    console.error('Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
