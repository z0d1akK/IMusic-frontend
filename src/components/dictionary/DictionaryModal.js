import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const DictionaryModal = ({ show, onClose, onSave, item, mode }) => {
    const [formData, setFormData] = useState({ code: "", name: "" });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.code.trim()) newErrors.code = "Код обязателен";
        if (!formData.name.trim()) newErrors.name = "Название обязательно";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (item) {
            setFormData({ code: item.code || "", name: item.name || "" });
        } else {
            setFormData({ code: "", name: "" });
        }
    }, [item]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!validate()) return;
        if (!formData.code.trim() || !formData.name.trim()) {
            alert("Оба поля обязательны для заполнения");
            return;
        }

        if (formData.code.length > 20 || formData.name.length > 100) {
            alert("Код не должен превышать 20 символов, название — 100");
            return;
        }
        onSave(formData);
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{mode === "edit" ? "Редактировать" : "Добавить"} запись</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Код</Form.Label>
                        <Form.Control
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            disabled={mode === "edit"}
                            isInvalid={!!errors.code}
                        />
                        <Form.Control.Feedback type="invalid">{errors.code}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Название</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
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

export default DictionaryModal;
