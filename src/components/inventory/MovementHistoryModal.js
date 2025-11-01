import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Spinner } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";

const MovementHistoryModal = ({ show, onHide, product, onEditMovement }) => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (show && product?.id) {
            fetchMovements();
        }
    }, [show, product]);

    const fetchMovements = async () => {
        setLoading(true);
        setError("");
        try {
            const body = {
                productId: product.id,
                page: 0,
                size: 100,
                sortBy: "createdAt",
                sortDirection: "desc"
            };
            const res = await axiosInstance.post("/inventory-movements/paged", body);
            setMovements(res.data || []);
        } catch (e) {
            console.error("Ошибка при загрузке истории", e);
            setError("Не удалось загрузить историю движения.");
        } finally {
            setLoading(false);
        }
    };


    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleString();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>История движения — {product?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" />
                    </div>
                ) : error ? (
                    <div className="text-danger text-center">{error}</div>
                ) : movements.length === 0 ? (
                    <div className="text-muted text-center">Нет записей о движении</div>
                ) : (
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Дата</th>
                            <th>Тип</th>
                            <th>Количество</th>
                            <th>Примечание</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {movements.map((m, idx) => (
                            <tr key={m.id}>
                                <td>{idx + 1}</td>
                                <td>{formatDate(m.createdAt)}</td>
                                <td>{m.movementTypeCode || "—"}</td>
                                <td>{m.quantity}</td>
                                <td>{m.comment || "—"}</td>
                                <td>
                                    <Button
                                        size="sm"
                                        variant="outline-warning"
                                        onClick={() => onEditMovement(m)}
                                    >
                                        Редактировать
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>

                    </Table>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Закрыть
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default MovementHistoryModal;
