import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Spinner } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";

const OrderStatusHistoryModal = ({ show, onHide, orderId, statuses, users }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (show && orderId) {
            setLoading(true);
            axiosInstance
                .get(`/order-status-history/${orderId}`)
                .then((res) => setHistory(res.data || []))
                .catch(() => setHistory([]))
                .finally(() => setLoading(false));
        }
    }, [show, orderId]);

    const getStatusName = (id) =>
        statuses.find((s) => s.id === id)?.name || `#${id}`;
    const getUserName = (id) =>
        users.find((u) => u.id === id)?.fullName ||
        users.find((u) => u.id === id)?.username ||
        `#${id}`;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>История изменения статусов заказа #{orderId}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" />
                    </div>
                ) : history.length === 0 ? (
                    <p className="text-center">История пуста</p>
                ) : (
                    <Table bordered striped hover size="sm">
                        <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Было</th>
                            <th>Стало</th>
                            <th>Изменил</th>
                        </tr>
                        </thead>
                        <tbody>
                        {history.map((h) => (
                            <tr key={h.id}>
                                <td>{h.changedAt?.replace("T", " ")}</td>
                                <td>{getStatusName(h.oldStatusId)}</td>
                                <td>{getStatusName(h.newStatusId)}</td>
                                <td>{getUserName(h.changedById)}</td>
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

export default OrderStatusHistoryModal;
