import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";

const statusLabels = {
    ACTIVE: "Активен",
    BLOCKED: "Заблокирован",
    DELETED: "Удалён",
};

const validateClient = (client) => {
    const requiredFields = [
        { key: "companyName", name: "Компания", min: 3 },
        { key: "inn", name: "ИНН", min: 6 },
        { key: "email", name: "Email", min: 6, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        { key: "phone", name: "Телефон", min: 6 },
        { key: "contactPerson", name: "Контактное лицо", min: 3 },
        { key: "address", name: "Адрес", min: 6 },
    ];

    for (const field of requiredFields) {
        const value = (client[field.key] || "").trim();
        if (value.length < field.min) {
            return `Поле "${field.name}" должно содержать минимум ${field.min} символов`;
        }
        if (field.pattern && !field.pattern.test(value)) {
            return `Поле "${field.name}" имеет некорректный формат`;
        }
    }
    return null;
};

const ClientEditModal = ({ isOpen, onClose, clientId, onSaveSuccess }) => {
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        axios.get(`/clients/${clientId}`)
            .then(res => setClient(res.data))
            .catch(err => {
                console.error(err);
                alert("Ошибка при загрузке клиента");
                onClose && onClose();
            })
            .finally(() => setLoading(false));
    }, [clientId, isOpen, onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClient(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const error = validateClient(client);
        if (error) return alert(error);

        try {
            await axios.put(`/clients/${clientId}`, client);
            alert("Клиент успешно сохранён");
            onSaveSuccess && onSaveSuccess();
            onClose && onClose();
        } catch (err) {
            console.error(err);
            alert("Ошибка при сохранении клиента");
        }
    };

    const handleDelete = () => {
        if (window.confirm("Удалить клиента безвозвратно?")) {
            axios.delete(`/clients/${clientId}`)
                .then(() => {
                    alert("Клиент удалён");
                    onSaveSuccess && onSaveSuccess();
                    onClose && onClose();
                })
                .catch(err => {
                    console.error(err);
                    alert("Ошибка при удалении");
                });
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return "—";
        }
    };

    if (!isOpen) return null;
    if (loading || !client) return <div className="text-center p-4">Загрузка...</div>;

    return (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Редактирование клиента</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <hr />
                        <div className="mb-3">
                            <label className="form-label">Логин</label>
                            <input className="form-control" value={client.username || "—"} disabled />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Статус</label>
                            <input className="form-control" value={statusLabels[client.statusCode] || "—"} disabled />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Дата создания</label>
                            <input className="form-control" value={formatDate(client.userCreatedAt)} disabled />
                        </div>

                        {["companyName", "inn", "email", "phone", "contactPerson", "address"].map(field => (
                            <div className="mb-3" key={field}>
                                <label className="form-label">{{
                                    companyName: "Компания",
                                    inn: "ИНН",
                                    email: "Email",
                                    phone: "Телефон",
                                    contactPerson: "Контактное лицо",
                                    address: "Адрес"
                                }[field]}</label>
                                <input
                                    name={field}
                                    className="form-control"
                                    type={field === "email" ? "email" : "text"}
                                    value={client[field] || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
                        <button className="btn btn-danger" onClick={handleDelete}>Удалить</button>
                        <button className="btn btn-dark" onClick={handleSave}>Сохранить</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientEditModal;
