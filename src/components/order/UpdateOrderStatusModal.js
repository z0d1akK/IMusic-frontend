import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";

const UpdateOrderStatusModal = ({ show, onHide, order, statuses, onSave }) => {
    const [statusId, setStatusId] = useState(order?.statusId || "");

    useEffect(() => {
        if (order) setStatusId(order.statusId);
    }, [order]);

    const handleSave = async () => {
        try {
            if (!statusId) return alert("Выберите статус");
            await axiosInstance.put(`/orders/${order.id}/status`, { statusId });
            onSave();
            onHide();
        } catch (e) {
            console.error("Ошибка изменения статуса", e);
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Изменить статус заказа #{order?.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
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

export default UpdateOrderStatusModal;
