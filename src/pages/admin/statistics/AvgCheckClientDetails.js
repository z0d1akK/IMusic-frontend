import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Card, Spinner, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import StatisticsFilter from "../../../components/statistics/StatisticsFilter";

const AvgCheckClientDetails = () => {
    const { clientId } = useParams();

    const [filters, setFilters] = useState({
        startDate: "2022-01-01",
        endDate: "2030-01-01",
        limit: 200
    });

    const [orders, setOrders] = useState([]);
    const [avgCheck, setAvgCheck] = useState(0);
    const [clientName, setClientName] = useState("");
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);

        try {
            const res = await axios.get(
                `/statistics/avg-check/${clientId}/details`,
                { params: filters }
            );

            setAvgCheck(res.data.avgCheck);
            setOrders(res.data.orders);
            setClientName(res.data.clientName);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [filters]);

    return (
        <div className="p-4">
            <h4 className="mb-3">
                Детализация среднего чека — {clientName} (ID: {clientId})
            </h4>

            <StatisticsFilter filters={filters} onChange={setFilters} />

            {loading ? <Spinner /> : (
                <>
                    <Card className="mb-4">
                        <Card.Body>
                            <h5>Средний чек: {avgCheck} ₽</h5>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header>Заказы клиента</Card.Header>
                        <Card.Body>
                            <Table striped hover responsive>
                                <thead>
                                <tr>
                                    <th>ID заказа</th>
                                    <th>Дата</th>
                                    <th>Сумма</th>
                                    <th>Статус</th>
                                </tr>
                                </thead>
                                <tbody>
                                {orders.map(o => (
                                    <tr key={o.orderId}>
                                        <td>{o.orderId}</td>
                                        <td>{o.orderDate?.split("T")[0]}</td>
                                        <td>{o.totalPrice} ₽</td>
                                        <td>{o.status}</td>
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

export default AvgCheckClientDetails;
