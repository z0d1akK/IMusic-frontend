import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {getImageUrl} from "../../utils/image";
import axios from '../../api/axiosInstance';
import {
    getComparisonId,
    setComparisonId,
    addProductToLocalComparison,
    removeProductFromLocalComparison,
    isInComparison,
    syncComparisonWithServer
} from "../../utils/comparison";
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist
} from "../../utils/wishlist";
import PriceHistoryModal from "../../components/PriceHistoryModal";

export default function ProductDetailPage() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inCart, setInCart] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isInCompare, setIsInCompare] = useState(false);
    const [loadingCompare, setLoadingCompare] = useState(false);

    const [showPriceHistory, setShowPriceHistory] = useState(false);
    const [priceHistory, setPriceHistory] = useState([]);
    const [period, setPeriod] = useState(2);
    const [loadingChart, setLoadingChart] = useState(false);

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const isAuthenticated = !!token && !!userId;

    useEffect(() => {
        if (!id || isNaN(parseInt(id))) {
            navigate('/catalog');
            return;
        }

        axios.get(`/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(() => navigate('/catalog'))
            .finally(() => setLoading(false));

        axios.get(`/products/${id}/attributes-with-values`)
            .then(res => setAttributes(res.data))
            .catch(() => setAttributes([]));

        if (isAuthenticated) {
            getWishlist().then(res => {
                const exists = res.data.some(p => p.id === parseInt(id));
                setIsFavorite(exists);
            }).catch(() => setIsFavorite(false));

            setIsInCompare(isInComparison(parseInt(id)));

            axios.get(`/clients/profile`)
                .then(clientRes => {
                    const clientId = clientRes.data.id;
                    return axios.get(`/cart/${clientId}`);
                })
                .then(cartRes => {
                    const cartId = cartRes.data.id;
                    return axios.get(`/cart/${cartId}/items`);
                })
                .then(itemsRes => {
                    const exists = itemsRes.data.some(item => item.productId === parseInt(id));
                    setInCart(exists);
                })
                .catch(() => {
                    setInCart(false);
                });
        }

    }, [id, isAuthenticated]);

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            alert("Для добавления товаров в корзину необходимо войти в аккаунт");
            navigate('/login');
            return;
        }

        axios.get('/clients/profile')
            .then(clientRes => {
                const clientId = clientRes.data.id;
                return axios.get(`/cart/${clientId}`);
            })
            .then(cartRes => {
                const cartId = cartRes.data.id;
                return axios.post(`/cart/${cartId}/items`, null, {
                    params: {productId: parseInt(id), quantity: 1}
                });
            })
            .then(() => {
                setInCart(true);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            })
            .catch(() => alert("Ошибка при добавлении в корзину"));
    };

    const toggleWishlist = () => {
        if (!isAuthenticated) {
            alert("Для добавления товаров в избранное необходимо войти в аккаунт");
            navigate('/login');
            return;
        }

        const action = isFavorite
            ? removeFromWishlist(id)
            : addToWishlist(id);

        action.then(() => setIsFavorite(!isFavorite));
    };

    const toggleCompare = async () => {
        if (!isAuthenticated) {
            alert("Для добавления товаров в сравнение необходимо войти в аккаунт");
            navigate('/login');
            return;
        }

        setLoadingCompare(true);

        try {
            if (isInCompare) {
                let comparisonId = getComparisonId();

                if (comparisonId) {
                    try {
                        await axios.delete(`/products/comparisons/${comparisonId}/products/${parseInt(id)}`);
                    } catch (e) {
                        console.error('Ошибка при удалении из сравнения:', e);
                    }
                }

                const remainingCount = removeProductFromLocalComparison(parseInt(id));
                setIsInCompare(false);

                if (remainingCount === 0) {
                    setComparisonId(null);
                }
            } else {
                let comparisonId = getComparisonId();

                if (!comparisonId) {
                    const res = await axios.post('/products/comparisons', [parseInt(id)]);
                    comparisonId = res.data;
                    setComparisonId(comparisonId);
                } else {
                    await axios.post(`/products/comparisons/${comparisonId}/products/${parseInt(id)}`);
                }

                addProductToLocalComparison(parseInt(id));
                setIsInCompare(true);
                await syncComparisonWithServer();
            }
        } catch (e) {
            console.error('Ошибка при изменении сравнения:', e);
            alert("Ошибка при изменении сравнения");
        } finally {
            setLoadingCompare(false);
        }
    };

    const fetchPriceHistory = (months) => {
        setLoadingChart(true);

        axios.get(`/products/${id}/price-history`, {
            params: {months}
        })
            .then(res => setPriceHistory(res.data))
            .catch(() => setPriceHistory([]))
            .finally(() => setLoadingChart(false));
    };

    const handleOpenPriceHistory = () => {
        setShowPriceHistory(true);

        if (priceHistory.length === 0) {
            fetchPriceHistory(period);
        }
    };

    const handlePeriodChange = (months) => {
        setPeriod(months);
        fetchPriceHistory(months);
    };

    if (loading || !product) return <div className="container mt-5 text-center">Загрузка...</div>;

    return (
        <div className="container mt-5">
            <div className="card shadow-lg p-4">
                <div className="row g-4 align-items-start">
                    <div className="col-md-5 text-center">
                        <img
                            src={getImageUrl(product.imagePath)}
                            alt={product.name}
                            className="img-fluid rounded"
                            style={{maxHeight: 300, objectFit: 'contain'}}
                        />
                    </div>
                    <div className="col-md-7">
                        <h2 className="fw-bold mb-2">{product.name}</h2>
                        <p className="text-muted mb-3">{product.description || 'Описание отсутствует'}</p>
                        <h4 className="text-success fw-bold">{product.price?.toFixed(2)} р.</h4>

                        <div className="mt-4">
                            <div className="mb-2">
                                {!isAuthenticated ? (
                                    <div className="alert alert-warning mb-0 py-2">
                                        <small>Войдите, чтобы добавить товар в корзину</small>
                                    </div>
                                ) : inCart ? (
                                    <button className="btn btn-secondary w-100" disabled>
                                        Уже в корзине
                                    </button>
                                ) : (
                                    <button className="btn btn-success w-100 py-2 fw-bold" onClick={handleAddToCart}>
                                        Добавить в корзину
                                    </button>
                                )}
                            </div>

                            <div className="d-flex gap-2">
                                {isAuthenticated && (
                                    <button
                                        className="btn btn-outline-secondary flex-fill py-1"
                                        onClick={handleOpenPriceHistory}
                                    >
                                        График цены
                                    </button>
                                )}

                                {isAuthenticated && (
                                    <button
                                        className={`btn flex-fill py-1 ${
                                            isFavorite ? 'btn-danger' : 'btn-outline-danger'
                                        }`}
                                        onClick={toggleWishlist}
                                    >
                                        {isFavorite ? 'В избранных' : 'В избранные'}
                                    </button>
                                )}

                                {isAuthenticated && (
                                    <button
                                        className={`btn flex-fill py-1 ${
                                            isInCompare ? 'btn-warning' : 'btn-outline-warning'
                                        }`}
                                        onClick={toggleCompare}
                                        disabled={loadingCompare}
                                    >
                                        {loadingCompare ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                        ) : (
                                            isInCompare ? 'В сравнении' : 'В сравнение'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {attributes.length > 0 && (
                            <div className="mt-4">
                                <h5 className="mb-2">Характеристики</h5>
                                <ul className="list-group list-group-flush">
                                    {attributes.map(attr => (
                                        <li key={attr.id} className="list-group-item d-flex justify-content-between px-0">
                                            <span className="fw-medium">{attr.name}</span>
                                            <span className="text-muted">{attr.value || '-'}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="text-center text-md-end mt-4 pt-3 border-top">
                        <button className="btn btn-warning px-4" onClick={() => navigate('/catalog')}>
                            Вернуться в каталог
                        </button>
                    </div>
                </div>
            </div>

            <PriceHistoryModal
                show={showPriceHistory}
                onClose={() => setShowPriceHistory(false)}
                data={priceHistory}
                period={period}
                onPeriodChange={handlePeriodChange}
                loading={loadingChart}
            />

            {showToast && (
                <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{zIndex: 1055}}>
                    <div className="toast show align-items-center text-bg-success border-0">
                        <div className="d-flex">
                            <div className="toast-body">Товар добавлен в корзину!</div>
                            <button type="button" className="btn-close btn-close-white me-2 m-auto"
                                    onClick={() => setShowToast(false)}/>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}