import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Card, Spinner } from "react-bootstrap";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import StatisticsFilter from "../../../components/statistics/StatisticsFilter";

const ManagerClientsDetails = () => {
    const managerId = localStorage.getItem("userId");

    const [topClients, setTopClients] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        managerId
    });

    const loadData = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams();

            if (filters.startDate) params.append("startDate", filters.startDate);
            if (filters.endDate) params.append("endDate", filters.endDate);

            params.append("limit", 10);

            const res = await axios.get(
                `/statistics/manager/${managerId}/top-clients?${params}`
            );

            setTopClients(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filters]);

    return (
        <div className="p-4">
            <h4>Мои топовые клиенты</h4>

            <StatisticsFilter
                filters={filters}
                onChange={setFilters}
                onApply={loadData}
            />

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Card>
                    <Card.Body style={{ height: "400px" }}>
                        <ResponsiveContainer>
                            <BarChart
                                data={topClients.map(c => ({
                                    ...c,
                                    clientName: c.clientName?.length > 15
                                        ? c.clientName.slice(0, 15) + "..."
                                        : c.clientName
                                }))}
                                margin={{ top: 20, right: 20, left: 10, bottom: 50 }}
                                barCategoryGap="20%"
                            >
                                <XAxis
                                    dataKey="clientName"
                                    angle={-15}
                                    textAnchor="end"
                                    interval={0}
                                    height={60}
                                />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => `${value} ₽`}
                                    labelFormatter={(label) => `Клиент: ${label}`}
                                />
                                <Bar
                                    dataKey="totalSpent"
                                    fill="#198754"
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>

                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default ManagerClientsDetails;
