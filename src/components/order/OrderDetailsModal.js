import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Spinner } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";

const OrderDetailsModal = ({ orderId, onClose }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/orders/${orderId}`);
                setOrder(response.data);
            } catch (error) {
                console.error("Ошибка загрузки деталей заказа:", error);
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    return (
        <Modal show={true} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Детали заказа №{orderId}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {loading ? (
                    <div className="text-center my-4">
                        <Spinner animation="border" />
                    </div>
                ) : !order ? (
                    <div className="text-center text-danger">Ошибка при загрузке заказа</div>
                ) : (
                    <>
                        <div className="mb-3">
                            <p><b>Дата оформления:</b> {new Date(order.createdAt).toLocaleString()}</p>
                            <p><b>Статус:</b> {order.statusName || "—"}</p>
                            <p><b>Адрес доставки:</b> {order.deliveryAddress || "Не указан"}</p>
                            {order.deliveryDate && (
                                <p><b>Дата доставки:</b> {new Date(order.deliveryDate).toLocaleDateString()}</p>
                            )}
                            {order.comment && (
                                <p><b>Комментарий:</b> {order.comment}</p>
                            )}
                            <p><b>Итоговая сумма:</b> {order.totalPrice?.toFixed(2)} ₽</p>
                        </div>

                        <h5>Состав заказа</h5>
                        <Table bordered hover responsive size="sm">
                            <thead>
                            <tr>
                                <th>Товар</th>
                                <th>Кол-во</th>
                                <th>Цена</th>
                                <th>Сумма</th>
                            </tr>
                            </thead>
                            <tbody>
                            {order.items?.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.productName || "—"}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.unitPrice?.toFixed(2)} ₽</td>
                                    <td>{(item.unitPrice * item.quantity).toFixed(2)} ₽</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Закрыть
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default OrderDetailsModal;
