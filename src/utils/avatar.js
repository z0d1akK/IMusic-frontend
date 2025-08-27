export const getAvatarUrl = (path) => {
    if (!path) return '/uploads/avatars/default.webp';
    return path.startsWith('http') ? path : `/uploads/${path.replace(/^\/+/, '')}`;
};
