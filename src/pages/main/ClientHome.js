import React from 'react';
import { Link } from 'react-router-dom';

const ClientHome = () => {
    return (
        <div className="container mt-5">
            <h1>Добро пожаловать, клиент!</h1>
            <div className="mt-3">
                <Link to="/catalog" className="btn btn-primary me-2">Каталог</Link>
                <Link to="/client/cart" className="btn btn-secondary me-2">Корзина</Link>
                <Link to="/client/orders" className="btn btn-success">Мои заказы</Link>
            </div>
        </div>
    );
};

export default ClientHome;
