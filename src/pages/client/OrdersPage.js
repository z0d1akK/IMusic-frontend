import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import OrderDetailsModal from "../../components/order/OrderDetailsModal";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [clientId, setClientId] = useState(null);
    const [hasClientProfile, setHasClientProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!userId) {
            setError("Пользователь не авторизован");
            setLoading(false);
            return;
        }

        const loadOrders = async () => {
            try {
                setLoading(true);

                const profileRes = await axiosInstance.get("/clients/profile", {
                    suppressGlobalErrorHandler: true,
                });
                const client = profileRes.data;
                if (!client || !client.id) {
                    setHasClientProfile(false);
                    setLoading(false);
                    return;
                }

                setClientId(client.id);
                setHasClientProfile(true);

                const ordersRes = await axiosInstance.post("/orders/paged", {
                    clientId: client.id,
                    page,
                    size,
                    sortBy: "createdAt",
                    sortDirection: "DESC",
                });

                setOrders(ordersRes.data.content || ordersRes.data);
                setTotalPages(ordersRes.data.totalPages || 1);
            } catch (e) {
                console.error(e);
                setError("Ошибка загрузки заказов");
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [userId, page, size]);

    const openDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedOrder(null);
        setShowModal(false);
    };

    if (loading) return <div className="text-center mt-5">Загрузка...</div>;
    if (error) return <div className="alert alert-danger mt-4">{error}</div>;

    return (
        <div className="container mt-4">
            <h2>Мои заказы</h2>

            {hasClientProfile === false ? (
                <div className="alert alert-warning mt-4">
                    Ваш профиль клиента ещё не создан. Обратитесь к менеджеру.
                </div>
            ) : orders.length === 0 ? (
                <div className="alert alert-info mt-4">Заказы не найдены</div>
            ) : (
                <>
                    <table className="table table-hover mt-3">
                        <thead>
                        <tr>
                            <th>№ заказа</th>
                            <th>Дата</th>
                            <th>Статус</th>
                            <th>Сумма</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{new Date(order.createdAt).toLocaleString()}</td>
                                <td>{order.statusName || order.statusId}</td>
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
                <OrderDetailsModal orderId={selectedOrder.id} onClose={closeModal} />
            )}
        </div>
    );
};

export default OrdersPage;
