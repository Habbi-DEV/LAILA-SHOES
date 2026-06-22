import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // GET variants for a product
    if (req.method === 'GET') {
      const { product_id } = req.query;
      if (!product_id) return res.status(400).json({ error: 'product_id is required' });
      
      const { data, error } = await supabase
        .from('variants')
        .select('*')
        .eq('product_id', product_id)
        .order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    // POST - create a single variant
    if (req.method === 'POST') {
      const { product_id, color, pointure, stock } = req.body;
      if (!product_id || !color) return res.status(400).json({ error: 'product_id and color are required' });
      
      const { data, error } = await supabase
        .from('variants')
        .insert({ product_id, color, pointure: pointure || null, stock: stock || 0 })
        .select('*')
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    // PUT - update a variant
    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'Variant ID is required' });
      const { data, error } = await supabase
        .from('variants')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    // DELETE - delete a variant
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Variant ID is required' });
      const { error } = await supabase
        .from('variants')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    // POST batch - create multiple variants at once
    if (req.method === 'PATCH') {
      const { variants } = req.body;
      if (!Array.isArray(variants)) return res.status(400).json({ error: 'variants array is required' });
      
      const { data, error } = await supabase
        .from('variants')
        .insert(variants)
        .select('*');
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Variants API error:', err);
    res.status(500).json({ error: err.message });
  }
}
