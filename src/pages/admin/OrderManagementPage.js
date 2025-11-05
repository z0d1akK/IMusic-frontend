import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import OrderDetailsModalAdmin from "../../components/order/OrderDetailsModalAdmin";
import UpdateOrderStatusModal from "../../components/order/UpdateOrderStatusModal";
import CreateOrderModal from "../../components/order/CreateOrderModal";
import OrderStatusHistoryModal from "../../components/order/OrderStatusHistoryModal";

const OrderManagementPage = () => {
    const [orders, setOrders] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [clients, setClients] = useState([]);
    const [users, setUsers] = useState([]);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyOrderId, setHistoryOrderId] = useState(null);

    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        clientId: "",
        statusId: "",
        createdById: "",
        minTotalPrice: "",
        maxTotalPrice: "",
        fromDate: "",
        toDate: "",
    });

    const [sortBy, setSortBy] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");
    const [page, setPage] = useState(0);
    const [size] = useState(12);

    const fetchOrders = async () => {
        try {
            const requestBody = {
                clientId: filters.clientId ? Number(filters.clientId) : null,
                statusId: filters.statusId ? Number(filters.statusId) : null,
                createdById: filters.createdById ? Number(filters.createdById) : null,
                minTotalPrice: filters.minTotalPrice
                    ? Number(filters.minTotalPrice)
                    : null,
                maxTotalPrice: filters.maxTotalPrice
                    ? Number(filters.maxTotalPrice)
                    : null,
                fromDate: filters.fromDate || null,
                toDate: filters.toDate || null,
                page,
                size,
                sortBy,
                sortDirection,
            };

            const res = await axiosInstance.post("/orders/paged", requestBody);
            setOrders(res.data || []);
        } catch (e) {
            console.error("Ошибка при загрузке заказов", e);
        }
    };

    const fetchStatuses = async () => {
        try {
            const res = await axiosInstance.get("/ref/order-statuses");
            setStatuses(res.data);
        } catch (e) {
            console.error("Ошибка при загрузке статусов", e);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await axiosInstance.post("/clients/paged", {
                page: 0,
                size: 100,
                sortBy: "id",
                sortDirection: "ASC"
            });
            setClients(res.data);
        } catch (e) {
            console.error("Ошибка при загрузке клиентов", e);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axiosInstance.post("/users/paged", {
                page: 0,
                size: 100,
                sortBy: "id",
                sortDirection: "ASC"
            });
            setUsers(res.data);
        } catch (e) {
            console.error("Ошибка при загрузке пользователей", e);
        }
    };



    useEffect(() => {
        fetchStatuses();
        fetchClients();
        fetchUsers();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchOrders();
        }, 300);
        return () => clearTimeout(timeout);
    }, [filters, page, sortBy, sortDirection]);

    const handleDelete = async (id) => {
        if (!window.confirm(`Удалить заказ №${id}?`)) return;
        try {
            await axiosInstance.delete(`/orders/${id}`);
            fetchOrders();
        } catch (e) {
            console.error("Ошибка при удалении заказа", e);
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const handleUpdateStatus = (order) => {
        setSelectedOrder(order);
        setShowStatusModal(true);
    };

    const handleViewHistory = (order) => {
        setHistoryOrderId(order.id);
        setShowHistoryModal(true);
    };

    return (
        <div className="container mt-4">
            <h3>Управление заказами</h3>

            <div className="d-flex justify-content-between mb-3">
                <button
                    className="btn btn-success"
                    onClick={() => setShowCreateModal(true)}
                >
                    Создать заказ
                </button>
                <button
                    className="btn btn-warning"
                    onClick={() => setShowFilters((v) => !v)}
                >
                    {showFilters ? "Скрыть фильтры" : "Показать фильтры"}
                </button>
            </div>

            {showFilters && (
                <div className="card p-3 mb-3">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={filters.clientId}
                                onChange={(e) =>
                                    setFilters({ ...filters, clientId: e.target.value })
                                }
                            >
                                <option value="">Все клиенты</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.companyName || c.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <select
                                className="form-select"
                                value={filters.statusId}
                                onChange={(e) =>
                                    setFilters({ ...filters, statusId: e.target.value })
                                }
                            >
                                <option value="">Все статусы</option>
                                {statuses.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <select
                                className="form-select"
                                value={filters.createdById}
                                onChange={(e) =>
                                    setFilters({ ...filters, createdById: e.target.value })
                                }
                            >
                                <option value="">Все создатели</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.fullName || u.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Мин. сумма"
                                value={filters.minTotalPrice}
                                onChange={(e) =>
                                    setFilters({ ...filters, minTotalPrice: e.target.value })
                                }
                            />
                        </div>
                        <div className="col-md-2">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Макс. сумма"
                                value={filters.maxTotalPrice}
                                onChange={(e) =>
                                    setFilters({ ...filters, maxTotalPrice: e.target.value })
                                }
                            />
                        </div>

                        <div className="col-md-2">
                            <input
                                type="date"
                                className="form-control"
                                value={filters.fromDate}
                                onChange={(e) =>
                                    setFilters({ ...filters, fromDate: e.target.value })
                                }
                            />
                        </div>

                        <div className="col-md-2">
                            <input
                                type="date"
                                className="form-control"
                                value={filters.toDate}
                                onChange={(e) =>
                                    setFilters({ ...filters, toDate: e.target.value })
                                }
                            />
                        </div>

                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={`${sortBy}_${sortDirection}`}
                                onChange={(e) => {
                                    const [field, dir] = e.target.value.split("_");
                                    setSortBy(field);
                                    setSortDirection(dir);
                                }}
                            >
                                <option value="id_asc">ID ↑</option>
                                <option value="id_desc">ID ↓</option>
                                <option value="totalPrice_asc">Сумма ↑</option>
                                <option value="totalPrice_desc">Сумма ↓</option>
                                <option value="createdAt_asc">Дата ↑</option>
                                <option value="createdAt_desc">Дата ↓</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <table className="table table-bordered table-hover">
                <thead className="table-light">
                <tr>
                    <th>ID</th>
                    <th>Клиент</th>
                    <th>Статус</th>
                    <th>Сумма</th>
                    <th>Дата</th>
                    <th>Создатель</th>
                    <th>Действия</th>
                </tr>
                </thead>
                <tbody>
                {orders.length === 0 && (
                    <tr>
                        <td colSpan="7" className="text-center">
                            Нет заказов
                        </td>
                    </tr>
                )}
                {orders.map((order) => (
                    <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.clientName}</td>
                        <td>{order.statusName}</td>
                        <td>{order.totalPrice?.toFixed(2)}</td>
                        <td>{order.createdAt?.substring(0, 10)}</td>
                        <td>{order.createdByName}</td>
                        <td>
                            <div className="d-flex flex-column gap-1">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleViewDetails(order)}
                                >
                                    Детали
                                </button>
                                <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() => handleUpdateStatus(order)}
                                >
                                    Изменить статус
                                </button>
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleViewHistory(order)}
                                >
                                    История
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(order.id)}
                                >
                                    Удалить
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {showDetailsModal && selectedOrder && (
                <OrderDetailsModalAdmin
                    show={showDetailsModal}
                    onHide={() => setShowDetailsModal(false)}
                    order={selectedOrder}
                    statuses={statuses}
                />
            )}

            {showStatusModal && selectedOrder && (
                <UpdateOrderStatusModal
                    show={showStatusModal}
                    onHide={() => setShowStatusModal(false)}
                    order={selectedOrder}
                    statuses={statuses}
                    onSave={fetchOrders}
                />
            )}

            {showCreateModal && (
                <CreateOrderModal
                    show={showCreateModal}
                    onHide={() => setShowCreateModal(false)}
                    clients={clients}
                    onSuccess={fetchOrders}
                />
            )}

            {showHistoryModal && historyOrderId && (
                <OrderStatusHistoryModal
                    show={showHistoryModal}
                    onHide={() => setShowHistoryModal(false)}
                    orderId={historyOrderId}
                    statuses={statuses}
                    users={users}
                />
            )}
        </div>
    );
};

export default OrderManagementPage;
