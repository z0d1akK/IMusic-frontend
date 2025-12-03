import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Card, Spinner, Table } from "react-bootstrap";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import StatisticsFilter from "../../../components/statistics/StatisticsFilter";

const CategorySalesDetails = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        startDate: "2022-01-01",
        endDate: "2030-01-01",
        groupBy: "month",
        limit: 60
    });

    const loadData = async () => {
        setLoading(true);

        try {
            const res = await axios.get("/statistics/category-sales", {
                params: filters
            });
            setData(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filters]);

    return (
        <div className="p-4">
            <h4 className="mb-3">Продажи по категориям</h4>

            <StatisticsFilter filters={filters} onChange={setFilters} />

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <>
                    <Card className="mb-4">
                        <Card.Body style={{ height: "420px" }}>
                            <ResponsiveContainer>
                                <BarChart data={data}>
                                    <XAxis dataKey="category"/>
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="totalRevenue" fill="#fd7e14" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header>Таблица категорий</Card.Header>
                        <Card.Body>
                            <Table striped hover>
                                <thead>
                                <tr>
                                    <th>Категория</th>
                                    <th>Продано</th>
                                    <th>Доход</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.map((row, i) => (
                                    <tr key={i}>
                                        <td>{row.category}</td>
                                        <td>{row.totalSold}</td>
                                        <td>{row.totalRevenue} ₽</td>
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

export default CategorySalesDetails;
