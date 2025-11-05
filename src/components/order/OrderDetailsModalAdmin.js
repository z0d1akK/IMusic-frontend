import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Spinner } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";

const OrderDetailsModalAdmin = ({ show, onHide, order }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (show && order) {
            setLoading(true);
            axiosInstance
                .get(`/orders/${order.id}`)
                .then((res) => setDetails(res.data))
                .catch(() => setDetails(null))
                .finally(() => setLoading(false));
        }
    }, [show, order]);

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Заказ №{order?.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" />
                    </div>
                ) : !details ? (
                    <p className="text-center text-danger">Ошибка загрузки</p>
                ) : (
                    <>
                        <p><b>Клиент:</b> {details.clientName}</p>
                        <p><b>Дата:</b> {details.createdAt?.substring(0, 10)}</p>
                        <p><b>Статус:</b> {details.statusName}</p>
                        <p><b>Сумма:</b> {details.totalPrice?.toFixed(2)} ₽</p>

                        <h5>Товары</h5>
                        <Table bordered hover size="sm">
                            <thead>
                            <tr>
                                <th>Название</th>
                                <th>Количество</th>
                                <th>Цена</th>
                                <th>Сумма</th>
                            </tr>
                            </thead>
                            <tbody>
                            {details.items?.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.productName || "—"}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.unitPrice?.toFixed(2)} ₽</td>
                                    <td>
                                        {(item.unitPrice * item.quantity).toFixed(2)} ₽
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </>
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

export default OrderDetailsModalAdmin;
