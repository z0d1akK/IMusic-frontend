import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Row, Col, Card, Spinner, Form, Button } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import StatisticsFilter from "../../../components/statistics/StatisticsFilter";

const SalesDetails = () => {
    const [salesTrend, setSalesTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        startDate: "2022-01-01",
        endDate: "2027-12-31",
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

            <StatisticsFilter filters={filters} onChange={setFilters} />

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
