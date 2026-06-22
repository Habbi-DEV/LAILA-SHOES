import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data: completedOrders } = await supabase.from('orders').select('total_amount').eq('status', 'delivered');
      const totalRevenue = completedOrders?.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0;

      const { data: allOrders } = await supabase.from('orders').select('id');
      const totalOrders = allOrders?.length || 0;

      const { data: pendingData } = await supabase.from('orders').select('id').eq('status', 'pending');
      const pendingOrders = pendingData?.length || 0;

      const { data: allProducts } = await supabase.from('products').select('id');
      const totalProducts = allProducts?.length || 0;

      // Low stock variants (stock <= 3)
      const { data: lowStockVariants } = await supabase
        .from('variants')
        .select('id, product_id, color, pointure, stock')
        .lte('stock', 3);

      // Enrich with product names
      const { data: allProductsData } = await supabase.from('products').select('id, name, name_ar');
      const prodMap = {};
      (allProductsData || []).forEach(p => { prodMap[p.id] = p; });

      const lowStockProducts = (lowStockVariants || []).map(v => ({
        ...v,
        product: prodMap[v.product_id] || null
      }));

      // Best sellers
      const { data: orderItems } = await supabase.from('order_items').select('product_id, product_name, quantity');
      const productSales = {};
      orderItems?.forEach(item => {
        if (!productSales[item.product_id]) productSales[item.product_id] = { name: item.product_name, total_sold: 0 };
        productSales[item.product_id].total_sold += item.quantity;
      });
      const bestSellers = Object.entries(productSales).map(([id, info]) => ({ product_id: id, ...info })).sort((a, b) => b.total_sold - a.total_sold).slice(0, 5);

      // Recent orders
      const { data: recentOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);

      // Sales by status
      const { data: ordersByStatus } = await supabase.from('orders').select('status, total_amount');
      const salesByStatus = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
      ordersByStatus?.forEach(o => { if (salesByStatus[o.status] !== undefined) salesByStatus[o.status] += parseFloat(o.total_amount || 0); });

      // Total variants
      const { data: allVariants } = await supabase.from('variants').select('id');
      const totalVariants = allVariants?.length || 0;

      return res.status(200).json({
        totalRevenue, totalOrders, pendingOrders, totalProducts,
        lowStockProducts, bestSellers, recentOrders, salesByStatus, totalVariants
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Stats API error:', err);
    res.status(500).json({ error: err.message });
  }
}
