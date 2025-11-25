import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { Card, Spinner } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import StatisticsFilter from "../../../components/statistics/StatisticsFilter"

const ManagerProductsDetails = () => {
    const managerId = localStorage.getItem("userId");

    const [topProducts, setTopProducts] = useState([]);
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
                `/statistics/manager/${managerId}/top-products?${params}`
            );

            setTopProducts(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [filters]);

    return (
        <div className="p-4">
            <h4>Мои топовые товары</h4>

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
                            <BarChart data={topProducts}>
                                <XAxis dataKey="productName" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="totalRevenue" fill="#198754" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default ManagerProductsDetails;
