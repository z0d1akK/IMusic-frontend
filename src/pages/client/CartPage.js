import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getImageUrl } from "../../utils/image";
import axios from '../../api/axiosInstance';

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [cartId, setCartId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [hasClientProfile, setHasClientProfile] = useState(null);
    const [tempQuantities, setTempQuantities] = useState({});
    const debounceTimers = useRef({});

    const userId = localStorage.getItem("userId");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");

    useEffect(() => {
        if (!userId || !roles.includes("CLIENT")) {
            navigate("/unauthorized");
            return;
        }

        axios.get('/clients/profile', { suppressGlobalErrorHandler: true })
            .then(res => {
                const clientId = res.data.id;
                setHasClientProfile(true);
                return axios.get(`/cart/${clientId}`);
            })
            .then(res => {
                const cart = res.data;
                setCartId(cart.id);
                return axios.get(`/cart/${cart.id}/items`);
            })
            .then(res => {
                setCartItems(res.data);
                calculateTotal(res.data);
                const initialQuantities = {};
                res.data.forEach(item => {
                    initialQuantities[item.id] = item.quantity;
                });
                setTempQuantities(initialQuantities);
            })
            .catch(err => {
                console.error(err);
                setError("Ошибка загрузки корзины");
            })
            .finally(() => setLoading(false));
    }, []);

    const calculateTotal = (items) => {
        const total = items.reduce((sum, item) => {
            const price = item.productPrice ?? 0;
            return sum + price * item.quantity;
        }, 0);
        setTotalPrice(total);
    };

    const handleQuantityInputChange = (itemId, productStockQty, value) => {
        setTempQuantities(prev => ({ ...prev, [itemId]: value }));
        const quantity = parseInt(value);
        if (isNaN(quantity) || quantity < 1) return;

        if (quantity > productStockQty) {
            alert(`На складе доступно только ${productStockQty} шт.`);
            setTempQuantities(prev => ({ ...prev, [itemId]: productStockQty }));
            return;
        }
        if (debounceTimers.current[itemId]) {
            clearTimeout(debounceTimers.current[itemId]);
        }
        debounceTimers.current[itemId] = setTimeout(() => {
            updateQuantityOnServer(itemId, quantity);
        }, 800);
    };

    const updateQuantityOnServer = (itemId, quantity) => {
        axios.put(`/cart/items/${itemId}`, null, { params: { quantity } })
            .then(res => {
                const updatedItems = cartItems.map(item => item.id === itemId ? res.data : item);
                setCartItems(updatedItems);
                calculateTotal(updatedItems);
                setTempQuantities(prev => ({ ...prev, [itemId]: res.data.quantity }));
            })
            .catch(() => alert("Ошибка при обновлении количества"));
    };

    const handleRemove = (itemId) => {
        axios.delete(`/cart/items/${itemId}`)
            .then(() => {
                const updatedItems = cartItems.filter(item => item.id !== itemId);
                setCartItems(updatedItems);
                calculateTotal(updatedItems);
                setTempQuantities(prev => {
                    const copy = { ...prev };
                    delete copy[itemId];
                    return copy;
                });
            })
            .catch(() => alert("Не удалось удалить товар"));
    };

    const handleClearCart = () => {
        axios.delete(`/cart/${cartId}/items`)
            .then(() => {
                setCartItems([]);
                setTotalPrice(0);
                setTempQuantities({});
            })
            .catch(() => alert("Ошибка при очистке корзины"));
    };

    const handleToCatalog = () => navigate("/catalog");
    const handleToProduct = (productId) => navigate(`/catalog/${productId}`);

    const handleCreateOrder = async () => {
        try {
            setLoading(true);
            setError(null);

            const profileRes = await axios.get('/clients/profile');
            const clientId = profileRes.data.id;

            const orderDto = {
                clientId,
                createdById: userId,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    quantity: tempQuantities[item.id] ?? item.quantity
                }))
            };

            const createRes = await axios.post('/orders', orderDto);

            alert(`Заказ #${createRes.data.id} успешно создан!`);
            await axios.delete(`/cart/${cartId}/items`);
            setCartItems([]);
            setTempQuantities({});
            setTotalPrice(0);

            navigate(`/client/orders/${createRes.data.id}`);
        } catch (err) {
            console.error(err);
            setError('Ошибка при создании заказа');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-5">Загрузка...</div>;
    if (error) return <div className="alert alert-danger mt-4">{error}</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Ваша корзина</h2>

            {cartItems.length === 0 ? (
                <>
                    {hasClientProfile === false ? (
                        <div className="alert alert-warning">
                            Ваш профиль клиента ещё не готов. Пожалуйста, обратитесь к менеджеру.
                        </div>
                    ) : (
                        <div className="alert alert-info">
                            Корзина пуста. <Link to="/catalog" className="alert-link">Добавьте товары из каталога</Link>.
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Товар</th>
                                <th>Количество</th>
                                <th>Цена</th>
                                <th>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {cartItems.map(item => (
                                <tr key={item.id}>
                                    <td style={{ maxWidth: '300px' }}>
                                        <div
                                            className="d-flex align-items-center"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleToProduct(item.productId)}
                                        >
                                            <img
                                                src={getImageUrl(item.productImagePath)}
                                                alt={item.productName || 'Товар'}
                                                style={{
                                                    width: 60,
                                                    height: 60,
                                                    objectFit: 'cover',
                                                    marginRight: 12,
                                                    borderRadius: 4
                                                }}
                                            />
                                            <span>{item.productName || 'Без названия'}</span>
                                        </div>
                                    </td>
                                    <td style={{ maxWidth: "150px" }}>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={tempQuantities[item.id] ?? item.quantity}
                                            onChange={(e) =>
                                                handleQuantityInputChange(
                                                    item.id,
                                                    item.productStockQuantity ?? 0,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </td>
                                    <td>{((item.productPrice ?? 0) * (tempQuantities[item.id] ?? item.quantity)).toFixed(2)} ₽</td>
                                    <td>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleRemove(item.id)}>
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <div>
                            <button className="btn btn-secondary me-2" onClick={handleToCatalog}>
                                Вернуться в каталог
                            </button>
                            <button className="btn btn-outline-danger" onClick={handleClearCart}>
                                Очистить корзину
                            </button>
                        </div>
                        <div className="text-end">
                            <h5>Сумма: {totalPrice.toFixed(2)} ₽</h5>
                            <button
                                className="btn btn-warning"
                                onClick={handleCreateOrder}
                                disabled={cartItems.length === 0 || loading}
                            >
                                Оформить заказ
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;
