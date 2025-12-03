import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Card, Spinner, Table } from "react-bootstrap";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { useParams } from "react-router-dom";
import StatisticsFilter from "../../../components/statistics/StatisticsFilter";

const ProductSeasonalityDetails = () => {
    const { id } = useParams();
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
            const params = {
                ...filters,
            };

            const res = await axios.get(`/statistics/product/${id}/seasonality`, { params });
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
            <h4 className="mb-3">Сезонность продаж товара</h4>

            <StatisticsFilter filters={filters} onChange={setFilters} />

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <>
                    <Card className="mb-4">
                        <Card.Body style={{ height: "420px" }}>
                            <ResponsiveContainer>
                                <LineChart data={data}>
                                    <XAxis dataKey="period" tick={false}/>
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="totalSold"
                                        stroke="#0d6efd"
                                        strokeWidth={2}
                                        name="Продано"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="totalRevenue"
                                        stroke="#198754"
                                        strokeWidth={2}
                                        name="Доход"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header>Таблица сезонности</Card.Header>
                        <Card.Body>
                            <Table striped hover>
                                <thead>
                                <tr>
                                    <th>Период</th>
                                    <th>Продано</th>
                                    <th>Доход</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.period}</td>
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

export default ProductSeasonalityDetails;
