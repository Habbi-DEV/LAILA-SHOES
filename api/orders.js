import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { status, id } = req.query;
      if (id) {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', id)
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { customer_name, customer_phone, wilaya, address, total_amount, items } = req.body;
      
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ customer_name, customer_phone, wilaya, address, total_amount, status: 'pending' })
        .select()
        .single();
      if (orderError) throw orderError;

      // Create order items
      if (items && items.length > 0) {
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          color: item.color || null,
          size: item.size || null
        }));
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);
        if (itemsError) throw itemsError;

        // Decrease stock for each item
        for (const item of items) {
          const { data: product } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
          if (product && product.stock >= item.quantity) {
            await supabase.from('products').update({ stock: product.stock - item.quantity }).eq('id', item.product_id);
          }
        }
      }

      return res.status(201).json(order);
    }

    if (req.method === 'PUT') {
      const { id, status } = req.body;
      if (!id) return res.status(400).json({ error: 'Order ID is required' });
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select('*, order_items(*)')
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Order ID is required' });
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Orders API error:', err);
    res.status(500).json({ error: err.message });
  }
}
