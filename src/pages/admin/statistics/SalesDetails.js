import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Row, Col, Card, Spinner, Form, Button } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const SalesDetails = () => {
    const [salesTrend, setSalesTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        groupBy: "month",
        limit: 100
    });

    const loadSales = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/statistics/sales-trends", {
                params: filters
            });
            setSalesTrend(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSales();
    }, [filters]);

    return (
        <div className="p-4">
            <h4 className="mb-3">Динамика продаж</h4>

            <Form className="mb-3 d-flex gap-2">
                <Form.Control
                    type="date"
                    value={filters.startDate}
                    onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                />
                <Form.Control
                    type="date"
                    value={filters.endDate}
                    onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                />

                <Form.Select
                    value={filters.groupBy}
                    onChange={e => setFilters({ ...filters, groupBy: e.target.value })}
                >
                    <option value="day">По дням</option>
                    <option value="month">По месяцам</option>
                    <option value="year">По годам</option>
                </Form.Select>

                <Form.Select
                    value={filters.limit}
                    onChange={e => setFilters({ ...filters, limit: Number(e.target.value) })}
                >
                    <option value={30}>30 точек</option>
                    <option value={60}>60 точек</option>
                    <option value={100}>100 точек</option>
                </Form.Select>
            </Form>

            {loading ? (
                <Spinner />
            ) : (
                <Card>
                    <Card.Body style={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesTrend}>
                                <XAxis
                                    dataKey="period"
                                    tick={false}
                                    label={{ value: "Период", position: "insideBottom", offset: 0 }}
                                />
                                <YAxis
                                    label={{ value: "Доход, ₽", angle: -90, position: "insideLeft" }}
                                />
                                <Tooltip/>
                                <Line dataKey="totalRevenue" stroke="#0d6efd" strokeWidth={2}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};


export default SalesDetails;
