import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";

const UpdateOrderModal = ({ show, onHide, order, statuses, onSave }) => {
    const [statusId, setStatusId] = useState(order?.statusId || "");
    const [deliveryAddress, setDeliveryAddress] = useState(order?.deliveryAddress || "");
    const [deliveryDate, setDeliveryDate] = useState(order?.deliveryDate || "");
    const [comment, setComment] = useState(order?.comment || "");

    useEffect(() => {
        if (order) {
            setStatusId(order.statusId);
            setDeliveryAddress(order.deliveryAddress || "");
            setDeliveryDate(order.deliveryDate || "");
            setComment(order.comment || "");
        }
    }, [order]);

    const handleSave = async () => {
        try {
            if (!statusId) return alert("Выберите статус");

            const payload = {
                statusId,
                deliveryAddress,
                deliveryDate,
                comment,
            };

            await axiosInstance.put(`/orders/${order.id}`, payload);

            onSave();
            onHide();
        } catch (e) {
            console.error("Ошибка обновления заказа", e);
            alert(e.response?.data?.message || "Не удалось обновить заказ");
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Изменить заказ #{order?.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Статус</Form.Label>
                    <Form.Select
                        value={statusId}
                        onChange={(e) => setStatusId(e.target.value)}
                    >
                        <option value="">Выберите статус</option>
                        {statuses.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Адрес доставки</Form.Label>
                    <Form.Control
                        type="text"
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

                <Form.Group className="mb-3">
                    <Form.Label>Комментарий</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Отмена
                </Button>
                <Button variant="warning" onClick={handleSave}>
                    Сохранить
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UpdateOrderModal;
