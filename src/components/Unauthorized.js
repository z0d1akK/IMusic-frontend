import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
    <div className="container text-center mt-5">
        <h2>Доступ запрещён</h2>
        <p>У вас нет прав для просмотра этой страницы.</p>
        <Link to="/" className="btn btn-warning">На главную</Link>
    </div>
);

export default Unauthorized;
