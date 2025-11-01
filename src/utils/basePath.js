export const getBasePath = (roles) => {
    if (roles.includes('ADMIN')) return '/admin';
    if (roles.includes('MANAGER')) return '/manager';
    return '';
};