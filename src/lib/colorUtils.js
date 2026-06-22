// Fallback hex colors for old format
export const COLOR_HEX = {
  'Noir': '#1a1a1a',
  'Blanc': '#f5f5f0',
  'Beige': '#d4b896',
  'Rose': '#e8a0b4',
  'Rouge': '#c0392b',
  'Marron': '#6b3a2a',
  'Or': '#d4a843',
  'Argent': '#b8b8b8'
};

// Normalize colors to always be objects with name, hex, images
export function normalizeColors(product) {
  if (!product?.colors || product.colors.length === 0) return [];
  if (typeof product.colors[0] === 'object' && product.colors[0] !== null) {
    return product.colors.map(c => ({
      name: c.name || '',
      hex: c.hex || COLOR_HEX[c.name] || '#888888',
      images: Array.isArray(c.images) ? c.images : []
    }));
  }
  return product.colors.map(name => ({
    name,
    hex: COLOR_HEX[name] || '#888888',
    images: []
  }));
}

// Get images for selected color
export function getColorImages(product, colorName) {
  const colors = normalizeColors(product);
  const colorObj = colors.find(c => c.name === colorName);
  if (colorObj && colorObj.images && colorObj.images.length > 0) {
    return colorObj.images;
  }
  return product.images || [];
}

// Get all color names from a product (for filtering)
export function getColorNames(product) {
  return normalizeColors(product).map(c => c.name);
}
