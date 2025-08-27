import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from '../../api/axiosInstance';
import { getAvatarUrl } from '../../utils/avatar';


const validateUser = (user) => {
    if (!user.fullName || user.fullName.trim().length < 3) return "Введите ФИО (минимум 3 символа)";
    if (!user.email || user.email.trim().length < 6 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) return "Введите корректный email";
    if (!user.username || user.username.trim().length < 6) return "Введите логин (минимум 6 символов)";
    if (!user.roleId) return "Выберите роль";
    return null;
};

const UserEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(true);

    const isEditingSelf = user?.id === currentUser?.id;

    useEffect(() => {
        setLoading(true);

        Promise.all([
            axios.get('/auth/me'),
            axios.get(`/users/${id}`),
            axios.get('/ref/roles'),
        ])
            .then(([currentUserRes, userRes, rolesRes]) => {
                setCurrentUser(currentUserRes.data);
                setUser(userRes.data);
                setRoles(rolesRes.data);
            })
            .catch((err) => {
                console.error(err);
                alert("Ошибка при загрузке данных");
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const toggleBlock = async () => {
        if (!user || isEditingSelf) return;
        try {
            const action = user.isBlocked ? "unblock" : "block";
            await axios.put(`/users/${id}/${action}`);
            const res = await axios.get(`/users/${id}`);
            setUser(res.data);
        } catch (err) {
            console.error(err);
            alert("Ошибка при изменении статуса блокировки");
        }
    };

    const handleSave = async () => {
        if (!user) return;
        if (isEditingSelf) return alert("Нельзя сохранить самого себя!");

        const error = validateUser(user);
        if (error) return alert(error);

        try {
            const updated = {
                ...user,
                roleId: user.roleId || user.role?.id,
            };

            await axios.put(`/users/${id}`, updated);

            if (avatarFile) {
                const fd = new FormData();
                fd.append("avatar", avatarFile);
                await axios.post(`/users/${id}/avatar`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            alert("Сохранено");
            navigate("/admin/users");
        } catch (err) {
            console.error(err);
            alert("Ошибка при сохранении");
        }
    };

    const handleDelete = () => {
        if (isEditingSelf) return alert("Нельзя удалить самого себя!");

        if (window.confirm("Пометить пользователя как удалённого?")) {
            axios.put(`/users/${id}/delete`)
                .then(() => {
                    alert("Пользователь помечен как удалённый");
                    navigate("/admin/users");
                })
                .catch((err) => {
                    console.error(err);
                    alert("Ошибка при удалении");
                });
        }
    };

    const handleBack = () => {
        if (window.confirm("Выйти с окна редактирования? Несохранённые изменения, за исключением блокировки будут потеряны.")) {
            navigate("/admin/users");
        }
    };

    if (loading || !user || !currentUser) return <div className="text-center p-4">Загрузка...</div>;

    return (
        <div className="container mt-4">
            <div className="card shadow">
                <div className="card-header">
                    <h4>Редактирование пользователя</h4>
                </div>
                <div className="card-body">
                    <div className="text-center mb-3">
                        <img
                            src={getAvatarUrl(user.avatarPath)}
                            alt="avatar"
                            className="rounded-circle"
                            style={{ width: 100, height: 100, objectFit: "cover" }}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Фото профиля</label>
                        <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={(e) => setAvatarFile(e.target.files[0])}
                            disabled={isEditingSelf}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">ФИО</label>
                        <input
                            type="text"
                            name="fullName"
                            className="form-control"
                            value={user.fullName || ""}
                            onChange={handleChange}
                            minLength={3}
                            disabled={isEditingSelf}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={user.email || ""}
                            onChange={handleChange}
                            minLength={6}
                            disabled={isEditingSelf}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Логин</label>
                        <input
                            type="text"
                            name="username"
                            className="form-control"
                            value={user.username || ""}
                            onChange={handleChange}
                            minLength={6}
                            disabled={isEditingSelf}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Роль</label>
                        <select
                            name="roleId"
                            className="form-select"
                            value={user.roleId || ""}
                            onChange={handleChange}
                            disabled={isEditingSelf}
                        >
                            <option value="">Выберите роль</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Статус</label>
                        <input
                            className="form-control"
                            value={
                                user.isDeleted
                                    ? "Удалён"
                                    : user.isBlocked
                                        ? "Заблокирован"
                                        : user.status?.name || "Активен"
                            }
                            disabled
                        />
                    </div>

                    <div className="form-check form-switch mb-4">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="blockedSwitch"
                            checked={user.isBlocked}
                            onChange={toggleBlock}
                            disabled={isEditingSelf}
                        />
                        <label className="form-check-label" htmlFor="blockedSwitch">
                            Заблокирован
                        </label>
                    </div>

                    <div className="d-flex justify-content-between">
                        <button className="btn btn-outline-dark" onClick={handleBack}>Отмена</button>
                        <button className="btn btn-danger" onClick={handleDelete}>Удалить</button>
                        <button className="btn btn-dark" onClick={handleSave}>Сохранить</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserEditPage;