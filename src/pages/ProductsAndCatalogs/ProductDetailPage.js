import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {getImageUrl} from "../../utils/image";
import axios from '../../api/axiosInstance';

export default function ProductDetailPage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inCart, setInCart] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const isAuthenticated = !!token && !!userId;
    const roles = JSON.parse(localStorage.getItem("roles")) || [];

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
            axios.get(`/cart/${userId}`)
                .then(cartRes => {
                    const cartId = cartRes.data.id;
                    return axios.get(`/cart/${cartId}/items`);
                })
                .then(itemsRes => {
                    const exists = itemsRes.data.some(item => item.productId === parseInt(id));
                    setInCart(exists);
                })
                .catch(() => {
                });
        }
    }, [id]);


    const handleAddToCart = () => {
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


    const handleBack = () => navigate('/catalog');

    if (loading || !product) return <div className="container mt-5 text-center">Загрузка...</div>;

    return (
        <div className="container mt-5">
            <div className="card shadow-lg p-4">
                <div className="row g-4 align-items-center">
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

                        <div className="mt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                            {!isAuthenticated ? (
                                <div className="alert alert-warning mb-0">
                                    <strong>Войдите</strong>, чтобы добавить товар в корзину
                                </div>
                            ) : inCart ? (
                                <button className="btn btn-secondary" disabled>
                                    Уже в корзине
                                </button>
                            ) : (
                                <button className="btn btn-success" onClick={handleAddToCart}>
                                    <i className="bi bi-cart-plus me-2"></i>Добавить в корзину
                                </button>
                            )}
                        </div>

                        {attributes.length > 0 && (
                            <div className="mt-4">
                                <h5 className="mb-2">Характеристики</h5>
                                <ul className="list-group">
                                    {attributes.map(attr => (
                                        <li key={attr.id} className="list-group-item d-flex justify-content-between">
                                            <span className="fw-medium">{attr.name}</span>
                                            <span>{attr.value || '-'}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="text-end mt-4">
                        <button className="btn btn-warning" onClick={handleBack}>
                            Вернуться в каталог
                        </button>
                    </div>
                </div>
            </div>

            {showToast && (
                <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{zIndex: 1055}}>
                    <div className="toast show align-items-center text-bg-success border-0">
                        <div className="d-flex">
                            <div className="toast-body">Товар добавлен в корзину!</div>
                            <button
                                type="button"
                                className="btn-close btn-close-white me-2 m-auto"
                                onClick={() => setShowToast(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
