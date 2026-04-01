import axios from '../api/axiosInstance';

const COMPARISON_ID_KEY = "comparisonId";
const COMPARISON_PRODUCTS_KEY = "comparisonProducts";

export const getComparisonId = () => {
    return localStorage.getItem(COMPARISON_ID_KEY);
};

export const setComparisonId = (id) => {
    if (id) {
        localStorage.setItem(COMPARISON_ID_KEY, id);
    } else {
        localStorage.removeItem(COMPARISON_ID_KEY);
    }
};

export const getComparisonProducts = () => {
    const data = localStorage.getItem(COMPARISON_PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
};

export const addProductToLocalComparison = (productId) => {
    const products = getComparisonProducts();
    if (!products.includes(productId)) {
        products.push(productId);
        localStorage.setItem(COMPARISON_PRODUCTS_KEY, JSON.stringify(products));
    }
};

export const removeProductFromLocalComparison = (productId) => {
    const products = getComparisonProducts().filter(id => id !== productId);

    if (products.length === 0) {
        localStorage.removeItem(COMPARISON_PRODUCTS_KEY);
        localStorage.removeItem(COMPARISON_ID_KEY);
    } else {
        localStorage.setItem(COMPARISON_PRODUCTS_KEY, JSON.stringify(products));
    }

    return products.length;
};

export const clearComparison = () => {
    localStorage.removeItem(COMPARISON_ID_KEY);
    localStorage.removeItem(COMPARISON_PRODUCTS_KEY);
};

export const isInComparison = (productId) => {
    return getComparisonProducts().includes(productId);
};

export const loadUserComparisons = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        clearComparison();
        return;
    }

    try {
        const response = await axios.get('/products/comparisons/user');
        const comparisons = response.data;

        if (comparisons && comparisons.length > 0) {
            const activeComparison = comparisons[0];
            setComparisonId(activeComparison.id);

            const comparisonData = await axios.get(`/products/comparisons/${activeComparison.id}`);
            const productIds = comparisonData.data.products.map(p => p.id);

            if (productIds.length === 0) {
                clearComparison();
            } else {
                localStorage.setItem(COMPARISON_PRODUCTS_KEY, JSON.stringify(productIds));
            }
        } else {
            clearComparison();
        }
    } catch (error) {
        console.error('Ошибка загрузки сравнений пользователя:', error);
    }
};

export const syncComparisonWithServer = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const localProducts = getComparisonProducts();

    if (localProducts.length === 0) {
        const comparisonId = getComparisonId();
        if (comparisonId) {
            try {
                await axios.delete(`/products/comparisons/${comparisonId}`);
                clearComparison();
            } catch (e) {
                console.error('Ошибка удаления сравнения:', e);
                if (e.response?.status === 404) {
                    clearComparison();
                }
            }
        }
        return null;
    }

    let comparisonId = getComparisonId();

    try {
        if (!comparisonId) {
            const res = await axios.post('/products/comparisons', localProducts);
            comparisonId = res.data;
            setComparisonId(comparisonId);
        } else {
            let comparisonExists = true;
            try {
                await axios.get(`/products/comparisons/${comparisonId}`);
            } catch (e) {
                comparisonExists = false;
                if (e.response?.status === 404) {
                    const res = await axios.post('/products/comparisons', localProducts);
                    comparisonId = res.data;
                    setComparisonId(comparisonId);
                    return comparisonId;
                } else {
                    throw e;
                }
            }

            if (comparisonExists) {
                const comparisonData = await axios.get(`/products/comparisons/${comparisonId}`);
                const serverProductIds = comparisonData.data.products.map(p => p.id);

                for (const productId of localProducts) {
                    if (!serverProductIds.includes(productId)) {
                        await axios.post(`/products/comparisons/${comparisonId}/products/${productId}`);
                    }
                }

                for (const productId of serverProductIds) {
                    if (!localProducts.includes(productId)) {
                        await axios.delete(`/products/comparisons/${comparisonId}/products/${productId}`);
                    }
                }
            }
        }

        return comparisonId;
    } catch (error) {
        console.error('Ошибка синхронизации сравнения:', error);
        return null;
    }
};