import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const EditOrderModal = ({ show, onHide, order, clients = [], statuses = [], onSave }) => {
    const [clientId, setClientId] = useState("");
    const [statusId, setStatusId] = useState("");

    useEffect(() => {
        if (order) {
            setClientId(order.clientId || "");
            setStatusId(order.statusId || "");
        }
    }, [order]);

    const handleSave = () => {
        if (!clientId || !statusId) return alert("Выберите клиента и статус");
        onSave({ ...order, clientId: Number(clientId), statusId: Number(statusId) });
        onHide();
    };

    if (!order) return null;

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Редактирование заказа #{order.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Клиент</Form.Label>
                    <Form.Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                        <option value="">— выберите клиента —</option>
                        {clients.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.companyName} ({c.contactPerson})
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Статус</Form.Label>
                    <Form.Select value={statusId} onChange={(e) => setStatusId(e.target.value)}>
                        <option value="">— выберите статус —</option>
                        {statuses.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Отмена</Button>
                <Button variant="primary" onClick={handleSave} disabled={!clientId || !statusId}>
                    Сохранить
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditOrderModal;
