import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { getAvatarUrl } from '../utils/avatar';


const EditProfilePage = () => {
    const [user, setUser] = useState({ fullName: "", email: "", username: "", avatarPath: null });
    const [loading, setLoading] = useState(true);

    const [loginData, setLoginData] = useState({ currentLogin: "", newLogin: "" });
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        axios.get(`/users/${userId}`)
            .then(res => {
                setUser(res.data);
                setLoginData({ currentLogin: res.data.username, newLogin: "" });
                setAvatarPreview(res.data.avatarPath || null);
            })
            .catch(err => {
                console.error(err);
                alert("Ошибка загрузки профиля");
            })
            .finally(() => setLoading(false));
    }, [userId]);

    const handleChange = (setter) => (e) => {
        const { name, value } = e.target;
        setter(prev => ({ ...prev, [name]: value }));
    };

    const handleBack = () => {
        if (!window.confirm("Выйти с окна редактирования? Несохранённые изменения будут потеряны.")) return;
        if (user.role === "CLIENT") navigate("/client");
        else if (user.role === "MANAGER") navigate("/manager");
        else if (user.role === "ADMIN") navigate("/admin");
        else navigate("/");
    };

    const handleLogout = () => {
        localStorage.clear();
        delete axios.defaults.headers.common["Authorization"];
        navigate("/login");
    };

    const handleSubmitProfile = (e) => {
        e.preventDefault();
        if (!user.fullName || user.fullName.trim().length < 3) return alert("ФИО должно содержать минимум 3 символа");
        if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) return alert("Введите корректный email");

        axios.put(`/users/${userId}/profile`, user)
            .then(() => alert("Профиль обновлён"))
            .catch(() => alert("Ошибка обновления профиля"));
    };

    const handleSubmitLogin = (e) => {
        e.preventDefault();
        const newLogin = loginData.newLogin.trim();
        if (!newLogin || newLogin.length < 4) return alert("Новый логин должен содержать минимум 4 символа");

        axios.put(`/users/${userId}/change-login`, loginData)
            .then(() => {
                alert("Логин успешно изменён. Пожалуйста, войдите заново.");
                handleLogout();
            })
            .catch(err => alert(err.response?.data?.message || "Ошибка смены логина"));
    };

    const handleSubmitPassword = (e) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmNewPassword } = passwordData;
        if (!currentPassword || !newPassword || !confirmNewPassword) return alert("Заполните все поля для смены пароля");
        if (newPassword.length < 6) return alert("Новый пароль должен содержать минимум 6 символов");
        if (newPassword !== confirmNewPassword) return alert("Новый пароль и подтверждение не совпадают");

        axios.put(`/users/${userId}/change-password`, { currentPassword, newPassword, confirmPassword: confirmNewPassword })
            .then(() => {
                alert("Пароль успешно изменён. Пожалуйста, войдите заново.");
                handleLogout();
            })
            .catch(err => alert(err.response?.data?.message || "Ошибка смены пароля"));
    };

    const togglePasswordVisibility = (field) => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadAvatar = () => {
        if (!avatarFile) return alert("Выберите файл для загрузки");
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        axios.post(`/users/${userId}/avatar`, formData, { headers: { "Content-Type": "multipart/form-data" } })
            .then(() => {
                alert("Аватар успешно загружен");
                axios.get(`/users/${userId}`).then(res => {
                    setUser(res.data);
                    setAvatarPreview(res.data.avatarPath || null);
                    setAvatarFile(null);
                });
            })
            .catch(err => alert(err.response?.data?.message || "Ошибка загрузки аватара"));
    };

    if (loading) return <div className="container mt-5">Загрузка...</div>;

    return (
        <div className="container mt-4">
            <div className="card shadow mb-4">
                <div className="card-header"><h4>Редактирование профиля</h4></div>
                <div className="card-body">
                    <form onSubmit={handleSubmitProfile}>
                        <div className="mb-3 text-center">
                            <img
                                src={getAvatarUrl(avatarPreview)}
                                alt="avatar"
                                className="rounded-circle"
                                style={{ width: 120, height: 120, objectFit: "cover" }}
                            />
                            <input type="file" accept="image/*" className="form-control my-2" onChange={handleAvatarChange} />
                            <button type="button" className="btn btn-warning" onClick={handleUploadAvatar} disabled={!avatarFile}>Загрузить фото</button>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">ФИО</label>
                            <input type="text" className="form-control" name="fullName" value={user.fullName} onChange={handleChange(setUser)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-control" name="email" value={user.email} onChange={handleChange(setUser)} required />
                        </div>

                        <div className="d-flex justify-content-between">
                            <button type="button" className="btn btn-outline-dark" onClick={handleBack}>Отмена</button>
                            <button type="submit" className="btn btn-warning">Сохранить</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card shadow mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Сменить логин</h5>
                    <button className="btn btn-sm btn-outline-warning" onClick={() => setShowLoginForm(prev => !prev)}>
                        {showLoginForm ? "Скрыть" : "Показать"}
                    </button>
                </div>
                {showLoginForm && (
                    <div className="card-body">
                        <form onSubmit={handleSubmitLogin}>
                            <div className="mb-3">
                                <label className="form-label">Текущий логин</label>
                                <input type="text" className="form-control" name="currentLogin" value={loginData.currentLogin} disabled />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Новый логин</label>
                                <input type="text" className="form-control" name="newLogin" value={loginData.newLogin} onChange={handleChange(setLoginData)} required />
                            </div>
                            <button className="btn btn-warning" type="submit">Изменить логин</button>
                        </form>
                    </div>
                )}
            </div>

            <div className="card shadow">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Сменить пароль</h5>
                    <button className="btn btn-sm btn-outline-warning" onClick={() => setShowPasswordForm(prev => !prev)}>
                        {showPasswordForm ? "Скрыть" : "Показать"}
                    </button>
                </div>
                {showPasswordForm && (
                    <div className="card-body">
                        <form onSubmit={handleSubmitPassword}>
                            {[
                                { label: "Текущий пароль", name: "currentPassword", visible: showPasswords.current },
                                { label: "Новый пароль", name: "newPassword", visible: showPasswords.new },
                                { label: "Подтвердите новый пароль", name: "confirmNewPassword", visible: showPasswords.confirm },
                            ].map(({ label, name, visible }) => (
                                <div className="mb-3" key={name}>
                                    <label className="form-label">{label}</label>
                                    <div className="input-group">
                                        <input
                                            type={visible ? "text" : "password"}
                                            className="form-control"
                                            name={name}
                                            value={passwordData[name]}
                                            onChange={handleChange(setPasswordData)}
                                            required
                                        />
                                        <button type="button" className="btn btn-outline-warning" onClick={() => togglePasswordVisibility(name === "currentPassword" ? "current" : name === "newPassword" ? "new" : "confirm")}>
                                            {visible ? "Скрыть" : "Показать"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button className="btn btn-warning" type="submit">Изменить пароль</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditProfilePage;
