import React from 'react';
import { Link } from 'react-router-dom';

const ManagerHome = () => {
    return (
        <div className="container mt-5">
            <h1>Панель менеджера</h1>
            <div className="mt-3">
                <Link to="/manager/products" className="btn btn-primary me-2">Каталог</Link>
                <Link to="/orders/management" className="btn btn-success me-2">Заказы</Link>
                <Link to="/manager/clients" className="btn btn-secondary">Клиенты</Link>
            </div>
        </div>
    );
};

export default ManagerHome;
