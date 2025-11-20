import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Card, Spinner, Table, Row, Col } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const ProductsDetails = () => {
    const [topProducts, setTopProducts] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [top, low] = await Promise.all([
                axios.get("/statistics/top-products?limit=10"),
                axios.get("/statistics/low-stock?threshold=5")
            ]);
            setTopProducts(top.data);
            setLowStock(low.data);
        } catch (err) {
            console.error("Ошибка загрузки товаров:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="p-4">
            <h4 className="mb-3">Статистика по товарам</h4>

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Row>
                    <Col lg={6}>
                        <Card className="mb-4">
                            <Card.Header>Топ продаваемых товаров</Card.Header>
                            <Card.Body style={{ height: "400px" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topProducts}>
                                        <XAxis dataKey="productName" />
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
