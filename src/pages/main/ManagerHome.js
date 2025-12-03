import React, {useEffect, useState} from "react";
import axiosInstance from "../../api/axiosInstance";
import {Button, Card, Col, Row} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {
    LineChart, Line,
    BarChart, Bar,
    XAxis, YAxis, Tooltip,
    ResponsiveContainer
} from "recharts";
import ReportModal from "../../components/reports/ReportModal";

const ManagerHome = () => {
    const navigate = useNavigate();
    const managerId = localStorage.getItem("userId");

    const [showReport, setShowReport] = useState(false);
    const [overview, setOverview] = useState(null);
    const [salesTrends, setSalesTrends] = useState([]);
    const [topClients, setTopClients] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [categoryPreview, setCategoryPreview] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        if (!managerId) return;

        setLoading(true);
        try {
            const [
                overviewRes,
                trendsRes,
                clientsRes,
                productsRes,
                categoryRes
            ] = await Promise.all([
                axiosInstance.get(`/statistics/overview`),
                axiosInstance.get(`/statistics/manager/${managerId}/sales-trends`, {
                    params: {
                        startDate: "2022-01-01",
                        endDate: "2028-12-31",
                        groupBy: "month",
                        limit: 100
                    }
                }),
                axiosInstance.get(`/statistics/manager/${managerId}/top-clients`, {
                    params: {
                        startDate: "2022-01-01",
                        endDate: "2028-12-31",
                        groupBy: "month",
                        limit: 100
                    }
                }),
                axiosInstance.get(`/statistics/manager/${managerId}/top-products`, {
                    params: {
                        startDate: "2022-01-01",
                        endDate: "2028-12-31",
                        groupBy: "month",
                        limit: 100
                    }
                }),
                axiosInstance.get(`/statistics/category-sales`, {
                    params: {
                        startDate: "2022-01-01",
                        endDate: "2028-12-31",
                        managerId
                    }
                })
            ]);

            setOverview(overviewRes.data);
            setSalesTrends(trendsRes.data);
            setTopClients(clientsRes.data);
            setTopProducts(productsRes.data);
            setCategoryPreview(categoryRes.data.slice(0, 6))
        } catch (err) {
            console.error("Ошибка загрузки аналитики менеджера:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (!overview) return <p className="text-center text-muted">Нет данных</p>;

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fw-bold">Панель менеджера</h2>
                <Button variant="warning" onClick={() => setShowReport(true)}>
                    Сформировать отчёт
                </Button>
            </div>

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

            <Row className="mt-3">
                <Col lg={12} className="mb-4">
                    <Card className="p-3 shadow-sm cursor-pointer"
                          onClick={() => navigate("/manager/statistics/sales")}>
                        <h5 className="mb-3">Динамика моих продаж</h5>

                        <div style={{height: "300px"}}>
                            <ResponsiveContainer>
                                <LineChart data={salesTrends}>
                                    <XAxis
                                        dataKey="period"
                                        tick={false}
                                        label={{ value: "Период", position: "insideBottom", offset: 0 }}
                                    />
                                    <YAxis
                                        label={{ value: "Доход, ₽", angle: -90, position: "insideLeft" }}
                                    />
                                    <Tooltip formatter={(v) => `${v} ₽`} />
                                    <Line type="monotone" dataKey="totalRevenue" stroke="#0d6efd" strokeWidth={2}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                <Col lg={6} className="mb-4">
                    <Card className="p-3 shadow-sm cursor-pointer"
                          onClick={() => navigate("/manager/statistics/clients")}>
                        <h5 className="mb-3">Мои топ клиенты</h5>

                        <div style={{height: "250px"}}>
                            <ResponsiveContainer>
                                <BarChart data={topClients}>
                                    <XAxis
                                        dataKey="clientName"
                                        tick={false}
                                        label={{ value: "Клиенты", position: "insideBottom", offset: 0 }}
                                    />
                                    <YAxis
                                        label={{ value: "Потрачено, ₽", angle: -90, position: "insideLeft" }}
                                    />
                                    <Tooltip formatter={(v) => `${v} ₽`} />
                                    <Bar dataKey="totalSpent" fill="#198754" />
                                </BarChart>
                            </ResponsiveContainer>

                        </div>
                    </Card>
                </Col>

                <Col lg={6} className="mb-5">
                    <Card className="p-3 shadow-sm cursor-pointer"
                          onClick={() => navigate("/manager/statistics/products")}>
                        <h5 className="mb-3">Мои топ товары</h5>

                        <div style={{height: "250px"}}>
                            <ResponsiveContainer>
                                <BarChart data={topProducts}>
                                    <XAxis
                                        dataKey="productName"
                                        tick={false}
                                        label={{ value: "Товары", position: "insideBottom", offset: 0 }}
                                    />
                                    <YAxis
                                        label={{ value: "Доход, ₽", angle: -90, position: "insideLeft" }}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="totalRevenue" fill="#6610f2" />
                                </BarChart>
                            </ResponsiveContainer>

                        </div>
                    </Card>
                </Col>
                <Col lg={12} className="mb-4">
                    <Card
                        className="p-3 shadow-sm cursor-pointer"
                        onClick={() => navigate("/manager/statistics/categories")}
                    >
                        <h5 className="mb-3">Продажи по категориям</h5>

                        <div style={{ height: "260px" }}>
                            <ResponsiveContainer>
                                <BarChart data={categoryPreview}>
                                    <XAxis dataKey="category"/>
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="totalRevenue" fill="#fd7e14" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            <ReportModal
                show={showReport}
                onClose={() => setShowReport(false)}
                role="MANAGER"
                managerId={managerId}
            />
        </div>
    );
};

export default ManagerHome;
