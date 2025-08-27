import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const ClientProfilePage = () => {
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchClientProfile = async () => {
            try {
                const response = await axiosInstance.get('/clients/profile');
                setClient(response.data);
            } catch (err) {
                console.error('Ошибка при загрузке профиля клиента:', err);
                setError('Не удалось загрузить профиль клиента. Обратитесь к менеджеру.');
            } finally {
                setLoading(false);
            }
        };
        fetchClientProfile();
    }, []);

    if (loading) return <div className="container mt-4">Загрузка...</div>;
    if (error) return <div className="container mt-4 text-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Профиль клиента</h2>
            <table className="table table-bordered">
                <tbody>
                <tr>
                    <th>ID</th>
                    <td>{client.id}</td>
                </tr>
                <tr>
                    <th>Название компании</th>
                    <td>{client.companyName}</td>
                </tr>
                <tr>
                    <th>ИНН</th>
                    <td>{client.inn}</td>
                </tr>
                <tr>
                    <th>Телефон</th>
                    <td>{client.phone}</td>
                </tr>
                <tr>
                    <th>Email</th>
                    <td>{client.email}</td>
                </tr>
                <tr>
                    <th>Адрес</th>
                    <td>{client.address}</td>
                </tr>
                <tr>
                    <th>Контактное лицо</th>
                    <td>{client.contactPerson}</td>
                </tr>
                <tr>
                    <th>Дата создания</th>
                    <td>{client.createdAt}</td>
                </tr>
                </tbody>
            </table>
        </div>
    );
};

export default ClientProfilePage;
