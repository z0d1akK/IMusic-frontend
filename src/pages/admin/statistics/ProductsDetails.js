import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import {Card, Spinner, Table, Row, Col} from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import StatisticsFilter from "../../../components/statistics/StatisticsFilter";

const ProductsDetails = () => {
    const [topProducts, setTopProducts] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        startDate: "2022-01-01",
        endDate: "2030-01-01",
        groupBy: "month",
        limit: 20
    });

    const loadData = async () => {
        setLoading(true);

        try {
            const resTop = await axios.get("/statistics/top-products", {
                params: filters
            });

            const resLow = await axios.get("/statistics/low-stock", {
                params: filters
            });

            setTopProducts(resTop.data);
            setLowStock(resLow.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filters]);

    return (
        <div className="p-4">
            <h4 className="mb-3">Статистика по товарам</h4>

            <StatisticsFilter filters={filters} onChange={setFilters} />

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Row>
                    <Col lg={6}>
                        <Card className="mb-4">
                            <Card.Header>Топ продаваемых товаров</Card.Header>
                            <Card.Body style={{ height: "400px" }}>
                                <ResponsiveContainer>
                                    <BarChart data={topProducts}>
                                        <XAxis dataKey="productName" tick={false} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="totalRevenue" fill="#198754" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={6}>
                        <Card>
                            <Card.Header>Товары с низким остатком</Card.Header>
                            <Card.Body>
                                <Table striped hover>
                                    <thead>
                                    <tr>
                                        <th>Название</th>
                                        <th>Остаток</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {lowStock.map((p) => (
                                        <tr key={p.productId}>
                                            <td>{p.productName}</td>
                                            <td>{p.stockQuantity}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default ProductsDetails;
