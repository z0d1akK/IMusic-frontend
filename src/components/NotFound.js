import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
    <div className="container text-center mt-5">
        <h1>404</h1>
        <p>Страница не найдена</p>
        <Link to="/" className="btn btn-warning">На главную</Link>
    </div>
);

export default NotFound;
