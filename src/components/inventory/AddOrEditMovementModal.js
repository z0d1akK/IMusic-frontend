import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";

const AddOrEditMovementModal = ({
                                    show,
                                    onHide,
                                    product,
                                    movementTypes,
                                    editData,
                                    onSuccess,
                                }) => {
    const isEdit = !!editData;

    const [movementTypeId, setMovementTypeId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [comment, setComment] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isEdit) {
            setMovementTypeId(editData.movementType?.id || "");
            setQuantity(editData.quantity);
            setComment(editData.comment || "");
        } else {
            setMovementTypeId("");
            setQuantity("");
            setComment("");
        }
        setError("");
    }, [editData, show]);

    const handleSubmit = async () => {
        if (!movementTypeId || !quantity) {
            setError("Пожалуйста, заполните все обязательные поля.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                productId: product.id,
                movementTypeId,
                quantity: Number(quantity),
                comment,
            };

            if (isEdit) {
                await axiosInstance.put(`/inventory-movements/${editData.id}`, payload);
            } else {
                await axiosInstance.post("/inventory-movements", payload);
            }

            onSuccess?.();
            onHide();
        } catch (e) {
            console.error("Ошибка при сохранении движения", e);
            setError("Не удалось сохранить. Проверьте данные.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEdit ? "Редактировать движение" : "Добавить движение"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    <strong>Товар:</strong> {product.name}
                </p>

                <Form.Group className="mb-3">
                    <Form.Label>Тип движения *</Form.Label>
                    <Form.Select
                        value={movementTypeId}
                        onChange={(e) => setMovementTypeId(e.target.value)}
                    >
                        <option value="">-- Выберите --</option>
                        {movementTypes.map((mt) => (
                            <option key={mt.id} value={mt.id}>
                                {mt.name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Количество *</Form.Label>
                    <Form.Control
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Примечание</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </Form.Group>

                {error && <div className="text-danger">{error}</div>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={saving}>
                    Отмена
                </Button>
                <Button variant="warning" onClick={handleSubmit} disabled={saving}>
                    {saving ? "Сохранение..." : "Сохранить"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddOrEditMovementModal;
