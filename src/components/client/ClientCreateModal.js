import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosInstance';

const ClientCreateModal = ({ isOpen, onClose, onSaveSuccess }) => {
    const [client, setClient] = useState({
        companyName: '',
        inn: '',
        email: '',
        phone: '',
        contactPerson: '',
        address: '',
        userId: '',
    });

    const [query, setQuery] = useState('');
    const [clientUsers, setClientUsers] = useState([]);

    useEffect(() => {
        if (!isOpen) return;
        const delayDebounce = setTimeout(() => {
                fetchClientUsers(query);
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [query, isOpen]);

    const fetchClientUsers = async (search) => {
        try {
            const response = await axios.get('/users/clients/available', {
                params: { query: search }
            });
            setClientUsers(response.data);
        } catch (err) {
            console.error(err);
            alert('Ошибка при загрузке пользователей');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClient(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!client.userId) return 'Выберите пользователя';
        if (!client.companyName || client.companyName.trim().length < 3)
            return 'Название компании должно содержать минимум 3 символа';
        if (!client.inn || client.inn.trim().length < 6)
            return 'ИНН должен содержать минимум 6 символов';
        if (!client.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email))
            return 'Введите корректный email';
        if (!client.phone || client.phone.trim().length < 6)
            return 'Введите корректный номер телефона';
        if (!client.contactPerson || client.contactPerson.trim().length < 3)
            return 'Контактное лицо должно содержать минимум 3 символа';
        if (!client.address || client.address.trim().length < 6)
            return 'Адрес должен содержать минимум 6 символов';
        return null;
    };

    const handleSave = async () => {
        const error = validateForm();
        if (error) {
            alert(error);
            return;
        }

        try {
            await axios.post('/clients', client);
            alert('Клиент успешно создан');
            onSaveSuccess && onSaveSuccess();
            onClose && onClose();
        } catch (err) {
            console.error(err);
            alert('Ошибка при создании клиента');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Создание нового клиента</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Поиск пользователя (логин / email)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Введите логин или email"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Пользователь</label>
                            <select
                                name="userId"
                                className="form-select"
                                value={client.userId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Выберите пользователя --</option>
                                {clientUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.username} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Компания</label>
                            <input
                                name="companyName"
                                className="form-control"
                                value={client.companyName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">ИНН</label>
                            <input
                                name="inn"
                                className="form-control"
                                value={client.inn}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                name="email"
                                type="email"
                                className="form-control"
                                value={client.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Телефон</label>
                            <input
                                name="phone"
                                className="form-control"
                                value={client.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Контактное лицо</label>
                            <input
                                name="contactPerson"
                                className="form-control"
                                value={client.contactPerson}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Адрес</label>
                            <input
                                name="address"
                                className="form-control"
                                value={client.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
                        <button type="button" className="btn btn-warning" onClick={handleSave} disabled={!client.userId}>
                            Создать
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientCreateModal;
