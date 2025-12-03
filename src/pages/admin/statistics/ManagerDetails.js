import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Card, Spinner, Table } from "react-bootstrap";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import StatisticsFilter from "../../../components/statistics/StatisticsFilter";

const ManagerDetails = () => {
    const [managerRating, setManagerRating] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        startDate: "2022-01-01",
        endDate: "2030-01-01",
        groupBy: "month",
        limit: 100
    });

    const loadData = async () => {
        setLoading(true);

        try {
            const res = await axios.get("/statistics/manager-rating", {
                params: filters
            });
            setManagerRating(res.data);
        } catch (err) {
            console.error("Ошибка загрузки рейтинга менеджеров:", err);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [filters]);

    return (
        <div className="p-4">
            <h4 className="mb-3">Рейтинг менеджеров</h4>

            <StatisticsFilter filters={filters} onChange={setFilters} />

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <>
                    <Card className="mb-4">
                        <Card.Body style={{ height: "400px" }}>
                            <ResponsiveContainer>
                                <BarChart data={managerRating}>
                                    <XAxis dataKey="managerName" tick={false} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="totalRevenue" fill="#6610f2" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header>Подробная таблица</Card.Header>
                        <Card.Body>
                            <Table striped hover>
                                <thead>
                                <tr>
                                    <th>Менеджер</th>
                                    <th>Количество заказов</th>
                                    <th>Доход</th>
                                </tr>
                                </thead>
                                <tbody>
                                {managerRating.map((m) => (
                                    <tr key={m.managerId}>
                                        <td>{m.managerName}</td>
                                        <td>{m.totalOrders}</td>
                                        <td>{m.totalRevenue} ₽</td>
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

export default ManagerDetails;
