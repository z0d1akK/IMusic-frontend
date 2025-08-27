import React from "react";
import { Modal, Button } from "react-bootstrap";

const ConfirmModal = ({ show, onClose, onConfirm, message }) => {
    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Подтверждение</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message || "Вы уверены?"}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Отмена
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Удалить
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;
