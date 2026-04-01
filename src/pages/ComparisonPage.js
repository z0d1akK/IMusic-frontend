import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import {
    getComparisonId,
    removeProductFromLocalComparison,
    clearComparison
} from "../utils/comparison";

export default function ComparisonPage() {

    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);

        const id = getComparisonId();

        if (!id) {
            setData(null);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`/products/comparisons/${id}`);

            if (!response.data.products || response.data.products.length === 0) {
                clearComparison();
                setData(null);
            } else {
                setData(response.data);
            }
        } catch (err) {
            if (err.response?.status === 400 || err.response?.status === 404) {
                console.log('Сравнение не найдено или пустое, очищаем localStorage');
                clearComparison();
                setData(null);
            } else {
                console.error('Ошибка загрузки сравнения:', err);
                setData(null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleRemove = async (productId) => {
        const id = getComparisonId();

        if (!id) {
            removeProductFromLocalComparison(productId);
            load();
            return;
        }

        try {
            await axios.delete(`/products/comparisons/${id}/products/${productId}`);

            const remainingCount = removeProductFromLocalComparison(productId);

            if (remainingCount === 0) {
                clearComparison();
                setData(null);
            } else {
                await load();
            }
        } catch (err) {
            console.error('Ошибка при удалении товара:', err);

            if (err.response?.status === 400 || err.response?.status === 404) {
                clearComparison();
                setData(null);
            } else {
                alert("Ошибка при удалении товара из сравнения");
            }
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/catalog/${productId}`);
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
                <p className="mt-2">Загрузка сравнения...</p>
            </div>
        );
    }

    if (!data || !data.products || data.products.length === 0) {
        return (
            <div className="container mt-5 text-center">
                <div className="card shadow-sm p-5">
                    <i className="bi bi-bar-chart display-1 text-muted mb-3"></i>
                    <h3>Нет товаров для сравнения</h3>
                    <p className="text-muted">Добавьте товары в сравнение из каталога</p>
                    <button
                        className="btn btn-warning mt-3 mx-auto"
                        style={{width: '200px'}}
                        onClick={() => navigate('/catalog')}
                    >
                        Перейти в каталог
                    </button>
                </div>
            </div>
        );
    }

    const productsByCategory = {};
    data.products.forEach(product => {
        if (!productsByCategory[product.categoryName]) {
            productsByCategory[product.categoryName] = [];
        }
        productsByCategory[product.categoryName].push(product);
    });

    const sortedCategories = Object.keys(productsByCategory).sort();

    const orderedProducts = [];
    sortedCategories.forEach(category => {
        orderedProducts.push(...productsByCategory[category]);
    });

    const getAttributesByCategory = () => {
        const attributesByCategory = {};

        sortedCategories.forEach(categoryName => {
            const categoryProducts = productsByCategory[categoryName];
            const productIds = categoryProducts.map(p => p.id);

            const categoryAttributes = data.attributes.filter(attr => {
                return productIds.some(productId => {
                    const value = attr.values[productId];
                    return value !== undefined &&
                        value !== null &&
                        value !== "-";
                });
            });

            attributesByCategory[categoryName] = [...categoryAttributes].sort((a, b) =>
                a.attributeName.localeCompare(b.attributeName)
            );
        });

        return attributesByCategory;
    };

    const attributesByCategory = getAttributesByCategory();

    return (
        <div className="container mt-5">
            <h2>Сравнение товаров</h2>
            <p className="text-muted mb-4">Сравните характеристики товаров и выберите лучший</p>

            <div className="table-responsive">
                <table className="table table-bordered mt-4 align-middle">
                    <thead className="table-dark">
                    <tr>
                        <th style={{minWidth: 220}}>Характеристика</th>
                        {orderedProducts.map(p => (
                            <th key={p.id} style={{minWidth: 200}}>
                                <div
                                    className="fw-bold product-link"
                                    style={{
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                    onClick={() => handleProductClick(p.id)}
                                >
                                    {p.name}
                                </div>
                                <small className="text-light d-block">
                                    {p.categoryName}
                                </small>
                                <button
                                    className="btn btn-sm btn-danger mt-2"
                                    onClick={() => handleRemove(p.id)}
                                >
                                    <i className="bi bi-trash me-1"></i>
                                    Удалить
                                </button>
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody>
                    <tr>
                        <td><b>Цена</b></td>
                        {orderedProducts.map(p => (
                            <td key={p.id} className="fw-bold text-success">
                                {p.price?.toFixed(2)} р.
                            </td>
                        ))}
                    </tr>

                    {sortedCategories.map((categoryName, categoryIndex) => {
                        const categoryAttributes = attributesByCategory[categoryName];

                        if (!categoryAttributes || categoryAttributes.length === 0) {
                            return null;
                        }

                        return (
                            <React.Fragment key={categoryName}>
                                {categoryIndex > 0 && (
                                    <tr className="table-secondary">
                                        <td colSpan={orderedProducts.length + 1} className="text-start fw-bold">
                                            {categoryName}
                                        </td>
                                    </tr>
                                )}

                                {categoryAttributes.map(attr => (
                                    <tr key={`${categoryName}-${attr.attributeName}`}>
                                        <td className="text-start fw-medium">
                                            {attr.attributeName}
                                        </td>
                                        {orderedProducts.map(product => {
                                            if (product.categoryName === categoryName) {
                                                const value = attr.values[product.id];
                                                return (
                                                    <td key={product.id}>
                                                        {value !== undefined && value !== null && value !== "-" ? value : "—"}
                                                    </td>
                                                );
                                            } else {
                                                return <td key={product.id} className="text-muted">—</td>;
                                            }
                                        })}
                                    </tr>
                                ))}
                            </React.Fragment>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            <div className="text-center mt-4">
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/catalog')}
                >
                    Вернуться в каталог
                </button>
            </div>
        </div>
    );
}