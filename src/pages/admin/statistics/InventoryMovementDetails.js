import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Card, Table, Spinner } from "react-bootstrap";
import StatisticsFilter from "../../../components/statistics/StatisticsFilter";
import {useLocation, useNavigate} from "react-router-dom";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const InventoryMovementDetails = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    const initialProductId = query.get("productId") || "";
    const initialCategoryId = query.get("categoryId") || "";

    const [filters, setFilters] = useState({
        startDate: "2022-01-01",
        endDate: "2030-01-01",
        limit: 200,
        productId: initialProductId,
        categoryId: initialCategoryId
    });

    const [data, setData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = {
                startDate: filters.startDate,
                endDate: filters.endDate,
                limit: filters.limit,
            };

            if (filters.productId) params.productId = filters.productId;
            if (filters.categoryId) params.categoryId = filters.categoryId;

            const res = await axios.get("/statistics/inventory-movement-details", { params });
            setData(res.data);

            const map = {};

            const incomingTypes = ["INCOME", "RETURN_TO_STOCK"];
            const outgoingTypes = ["OUTCOME", "RESERVE_IN_CART"];

            res.data.forEach(row => {
                const date = row.movementDate;

                if (!map[date]) {
                    map[date] = { period: date, incoming: 0, outgoing: 0 };
                }
                if (incomingTypes.includes(row.movementType)) {
                    map[date].incoming += row.quantity;
                }
                else if (outgoingTypes.includes(row.movementType)) {
                    map[date].outgoing += Math.abs(row.quantity);
                }
                else if (row.movementType === "ADJUSTMENT") {
                    if (row.quantity >= 0) map[date].incoming += row.quantity;
                    else map[date].outgoing += Math.abs(row.quantity);
                }
            });

            setChartData(Object.values(map));

        } catch (e) {
            console.error("Ошибка загрузки деталей движения:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filters]);

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="m-0">Движение товаров — подробности</h4>

                <button
                    className="btn btn-outline-dark"
                    onClick={() => navigate(-1)}
                >
                    ← Назад
                </button>
            </div>

            <StatisticsFilter filters={filters} onChange={setFilters}/>

            {loading ? (
                <Spinner/>
            ) : (
                <>
                    <Card className="mb-4">
                        <Card.Header>График движения товара</Card.Header>
                        <Card.Body style={{height: "350px"}}>
                            <ResponsiveContainer>
                                <LineChart data={chartData.toReversed()}>
                                    <XAxis dataKey="period"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Line
                                        type="monotone"
                                        dataKey="incoming"
                                        stroke="#198754"
                                        strokeWidth={2}
                                        name="Приход"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="outgoing"
                                        stroke="#dc3545"
                                        strokeWidth={2}
                                        name="Расход"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Body>
                            <Table striped hover responsive>
                                <thead>
                                <tr>
                                    <th>Дата</th>
                                    <th>Товар</th>
                                    <th>Тип</th>
                                    <th>Кол-во</th>
                                    <th>Комментарий</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.map((row) => (
                                    <tr key={row.movementId}>
                                        <td>{row.movementDate}</td>
                                        <td>{row.productName}</td>
                                        <td>{row.movementType}</td>
                                        <td>{row.quantity}</td>
                                        <td>{row.comment}</td>
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

export default InventoryMovementDetails;
