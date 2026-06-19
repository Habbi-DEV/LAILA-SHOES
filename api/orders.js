import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { status, id } = req.query;

      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (id) query = query.eq('id', id);
      if (status) query = query.eq('status', status);

      const { data: orders, error } = await query;
      if (error) throw error;

      const { data: allItems } = await supabase.from('order_items').select('*');

      const result = (orders || []).map(order => ({
        ...order,
        order_items: (allItems || []).filter(item => item.order_id === order.id)
      }));

      if (id) {
        return res.status(200).json(result[0] || null);
      }

      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const { customer_name, customer_phone, wilaya, address, total_amount, items } = req.body;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ customer_name, customer_phone, wilaya, address, total_amount, status: 'pending' })
        .select('*')
        .single();
      if (orderError) throw orderError;

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

        for (const item of items) {
          const { data: product } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
          if (product && product.stock >= item.quantity) {
            await supabase.from('products').update({ stock: product.stock - item.quantity }).eq('id', item.product_id);
          }
        }
      }

      const { data: newItems } = await supabase.from('order_items').select('*').eq('order_id', order.id);
      order.order_items = newItems || [];

      return res.status(201).json(order);
    }

    if (req.method === 'PUT') {
      const { id, status } = req.body;
      if (!id) return res.status(400).json({ error: 'Order ID is required' });
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;

      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', data.id);
      data.order_items = items || [];

      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Order ID is required' });

      await supabase.from('order_items').delete().eq('order_id', id);

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
