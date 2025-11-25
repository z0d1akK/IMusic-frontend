import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";
import ReportModal from "../../components/reports/ReportModal";

const AdminHome = () => {
    const [showReport, setShowReport] = useState(false);
    const [overview, setOverview] = useState(null);
    const [salesTrend, setSalesTrend] = useState([]);
    const [orderStatus, setOrderStatus] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [managerRating, setManagerRating] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [
                    overviewRes,
                    trendRes,
                    statusRes,
                    topProductsRes,
                    managersRes
                ] = await Promise.all([
                    axios.get("/statistics/overview"),
                    axios.get("/statistics/sales-trends?startDate=2025-01-01&endDate=2025-12-31"),
                    axios.get("/statistics/order-status"),
                    axios.get("/statistics/top-products?limit=5"),
                    axios.get("/statistics/manager-rating")
                ]);

                setOverview(overviewRes.data);
                setSalesTrend(trendRes.data);
                setOrderStatus(statusRes.data);
                setTopProducts(topProductsRes.data);
                setManagerRating(managersRes.data);
            } catch (err) {
                console.error("Ошибка загрузки статистики:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-75">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!overview) return <p className="text-center text-muted">Нет данных для отображения</p>;

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fw-bold">Панель администратора</h2>
                <Button variant="warning" onClick={() => setShowReport(true)}>
                    Сформировать отчёт
                </Button>
            </div>
            {loading && <p>Загрузка...</p>}
            <Row className="mb-4">
                <Col lg={3} sm={6} className="mb-3">
                    <Card>
                        <Card.Body>
                            <Card.Title>Всего заказов</Card.Title>
                            <h3>{overview.totalOrders}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} sm={6} className="mb-3">
                    <Card>
                        <Card.Body>
                            <Card.Title>Доход</Card.Title>
                            <h3>{overview.totalRevenue} ₽</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} sm={6} className="mb-3">
                    <Card>
                        <Card.Body>
                            <Card.Title>Клиенты</Card.Title>
                            <h3>{overview.totalClients}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={3} sm={6} className="mb-3">
                    <Card>
                        <Card.Body>
                            <Card.Title>Товары</Card.Title>
                            <h3>{overview.totalProducts}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col lg={8}>
                    <Card onClick={() => navigate("/admin/statistics/sales")} className="cursor-pointer">
                        <Card.Header>Динамика продаж</Card.Header>
                        <Card.Body style={{height: "300px"}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesTrend}>
                                    <XAxis dataKey="period"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Line type="monotone" dataKey="totalRevenue" stroke="#0d6efd" strokeWidth={2}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card onClick={() => navigate("/admin/statistics/orders")} className="cursor-pointer">
                        <Card.Header>Распределение заказов</Card.Header>
                        <Card.Body style={{height: "300px"}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={orderStatus} dataKey="count" nameKey="status" outerRadius={80} label>
                                        {orderStatus.map((_, i) => (
                                            <Cell key={i} fill={["#0d6efd", "#198754", "#ffc107", "#dc3545"][i % 4]}/>
                                        ))}
                                    </Pie>
                                    <Tooltip/>
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col lg={6}>
                    <Card onClick={() => navigate("/admin/statistics/products")} className="cursor-pointer mb-4">
                        <Card.Header>Топ продаваемых товаров</Card.Header>
                        <Card.Body style={{height: "300px"}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProducts}>
                                    <XAxis dataKey="productName"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Bar dataKey="totalRevenue" fill="#198754"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card onClick={() => navigate("/admin/statistics/managers")} className="cursor-pointer mb-4">
                        <Card.Header>Рейтинг менеджеров</Card.Header>
                        <Card.Body style={{height: "300px"}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={managerRating}>
                                    <XAxis dataKey="managerName"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Bar dataKey="totalRevenue" fill="#6610f2"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <ReportModal
                show={showReport}
                onClose={() => setShowReport(false)}
                role="ADMIN"
            />

        </div>
    );
};

export default AdminHome;
