import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Card, Spinner, Table, Button } from "react-bootstrap";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import StatisticsFilter from "../../../components/statistics/StatisticsFilter";
import { useNavigate } from "react-router-dom";

const ManagerProductsDetails = () => {
    const managerId = localStorage.getItem("userId");
    const navigate = useNavigate();

    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        startDate: "2022-01-01",
        endDate: "2030-01-01",
        groupBy: "month",
        limit: 30
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const params = {
                ...filters,
                managerId,
                limit: 20
            };

            const res = await axios.get(
                `/statistics/manager/${managerId}/top-products`,
                { params }
            );

            setTopProducts(res.data);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filters]);

    return (
        <div className="p-4">
            <h4 className="mb-3">Мои топовые товары</h4>

            <StatisticsFilter filters={filters} onChange={setFilters} />

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <>
                    <Card className="mb-4">
                        <Card.Body style={{ height: "420px" }}>
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
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header>Таблица товаров</Card.Header>
                        <Card.Body>
                            <Table striped hover>
                                <thead>
                                <tr>
                                    <th>Товар</th>
                                    <th>Продано</th>
                                    <th>Доход</th>
                                    <th>Сезонность</th>
                                    <th>Движение</th>
                                    <th></th>
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
                                                    navigate(`/manager/statistics/product/${p.productId}/seasonality`)
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
                                                    navigate(`/manager/statistics/inventory-movement-details?productId=${p.productId}`)
                                                }
                                            >
                                                Движение
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>

                            </Table>
                        </Card.Body>
                    </Card>
                </>
            )}
        </div>
    );
};

export default ManagerProductsDetails;
