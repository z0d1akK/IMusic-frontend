import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import StatisticsFilter from "../statistics/StatisticsFilter";
import axiosInstance from "../../api/axiosInstance";
import { downloadReport } from "../../utils/reportDownload";

const ReportModal = ({ show, onClose, role, managerId }) => {
    const initialFilters = {
        startDate: "",
        endDate: "",
        managerId: managerId || ""
    };

    const [filters, setFilters] = useState(initialFilters);
    const [reportType, setReportType] = useState("");
    const [loading, setLoading] = useState(false);

    const [managers, setManagers] = useState([]);
    const [managerSearch, setManagerSearch] = useState("");

    useEffect(() => {
        if (show) {
            resetForm();
            if (role === "ADMIN") fetchManagers();
        }
    }, [show]);

    const resetForm = () => {
        setFilters(initialFilters);
        setReportType("");
        setManagerSearch("");
        setLoading(false);
    };

    const fetchManagers = async () => {
        try {
            const res = await axiosInstance.post("/users/paged", {
                page: 0,
                size: 1000,
                roleId: 2,
                sortBy: "fullName",
                sortDirection: "ASC"
            });
            setManagers(res.data.content || []);
        } catch (e) {
            console.error("Ошибка загрузки менеджеров", e);
        }
    };

    const filteredManagers = managers.filter(m =>
        m.fullName?.toLowerCase().includes(managerSearch.toLowerCase())
    );

    const onGenerate = async () => {
        if (!reportType) return alert("Выберите тип отчёта!");

        const { startDate, endDate, managerId } = filters;
        let url = "";
        let filename = "report.pdf";

        const requireDates = [
            "manager_sales", "manager_top_clients", "manager_top_products", "admin_sales"
        ];

        const requireManager = [
            "manager_sales", "manager_top_clients", "manager_top_products"
        ];

        if (requireDates.includes(reportType) && (!startDate || !endDate)) {
            return alert("Выберите дату начала и конца периода!");
        }

        if (
            (role === "MANAGER" && requireManager.includes(reportType) && !managerId) ||
            (role === "ADMIN" && reportType.includes("manager") && !managerId)
        ) {
            return alert("Выберите менеджера!");
        }

        switch (reportType) {
            case "manager_sales":
                url = `/reports/manager/${managerId}/sales?startDate=${startDate}&endDate=${endDate}`;
                filename = "manager_sales_report.pdf";
                break;
            case "manager_top_clients":
                url = `/reports/manager/${managerId}/top-clients?startDate=${startDate}&endDate=${endDate}`;
                filename = "manager_top_clients.pdf";
                break;
            case "manager_top_products":
                url = `/reports/manager/${managerId}/top-products?startDate=${startDate}&endDate=${endDate}`;
                filename = "manager_top_products.pdf";
                break;
            case "admin_sales":
                url = `/reports/admin/sales?startDate=${startDate}&endDate=${endDate}`;
                filename = "admin_sales_report.pdf";
                break;
            case "admin_top_managers":
                url = `/reports/admin/top-managers`;
                filename = "admin_top_managers.pdf";
                break;
            case "admin_top_products":
                url = `/reports/admin/top-products`;
                filename = "admin_top_products.pdf";
                break;
            default:
                return;
        }

        setLoading(true);
        await downloadReport(url, filename);
        setLoading(false);
        onClose();
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Сформировать отчёт</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Тип отчёта</Form.Label>
                    <Form.Select
                        value={reportType}
                        onChange={e => setReportType(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Выберите...</option>

                        {role === "MANAGER" && (
                            <>
                                <option value="manager_sales">Мои продажи</option>
                                <option value="manager_top_clients">Мои топ клиенты</option>
                                <option value="manager_top_products">Мои топ товары</option>
                            </>
                        )}

                        {role === "ADMIN" && (
                            <>
                                <option value="admin_sales">Продажи компании</option>
                                <option value="admin_top_managers">Топ менеджеров</option>
                                <option value="admin_top_products">Топ товаров</option>
                            </>
                        )}
                    </Form.Select>
                </Form.Group>

                <StatisticsFilter filters={filters} onChange={setFilters} />

                {role === "ADMIN" && reportType.includes("manager") && (
                    <>
                        <Form.Group className="mt-3">
                            <Form.Label>Поиск менеджера</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Введите имя менеджера"
                                value={managerSearch}
                                onChange={e => setManagerSearch(e.target.value)}
                                disabled={loading}
                            />
                        </Form.Group>

                        <Form.Group className="mt-3">
                            <Form.Label>Менеджер</Form.Label>
                            <Form.Select
                                value={filters.managerId}
                                onChange={e => setFilters(prev => ({
                                    ...prev,
                                    managerId: e.target.value
                                }))}
                                disabled={loading}
                            >
                                <option value="">Выберите менеджера</option>
                                {filteredManagers.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.fullName} ({m.username})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Отмена
                </Button>
                <Button variant="warning" onClick={onGenerate} disabled={loading}>
                    {loading ? "Формирование..." : "Сформировать"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ReportModal;
