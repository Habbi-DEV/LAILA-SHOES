import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      // Add variants column if not exists
      const { error } = await supabase.rpc('exec_sql', { 
        sql: "ALTER TABLE products ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb" 
      });
      
      // If rpc doesn't work, try direct approach - check if column exists
      const { data: checkData, error: checkError } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      // Try to select variants column to see if it exists
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('id, variants')
        .limit(1);

      if (testError && testError.message?.includes('variants')) {
        // Column doesn't exist - we need to create it
        // Since we can't ALTER TABLE via the client, return instructions
        return res.status(200).json({ 
          status: 'needs_manual_add',
          message: 'Variants column does not exist. Please add it via Supabase SQL Editor.',
          sql: "ALTER TABLE products ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb;"
        });
      }

      return res.status(200).json({ 
        status: 'exists',
        message: 'Variants column already exists or was created successfully'
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Migrate error:', err);
    res.status(500).json({ error: err.message });
  }
}
