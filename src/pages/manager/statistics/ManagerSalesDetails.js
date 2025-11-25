import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Card, Spinner } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import StatisticsFilter from "../../../components/statistics/StatisticsFilter"

const ManagerSalesDetails = () => {
    const managerId = localStorage.getItem("userId");

    const [salesTrend, setSalesTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        managerId: managerId
    });

    const loadSales = async () => {
        setLoading(true);

        const params = new URLSearchParams(filters);
        const res = await axios.get(`/statistics/sales-trends?groupBy=month&${params}`);

        setSalesTrend(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadSales();
    }, [filters]);

    return (
        <div className="p-4">
            <h4>Моя динамика продаж</h4>

            <StatisticsFilter
                filters={filters}
                onChange={setFilters}
                onApply={loadSales}
            />

            {loading ? <Spinner animation="border" /> : (
                <Card>
                    <Card.Body style={{ height: "400px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesTrend}>
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="totalRevenue"
                                    stroke="#0d6efd"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default ManagerSalesDetails;
