import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Card, Spinner, Table, Form, Button } from "react-bootstrap";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

const OrdersDetails = () => {
    const [orderStatus, setOrderStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState("");

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/statistics/order-status`);
            setOrderStatus(res.data);
        } catch (err) {
            console.error("Ошибка загрузки заказов:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const COLORS = ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6c757d"];

    return (
        <div className="p-4">
            <h4 className="mb-3">Распределение заказов по статусам</h4>

            <Form className="mb-3 d-flex gap-2">
                <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    <option value="">Все</option>
                    {orderStatus.map((s) => (
                        <option key={s.status} value={s.status}>{s.status}</option>
                    ))}
                </Form.Select>
                <Button variant={"warning"} onClick={loadData}>Обновить</Button>
            </Form>

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <>
                    <Card className="mb-4">
                        <Card.Body style={{ height: "400px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={orderStatus} dataKey="count" nameKey="status" outerRadius={120} label>
                                        {orderStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header>Таблица заказов</Card.Header>
                        <Card.Body>
                            <Table striped hover>
                                <thead>
                                <tr>
                                    <th>Статус</th>
                                    <th>Количество</th>
                                </tr>
                                </thead>
                                <tbody>
                                {orderStatus.map((o) => (
                                    <tr key={o.status}>
                                        <td>{o.status}</td>
                                        <td>{o.count}</td>
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

export default OrdersDetails;
