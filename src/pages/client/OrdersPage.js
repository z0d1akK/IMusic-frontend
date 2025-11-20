import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import OrderDetailsModal from "../../components/order/OrderDetailsModal";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const loadData = async () => {
            if (!userId) {
                setError("Пользователь не авторизован");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const profileRes = await axiosInstance.get("/clients/profile", {
                    suppressGlobalErrorHandler: true,
                });
                const clientData = profileRes.data;
                if (!clientData || !clientData.id) {
                    setClient(null);
                    setLoading(false);
                    return;
                }

                setClient(clientData);

                const orderReq = {
                    clientId: clientData.id,
                    page,
                    size,
                    sortBy: "createdAt",
                    sortDirection: "DESC",
                };

                const ordersRes = await axiosInstance.post("/orders/paged", orderReq);
                const data = ordersRes.data;

                setOrders(data.content || data);
                setTotalPages(data.totalPages || 1);
            } catch (err) {
                console.error("Ошибка при загрузке заказов:", err);
                setError("Не удалось загрузить заказы. Попробуйте позже.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userId, page, size]);

    const openDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedOrder(null);
        setShowModal(false);
    };

    if (loading) {
        return <div className="text-center mt-5">Загрузка данных...</div>;
    }

    if (error) {
        return <div className="alert alert-danger mt-4">{error}</div>;
    }

    if (!client) {
        return (
            <div className="alert alert-warning mt-4">
                У вас пока нет профиля клиента. Обратитесь к менеджеру.
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2>Мои заказы</h2>

            {orders.length === 0 ? (
                <div className="alert alert-info mt-4">Вы ещё не сделали заказов.</div>
            ) : (
                <>
                    <table className="table table-hover mt-3 align-middle">
                        <thead className="table-light">
                        <tr>
                            <th>№</th>
                            <th>Дата создания</th>
                            <th>Статус</th>
                            <th>Сумма</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>{order.statusName || "—"}</td>
                                <td>{order.totalPrice?.toFixed(2)} ₽</td>
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => openDetails(order)}
                                    >
                                        Подробнее
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={page === 0}
                                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                            >
                                ← Назад
                            </button>
                            <span>
                                Страница {page + 1} из {totalPages}
                            </span>
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                disabled={page + 1 >= totalPages}
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                            >
                                Вперёд →
                            </button>
                        </div>
                    )}
                </>
            )}

            {showModal && selectedOrder && (
                <OrderDetailsModal
                    orderId={selectedOrder.id}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default OrdersPage;
