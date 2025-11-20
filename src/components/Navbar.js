import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { extractRolesFromToken } from '../utils/jwt';
import axiosInstance from '../api/axiosInstance';
import '../styles/custom.css';

const Navbar = () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const isAuthenticated = !!token;
    const roles = token ? extractRolesFromToken(token) : [];
    const navigate = useNavigate();

    const [hasClientProfile, setHasClientProfile] = useState(false);

    useEffect(() => {
        const fetchClientProfile = async () => {
            if (roles.includes('CLIENT')) {
                try {
                    await axiosInstance.get('/clients/profile', {
                        suppressGlobalErrorHandler: true,
                    });
                    setHasClientProfile(true);
                } catch {
                    setHasClientProfile(false);
                }
            } else {
                setHasClientProfile(false);
            }
        };

        if (token) {
            fetchClientProfile();
        } else {
            setHasClientProfile(false);
        }
    }, [token, roles]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const getPanelPath = () => {
        if (roles.includes('ADMIN')) return '/admin';
        if (roles.includes('MANAGER')) return '/manager';
        return '/';
    };

    const logoLink = isAuthenticated ? getPanelPath() : '/';

    return (
        <nav className="navbar navbar-expand-lg bg-dark navbar-dark px-3 py-2">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold text-light" to={logoLink}>
                    IMusic
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto align-items-center gap-2">

                        {(roles.includes('CLIENT') || !isAuthenticated) && (
                            <li className="nav-item">
                                <Link className="nav-link text-light" to="/catalog">Каталог</Link>
                            </li>
                        )}

                        {(roles.includes('ADMIN') || roles.includes('MANAGER')) && (
                            <li className="nav-item dropdown">
                                <span
                                    className="nav-link dropdown-toggle text-light"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Товары
                                </span>
                                <ul className="dropdown-menu dropdown-menu-dark">
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/${roles.includes('ADMIN') ? 'admin' : 'manager'}/products`}
                                        >
                                            Каталог
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/${roles.includes('ADMIN') ? 'admin' : 'manager'}/product-attributes`}
                                        >
                                            Атрибуты товаров
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            className="dropdown-item"
                                            to={`/${roles.includes('ADMIN') ? 'admin' : 'manager'}/inventory-movement`}
                                        >
                                            Движение товара
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                        )}

                        {roles.includes('ADMIN') && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link text-light" to="/orders/management">Заказы</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-light" to="/admin/clients">Клиенты</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-light" to="/admin/users">Пользователи</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-light" to="/admin/dictionaries">Справочники</Link>
                                </li>
                            </>
                        )}

                        {roles.includes('MANAGER') && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link text-light" to="/orders/management">Заказы</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-light" to="/manager/clients">Клиенты</Link>
                                </li>
                            </>
                        )}

                        {roles.includes('CLIENT') && (
                            <>
                                <li className="nav-item">
                                <Link className="nav-link text-light" to="/client/cart">Корзина</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link text-light" to="/client/orders">Заказы</Link>
                                </li>
                            </>
                        )}

                        {isAuthenticated ? (
                            <li className="nav-item dropdown">
                                <button
                                    className="btn btn-outline-light dropdown-toggle"
                                    id="userDropdown"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {username}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark">
                                    {roles.includes('CLIENT') && hasClientProfile && (
                                        <li>
                                            <Link className="dropdown-item" to="/client/profile">
                                                Профиль клиента
                                            </Link>
                                        </li>
                                    )}
                                    <li>
                                        <Link className="dropdown-item" to="/profile/edit">
                                            Изменить профиль пользователя
                                        </Link>
                                    </li>
                                    <li>
                                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                                            Выйти
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="btn btn-outline-light w-100" to="/login">Вход</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-outline-light w-100" to="/register">Регистрация</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
