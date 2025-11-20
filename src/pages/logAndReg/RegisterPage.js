import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/auth';
import '../../styles/custom.css';

const RegisterPage = () => {
    const [form, setForm] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        email: '',
    });
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(null);
        localStorage.clear();

        if (form.password !== form.confirmPassword) {
            setErrorMessage('Пароли не совпадают');
            return;
        }

        try {
            const { roles } = await register(form);
            localStorage.setItem('username', form.username);

            if (roles.includes('ADMIN')) navigate('/admin');
            else if (roles.includes('MANAGER')) navigate('/manager');
            else navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Ошибка регистрации';
            setErrorMessage(msg);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center mt-5">
            <div className="card shadow p-4" style={{ width: '100%', maxWidth: '500px' }}>
                <h3 className="text-center mb-4">Регистрация</h3>

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
                    <div className="mb-3">
                        <label className="form-label">Повторите пароль</label>
                        <input
                            type="password"
                            className="form-control"
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">ФИО</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-dark w-100">Зарегистрироваться</button>
                </form>

                <div className="mt-3 text-center">
                    Уже есть аккаунт? <Link className="text-warning" to="/login">Войдите</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
