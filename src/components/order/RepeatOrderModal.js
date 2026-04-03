import React, { useEffect, useState, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";
import { getImageUrl } from "../../utils/image";

const RepeatOrderModal = ({ orderId, show, onHide, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [tempQuantities, setTempQuantities] = useState({});
    const debounceTimers = useRef({});

    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (!orderId || !show) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get(`/orders/${orderId}/repeat`);
                const dto = res.data;

                setData(dto);

                const quantities = {};
                dto.items.forEach((i, idx) => {
                    quantities[idx] = i.quantity;
                });

                setTempQuantities(quantities);

                setDeliveryAddress(dto.deliveryAddress || "");
                setDeliveryDate(dto.deliveryDate || "");
                setComment(dto.comment || "");
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [orderId, show]);

    const handleQuantityChange = (index, stock, value) => {
        setTempQuantities(prev => ({ ...prev, [index]: value }));

        const quantity = parseInt(value);
        if (isNaN(quantity) || quantity < 1) return;

        if (quantity > stock) {
            alert(`Доступно только ${stock} шт.`);
            setTempQuantities(prev => ({ ...prev, [index]: stock }));
        }
    };

    const handleRemove = (index) => {
        const updatedItems = data.items.filter((_, i) => i !== index);
        setData(prev => ({ ...prev, items: updatedItems }));
    };

    const getTotal = () => {
        if (!data?.items) return 0;
        return data.items.reduce((sum, item, idx) => {
            const qty = tempQuantities[idx] ?? item.quantity;
            return sum + item.unitPrice * qty;
        }, 0).toFixed(2);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const updatedItems = data.items.map((item, idx) => ({
                productId: item.productId,
                quantity: tempQuantities[idx] ?? item.quantity,
                unitPrice: item.unitPrice
            }));

            const orderDto = {
                ...data,
                deliveryAddress,
                deliveryDate,
                comment,
                items: updatedItems
            };

            const res = await axiosInstance.post("/orders", orderDto);

            alert(`Заказ #${res.data.id} создан`);
            onHide();
            onSuccess();
        } catch (e) {
            console.error(e);
            alert("Ошибка при создании заказа");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>Повтор заказа</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {loading || !data ? (
                    <div className="text-center">Загрузка...</div>
                ) : (
                    <>
                        <div className="mb-3">
                            {data.items.map((item, idx) => (
                                <div key={idx} className="cart-card mb-3 p-3 shadow-sm rounded">
                                    <div className="d-flex align-items-center mb-2">
                                        <img
                                            src={getImageUrl(item.productImagePath)}
                                            alt={item.productName}
                                            className="cart-item-image me-3"
                                        />
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1">{item.productName}</h6>
                                            <small className="text-muted">
                                                {item.unitPrice} ₽/шт
                                            </small>
                                        </div>

                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleRemove(idx)}
                                        >
                                            Удалить
                                        </button>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <input
                                            type="number"
                                            className="form-control w-25"
                                            min={1}
                                            value={tempQuantities[idx] ?? item.quantity}
                                            onChange={(e) =>
                                                handleQuantityChange(
                                                    idx,
                                                    item.productStockQuantity ?? 999,
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <strong>
                                            {(
                                                item.unitPrice *
                                                (tempQuantities[idx] ?? item.quantity)
                                            ).toFixed(2)} ₽
                                        </strong>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Адрес доставки</Form.Label>
                                <Form.Control
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Дата доставки</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    value={deliveryDate}
                                    onChange={(e) => setDeliveryDate(e.target.value)}
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

                        <div className="text-end mt-3">
                            <h5>Итого: {getTotal()} ₽</h5>
                        </div>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Отмена
                </Button>
                <Button variant="warning" onClick={handleSubmit}>
                    Оформить заказ
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RepeatOrderModal;