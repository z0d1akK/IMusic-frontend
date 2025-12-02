import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import StatisticsFilter from "../statistics/StatisticsFilter";
import axiosInstance from "../../api/axiosInstance";
import { downloadReport } from "../../utils/reportDownload";

const ReportModal = ({ show, onClose, role, managerId }) => {

    const [reportType, setReportType] = useState("");
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        groupBy: "month",
        managerId: managerId || ""
    });

    const [managers, setManagers] = useState([]);
    const [managerSearch, setManagerSearch] = useState("");

    useEffect(() => {
        if (show) {
            resetForm();
            if (role === "ADMIN") fetchManagers();
        }
    }, [show]);

    const resetForm = () => {
        setReportType("");
        setFilters({
            startDate: "",
            endDate: "",
            groupBy: "month",
            managerId: managerId || ""
        });
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

    const requireDates = ["admin_sales", "manager_sales", "manager_top_clients", "manager_top_products"];
    const requireManager = ["manager_sales", "manager_top_clients", "manager_top_products"];
    const allowGroupBy = ["admin_sales", "manager_sales"];

    const onGenerate = async () => {

        if (!reportType) return alert("Выберите тип отчёта!");

        if (requireDates.includes(reportType)) {
            if (!filters.startDate || !filters.endDate)
                return alert("Выберите дату начала и конца периода!");
        }

        if (role === "ADMIN" && requireManager.includes(reportType)) {
            if (!filters.managerId) return alert("Выберите менеджера!");
        }

        let url = "";
        let filename = "";

        switch (reportType) {
            case "manager_sales":
                url = `/reports/manager/${filters.managerId}/sales`
                    + `?startDate=${filters.startDate}&endDate=${filters.endDate}&groupBy=${filters.groupBy}`;
                filename = "manager_sales_report.pdf";
                break;

            case "manager_top_clients":
                url = `/reports/manager/${filters.managerId}/top-clients`
                    + `?startDate=${filters.startDate}&endDate=${filters.endDate}`;
                filename = "manager_top_clients.pdf";
                break;

            case "manager_top_products":
                url = `/reports/manager/${filters.managerId}/top-products`
                    + `?startDate=${filters.startDate}&endDate=${filters.endDate}`;
                filename = "manager_top_products.pdf";
                break;

            case "admin_sales":
                url = `/reports/admin/sales`
                    + `?startDate=${filters.startDate}&endDate=${filters.endDate}&groupBy=${filters.groupBy}`;
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
                                <option value="manager_sales">Продажи конкретного менеджера</option>
                                <option value="manager_top_clients">Топ клиентов менеджера</option>
                                <option value="manager_top_products">Топ товаров менеджера</option>
                            </>
                        )}
                    </Form.Select>
                </Form.Group>

                {requireDates.includes(reportType) && (
                    <StatisticsFilter filters={filters} onChange={setFilters} />
                )}

                {allowGroupBy.includes(reportType) && (
                    <Form.Group className="mt-3">
                        <Form.Label>Группировка</Form.Label>
                        <Form.Select
                            value={filters.groupBy}
                            onChange={e => setFilters(prev => ({ ...prev, groupBy: e.target.value }))}
                        >
                            <option value="day">По дням</option>
                            <option value="month">По месяцам</option>
                            <option value="year">По годам</option>
                        </Form.Select>
                    </Form.Group>
                )}

                {role === "ADMIN" && requireManager.includes(reportType) && (
                    <>
                        <Form.Group className="mt-3">
                            <Form.Label>Поиск менеджера</Form.Label>
                            <Form.Control
                                value={managerSearch}
                                onChange={e => setManagerSearch(e.target.value)}
                                placeholder="Введите имя"
                            />
                        </Form.Group>

                        <Form.Group className="mt-3">
                            <Form.Label>Менеджер</Form.Label>
                            <Form.Select
                                value={filters.managerId}
                                onChange={e =>
                                    setFilters(prev => ({ ...prev, managerId: e.target.value }))
                                }
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
                <Button variant="secondary" onClick={onClose} disabled={loading}>Отмена</Button>
                <Button variant="warning" onClick={onGenerate} disabled={loading}>
                    {loading ? "Формирование..." : "Сформировать"}
                </Button>
            </Modal.Footer>

        </Modal>
    );
};

export default ReportModal;
