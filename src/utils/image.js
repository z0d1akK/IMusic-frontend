export const getImageUrl = path => {
    if (!path) return '/uploads/products/default.webp';
    return path.startsWith('http') || path.startsWith('/uploads/')
        ? path
        : `/uploads/${path.replace(/^\/+/, '')}`;
};