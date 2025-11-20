import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Row, Col, Card, Spinner, Form, Button } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const SalesDetails = () => {
    const [salesTrend, setSalesTrend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("2025-01-01");
    const [endDate, setEndDate] = useState("2025-12-31");

    const loadSales = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/statistics/sales-trends?startDate=${startDate}&endDate=${endDate}`);
            setSalesTrend(res.data);
        } catch (err) {
            console.error("Ошибка загрузки динамики продаж:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSales();
    }, []);

    return (
        <div className="p-4">
            <h4 className="mb-3">Динамика продаж</h4>

            <Form className="mb-3 d-flex gap-2">
                <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <Button variant={"warning"} onClick={loadSales}>Применить</Button>
            </Form>

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Card>
                    <Card.Body style={{ height: "400px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesTrend}>
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="totalRevenue" stroke="#0d6efd" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default SalesDetails;
