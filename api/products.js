import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { category, featured, best_seller, search, min_price, max_price, color, size } = req.query;
      
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      
      if (category) query = query.eq('category_id', category);
      if (featured === 'true') query = query.eq('featured', true);
      if (best_seller === 'true') query = query.eq('best_seller', true);
      if (search) query = query.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%,description.ilike.%${search}%`);
      if (min_price) query = query.gte('price', parseFloat(min_price));
      if (max_price) query = query.lte('price', parseFloat(max_price));
      if (color) query = query.contains('colors', [color]);
      if (size) query = query.contains('sizes', [size]);
      
      const { data: products, error } = await query;
      if (error) throw error;

      const { data: categories } = await supabase.from('categories').select('*');
      const catMap = {};
      (categories || []).forEach(c => { catMap[c.id] = c; });

      const result = (products || []).map(p => ({
        ...p,
        categories: catMap[p.category_id] || null
      }));

      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const body = req.body;
      const { name, name_ar, description, description_ar, price, category_id, sizes, stock, featured, best_seller } = body;
      
      let images = body.images || [];
      let colors = body.colors || [];
      
      if (body.variants && Array.isArray(body.variants) && body.variants.length > 0) {
        colors = body.variants.map(v => v.color).filter(Boolean);
        images = body.variants[0]?.images || body.images || [];
      }

      const insertData = {
        name,
        name_ar: name_ar || null,
        description: description || null,
        description_ar: description_ar || null,
        price: parseFloat(price),
        category_id: parseInt(category_id),
        images: Array.isArray(images) ? images : [],
        colors: Array.isArray(colors) ? colors : [],
        sizes: Array.isArray(sizes) ? sizes : [],
        stock: parseInt(stock) || 0,
        featured: featured || false,
        best_seller: best_seller || false
      };

      if (body.variants) {
        insertData.variants = body.variants;
      }

      const { data, error } = await supabase
        .from('products')
        .insert(insertData)
        .select('*')
        .single();
      if (error) throw error;

      const { data: cat } = await supabase.from('categories').select('*').eq('id', data.category_id).single();
      data.categories = cat || null;

      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'Product ID is required' });
      
      if (updates.price !== undefined) updates.price = parseFloat(updates.price);
      if (updates.category_id !== undefined) updates.category_id = parseInt(updates.category_id);
      if (updates.stock !== undefined) updates.stock = parseInt(updates.stock) || 0;
      if (updates.images !== undefined) updates.images = Array.isArray(updates.images) ? updates.images : [];
      if (updates.colors !== undefined) updates.colors = Array.isArray(updates.colors) ? updates.colors : [];
      if (updates.sizes !== undefined) updates.sizes = Array.isArray(updates.sizes) ? updates.sizes : [];
      
      if (updates.variants && Array.isArray(updates.variants) && updates.variants.length > 0) {
        updates.colors = updates.variants.map(v => v.color).filter(Boolean);
        updates.images = updates.variants[0]?.images || updates.images || [];
      }

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;

      const { data: cat } = await supabase.from('categories').select('*').eq('id', data.category_id).single();
      data.categories = cat || null;

      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Product ID is required' });
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Products API error:', err);
    res.status(500).json({ error: err.message });
  }
}
