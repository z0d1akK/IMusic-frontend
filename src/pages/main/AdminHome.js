import React from 'react';
import { Link } from 'react-router-dom';

const AdminHome = () => {
    return (
        <div className="container mt-5">
            <h1>Панель администратора</h1>
            <div className="mt-3">
                <Link to="/admin/products" className="btn btn-primary me-2">Каталог</Link>
                <Link to="/orders/management" className="btn btn-success me-2">Заказы</Link>
                <Link to="/admin/clients" className="btn btn-secondary me-2">Клиенты</Link>
                <Link to="/admin/users" className="btn btn-warning">Пользователи</Link>
            </div>
        </div>
    );
};

export default AdminHome;
