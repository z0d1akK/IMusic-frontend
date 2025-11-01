import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const CategoryAttributeModal = ({ show, onClose, onSave, item, mode, categoryId }) => {
    const [formData, setFormData] = useState({
        name: "",
        value: "",
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name ?? "",
                value: item.value ?? item.defaultValue ?? "",
            });
        } else {
            setFormData({ name: "", value: "" });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.value) return;

        const data = {
            id: item?.id ?? null,
            categoryId: Number(categoryId),
            name: formData.name.trim(),
            value: formData.value.trim(),
            defaultValue: formData.value.trim(),
        };


        onSave(data);
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{mode === "edit" ? "Редактировать" : "Добавить"} атрибут</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Название атрибута</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Введите название атрибута"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Значение (по умолчанию)</Form.Label>
                        <Form.Control
                            type="text"
                            name="value"
                            value={formData.value}
                            onChange={handleChange}
                            placeholder="Введите значение"
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Отмена
                </Button>
                <Button variant="warning" onClick={handleSubmit}>
                    Сохранить
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CategoryAttributeModal;
