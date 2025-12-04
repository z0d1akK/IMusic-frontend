import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Card, Spinner, Button } from "react-bootstrap";
import StatisticsFilter from "../../../components/statistics/StatisticsFilter";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";

const AvgCheckDetails = ({ isManager = false }) => {
    const navigate = useNavigate();
    const managerId = localStorage.getItem("userId");

    const [filters, setFilters] = useState({
        startDate: "2022-01-01",
        endDate: "2030-01-01",
        limit: 30,
    });

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);

        try {
            const params = {
                startDate: filters.startDate,
                endDate: filters.endDate,
                limit: filters.limit,
            };

            const url = isManager
                ? `/statistics/manager/${managerId}/avg-check`
                : `/statistics/avg-check`;

            const res = await axios.get(url, { params });
            setData(res.data);
        } catch (err) {
            console.error("Ошибка загрузки среднего чека:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filters]);

    return (
        <div className="p-4">
            <h4 className="mb-3">Средний чек клиентов</h4>

            <StatisticsFilter filters={filters} onChange={setFilters} />

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <Card className="mt-3">
                    <Card.Body style={{ height: "400px" }}>
                        <ResponsiveContainer>
                            <BarChart data={data} layout="vertical">
                                <XAxis type="number" />
                                <YAxis dataKey="clientName" type="category" width={120} />
                                <Tooltip formatter={(v) => `${v} ₽`} />
                                <Bar dataKey="avgCheck" fill="#0d6efd" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>
            )}

            <Card className="mt-4">
                <Card.Header>Клиенты</Card.Header>
                <Card.Body>
                    {data.map((c) => (
                        <div
                            key={c.clientId}
                            className="d-flex justify-content-between align-items-center border-bottom py-2"
                        >
                            <div>
                                <strong>{c.clientName}</strong>
                                <div className="text-muted small">
                                    Средний чек: {c.avgCheck} ₽
                                </div>
                            </div>

                            <Button
                                variant="warning"
                                onClick={() =>
                                    navigate(
                                        isManager
                                            ? `/manager/statistics/avg-check/${c.clientId}`
                                            : `/admin/statistics/avg-check/${c.clientId}`
                                    )
                                }
                            >
                                Детали
                            </Button>
                        </div>
                    ))}
                </Card.Body>
            </Card>
        </div>
    );
};

export default AvgCheckDetails;
