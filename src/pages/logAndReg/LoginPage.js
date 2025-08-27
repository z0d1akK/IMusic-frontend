import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/auth';
import '../../styles/custom.css';

const LoginPage = () => {
    const [form, setForm] = useState({ username: '', password: '' });
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);

        try {
            const { token, roles } = await login(form);
            localStorage.setItem('username', form.username);
            if (roles.includes('ADMIN')) navigate('/admin');
            else if (roles.includes('MANAGER')) navigate('/manager');
            else if (roles.includes('CLIENT')) navigate('/client');
            else navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Ошибка входа';
            setErrorMessage(msg);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center mt-5">
            <div className="card shadow p-4" style={{ width: '100%', maxWidth: '420px' }}>
                <h3 className="text-center mb-4">Вход в систему</h3>

                {errorMessage && (
                    <div className="alert alert-danger" role="alert">{errorMessage}</div>
                )}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="mb-3">
                        <label className="form-label">Логин</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Пароль</label>
                        <input
                            type="password"
                            className="form-control"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-dark w-100">Войти</button>
                </form>

                <div className="mt-3 text-center">
                    Нет аккаунта? <Link className="text-warning" to="/register">Зарегистрируйтесь</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
