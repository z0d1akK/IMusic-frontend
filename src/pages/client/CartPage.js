import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getImageUrl } from "../../utils/image";
import axios from "../../api/axiosInstance";
import { Modal, Button, Form } from "react-bootstrap";
import "../../styles/custom.css"

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [cartId, setCartId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [tempQuantities, setTempQuantities] = useState({});
    const debounceTimers = useRef({});

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [comment, setComment] = useState("");

    const userId = localStorage.getItem("userId");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");

    useEffect(() => {
        if (!userId || !roles.includes("CLIENT")) {
            navigate("/unauthorized");
            return;
        }

        axios.get("/clients/profile", { suppressGlobalErrorHandler: true })
            .then(res => {
                const clientId = res.data.id;
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
            .catch(() => setError("Ошибка загрузки корзины"))
            .finally(() => setLoading(false));
    }, []);

    const calculateTotal = (items) => {
        const total = items.reduce((sum, item) => sum + (item.productPrice ?? 0) * item.quantity, 0);
        setTotalPrice(total);
    };

    const handleQuantityInputChange = (itemId, stock, value) => {
        setTempQuantities(prev => ({ ...prev, [itemId]: value }));
        const quantity = parseInt(value);
        if (isNaN(quantity) || quantity < 1) return;
        if (quantity > stock) {
            alert(`На складе доступно только ${stock} шт.`);
            setTempQuantities(prev => ({ ...prev, [itemId]: stock }));
            return;
        }

        if (debounceTimers.current[itemId]) clearTimeout(debounceTimers.current[itemId]);
        debounceTimers.current[itemId] = setTimeout(() => {
            axios.put(`/cart/items/${itemId}`, null, { params: { quantity } })
                .then(res => {
                    const updatedItems = cartItems.map(item => item.id === itemId ? res.data : item);
                    setCartItems(updatedItems);
                    calculateTotal(updatedItems);
                })
                .catch(() => alert("Ошибка при обновлении количества"));
        }, 800);
    };

    const handleRemove = (itemId) => {
        axios.delete(`/cart/items/${itemId}`)
            .then(() => {
                const updated = cartItems.filter(i => i.id !== itemId);
                setCartItems(updated);
                calculateTotal(updated);
            })
            .catch(() => alert("Не удалось удалить товар"));
    };

    const handleClearCart = () => {
        axios.delete(`/cart/${cartId}/items`)
            .then(() => {
                setCartItems([]);
                setTotalPrice(0);
            })
            .catch(() => alert("Ошибка при очистке корзины"));
    };

    const handleCreateOrder = () => {
        if (cartItems.length === 0) {
            alert("Корзина пуста");
            return;
        }
        setShowConfirmModal(true);
    };

    const handleConfirmOrder = async () => {
        try {
            setLoading(true);
            const profileRes = await axios.get("/clients/profile");
            const clientId = profileRes.data.id;

            const orderDto = {
                clientId,
                createdBy: parseInt(userId),
                statusId: 1,
                deliveryAddress,
                deliveryDate,
                comment,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    orderId: null,
                    quantity: tempQuantities[item.id] ?? item.quantity,
                    unitPrice: item.productPrice
                }))
            };

            const res = await axios.post("/orders", orderDto);
            alert(`Заказ #${res.data.id} успешно создан!`);
            await axios.delete(`/cart/${cartId}/items`);
            setCartItems([]);
            setTotalPrice(0);
            setShowConfirmModal(false);
            navigate("/client/orders");
        } catch (err) {
            console.error(err);
            setError("Ошибка при создании заказа");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-5">Загрузка...</div>;
    if (error) return <div className="alert alert-danger mt-4">{error}</div>;

    return (
        <div className="container mt-4 cart-container">
            <h2 className="mb-4 text-center text-md-start">Ваша корзина</h2>

            {cartItems.length === 0 ? (
                <div className="alert alert-info text-center">
                    Корзина пуста. <Link to="/catalog" className="alert-link">Добавьте товары из каталога</Link>.
                </div>
            ) : (
                <>
                    <div className="d-none d-md-block table-responsive">
                        <table className="table align-middle">
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
                                    <td>
                                        <div className="d-flex align-items-center"
                                             onClick={() => navigate(`/catalog/${item.productId}`)}
                                             style={{ cursor: "pointer" }}>
                                            <img
                                                src={getImageUrl(item.productImagePath)}
                                                alt={item.productName}
                                                className="cart-item-image"
                                            />
                                            <span>{item.productName}</span>
                                        </div>
                                    </td>
                                    <td style={{ maxWidth: "150px" }}>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={tempQuantities[item.id] ?? item.quantity}
                                            min={1}
                                            onChange={(e) =>
                                                handleQuantityInputChange(item.id, item.productStockQuantity ?? 0, e.target.value)
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

                    <div className="d-md-none">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-card mb-3 p-3 shadow-sm rounded">
                                <div className="d-flex align-items-center mb-2">
                                    <img
                                        src={getImageUrl(item.productImagePath)}
                                        alt={item.productName}
                                        className="cart-item-image me-3"
                                    />
                                    <div className="flex-grow-1">
                                        <h6 className="mb-1">{item.productName}</h6>
                                        <small className="text-muted">{item.productPrice} ₽/шт</small>
                                    </div>
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleRemove(item.id)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <input
                                        type="number"
                                        className="form-control w-25"
                                        min={1}
                                        value={tempQuantities[item.id] ?? item.quantity}
                                        onChange={(e) =>
                                            handleQuantityInputChange(item.id, item.productStockQuantity ?? 0, e.target.value)
                                        }
                                    />
                                    <strong>{((item.productPrice ?? 0) * (tempQuantities[item.id] ?? item.quantity)).toFixed(2)} ₽</strong>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-footer mt-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                        <div className="text-center text-md-start">
                            <button className="btn btn-secondary me-2 mb-2" onClick={() => navigate("/catalog")}>
                                Вернуться в каталог
                            </button>
                            <button className="btn btn-outline-danger" onClick={handleClearCart}>
                                Очистить корзину
                            </button>
                        </div>
                        <div className="text-center text-md-end">
                            <h5 className="mb-2">Сумма: {totalPrice.toFixed(2)} ₽</h5>
                            <button
                                className="btn btn-warning mb-2"
                                onClick={handleCreateOrder}
                                disabled={cartItems.length === 0 || loading}
                            >
                                Оформить заказ
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Модалка */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Подтверждение заказа</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Адрес доставки</Form.Label>
                            <Form.Control
                                type="text"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Дата доставки</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Комментарий</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Отмена
                    </Button>
                    <Button variant="warning" onClick={handleConfirmOrder}>
                        Подтвердить заказ
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CartPage;
