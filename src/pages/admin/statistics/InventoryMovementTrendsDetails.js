import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Card, Spinner, Table, Button } from "react-bootstrap";
import StatisticsFilter from "../../../components/statistics/StatisticsFilter";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useNavigate } from "react-router-dom";

const InventoryMovementTrendsDetails = ({ isManager = false }) => {
    const navigate = useNavigate();
    const managerId = localStorage.getItem("userId");

    const [filters, setFilters] = useState({
        startDate: "2022-01-01",
        endDate: "2030-01-01",
        groupBy: "month",
        limit: 200,
        productId: "",
        categoryId: ""
    });

    const [movementData, setMovementData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const movementParams = {
                startDate: filters.startDate,
                endDate: filters.endDate,
                groupBy: filters.groupBy,
                limit: filters.limit,
            };
            if (filters.productId) movementParams.productId = filters.productId;
            if (filters.categoryId) movementParams.categoryId = filters.categoryId;

            const productsParams = {
                startDate: filters.startDate,
                endDate: filters.endDate,
                limit: filters.limit
            };
            if (isManager) productsParams.managerId = managerId;

            const [movementRes, productsRes] = await Promise.all([
                axios.get("/statistics/inventory-movement-trends", { params: movementParams }),
                isManager
                    ? axios.get(`/statistics/manager/${managerId}/top-products`, { params: productsParams })
                    : axios.get(`/statistics/top-products`, { params: productsParams })
            ]);

            setMovementData(movementRes.data);
            setTopProducts(productsRes.data);
        } catch (err) {
            console.error("Ошибка загрузки данных:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filters]);

    if (loading) return <Spinner animation="border" className="m-4" />;

    return (
        <div className="p-4">
            <h4 className="mb-3">Движение товаров — динамика</h4>

            <StatisticsFilter filters={filters} onChange={setFilters} />

            <Card className="mb-4">
                <Card.Body style={{ height: "400px" }}>
                    <ResponsiveContainer>
                        <LineChart data={movementData}>
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="incoming" stroke="#198754" strokeWidth={2} name="Приход" />
                            <Line type="monotone" dataKey="outgoing" stroke="#dc3545" strokeWidth={2} name="Расход" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header>Топовые товары</Card.Header>
                <Card.Body>
                    <Table striped hover>
                        <thead>
                        <tr>
                            <th>Товар</th>
                            <th>Продано</th>
                            <th>Доход</th>
                            <th>Сезонность</th>
                            <th>Движение</th>
                        </tr>
                        </thead>
                        <tbody>
                        {topProducts.map(p => (
                            <tr key={p.productId}>
                                <td>{p.productName}</td>
                                <td>{p.totalSold}</td>
                                <td>{p.totalRevenue} ₽</td>
                                <td>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        onClick={() =>
                                            navigate(
                                                isManager
                                                    ? `/manager/statistics/product/${p.productId}/seasonality`
                                                    : `/admin/statistics/product/${p.productId}/seasonality`
                                            )
                                        }
                                    >
                                        Сезонность
                                    </Button>
                                </td>
                                <td>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() =>
                                            navigate(
                                                isManager
                                                    ? `/manager/statistics/inventory-movement-details?productId=${p.productId}`
                                                    : `/admin/statistics/inventory-movement-details?productId=${p.productId}`
                                            )
                                        }
                                    >
                                        Детали движения
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default InventoryMovementTrendsDetails;
