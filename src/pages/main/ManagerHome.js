import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Card, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    LineChart, Line,
    BarChart, Bar,
    XAxis, YAxis, Tooltip,
    ResponsiveContainer
} from "recharts";

const normalizeDate = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().split("T")[0];
};

const ManagerHome = () => {
    const navigate = useNavigate();
    const managerId = localStorage.getItem("userId");

    const [overview, setOverview] = useState(null);
    const [salesTrends, setSalesTrends] = useState([]);
    const [topClients, setTopClients] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters] = useState({
        startDate: "2025-01-01",
        endDate: "2025-12-31",
    });

    const buildParams = () => {
        const params = {};
        if (filters.startDate) params.startDate = normalizeDate(filters.startDate);
        if (filters.endDate) params.endDate = normalizeDate(filters.endDate);
        return params;
    };

    const loadData = async () => {
        if (!managerId) return;

        setLoading(true);
        try {
            const params = buildParams();

            const [
                overviewRes,
                trendsRes,
                clientsRes,
                productsRes
            ] = await Promise.all([
                axiosInstance.get("/statistics/overview"),
                axiosInstance.get(`/statistics/manager/${managerId}/sales-trends`, { params }),
                axiosInstance.get(`/statistics/manager/${managerId}/top-clients?limit=5`),
                axiosInstance.get(`/statistics/manager/${managerId}/top-products?limit=5`),
            ]);

            setOverview(overviewRes.data);
            setSalesTrends(trendsRes.data);
            setTopClients(clientsRes.data);
            setTopProducts(productsRes.data);
        } catch (err) {
            console.error("Ошибка загрузки данных менеджера:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filters]);

    if (!overview)
        return <p className="text-center text-muted">Нет данных для отображения</p>;

    return (
        <div className="p-4">
            <h2 className="mb-4 fw-bold">Панель менеджера</h2>
            {loading && <p>Загрузка...</p>}

            <Row className="mb-4">
                <Col lg={3} sm={6} className="mb-3">
                    <Card><Card.Body>
                        <Card.Title>Всего заказов</Card.Title>
                        <h3>{overview.totalOrders}</h3>
                    </Card.Body></Card>
                </Col>

                <Col lg={3} sm={6} className="mb-3">
                    <Card><Card.Body>
                        <Card.Title>Доход</Card.Title>
                        <h3>{overview.totalRevenue} ₽</h3>
                    </Card.Body></Card>
                </Col>

                <Col lg={3} sm={6} className="mb-3">
                    <Card><Card.Body>
                        <Card.Title>Клиенты</Card.Title>
                        <h3>{overview.totalClients}</h3>
                    </Card.Body></Card>
                </Col>

                <Col lg={3} sm={6} className="mb-3">
                    <Card><Card.Body>
                        <Card.Title>Товары</Card.Title>
                        <h3>{overview.totalProducts}</h3>
                    </Card.Body></Card>
                </Col>
            </Row>

            <Row className="mt-3">

                <Col lg={12} className="mb-4">
                    <Card className="p-3 shadow-sm cursor-pointer"
                          onClick={() => navigate("/manager/statistics/sales")}>
                        <h5 className="mb-3">Тренды продаж (мои)</h5>

                        <div style={{ height: "300px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesTrends}>
                                    <XAxis dataKey="period" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="totalRevenue"
                                        stroke="#0d6efd"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                <Col lg={6} className="mb-4">
                    <Card className="p-3 shadow-sm cursor-pointer"
                          onClick={() => navigate("/manager/statistics/clients")}>
                        <h5 className="mb-3">Мои топ клиенты</h5>

                        <div style={{ height: "250px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topClients}>
                                    <XAxis dataKey="clientName" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="totalRevenue" fill="#198754" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                <Col lg={6} className="mb-5">
                    <Card className="p-3 shadow-sm cursor-pointer"
                          onClick={() => navigate("/manager/statistics/products")}>
                        <h5 className="mb-3">Мои топ продукты</h5>

                        <div style={{ height: "250px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProducts}>
                                    <XAxis dataKey="productName" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="totalSold" fill="#6610f2" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

            </Row>
        </div>
    );
};

export default ManagerHome;
