import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { getAvatarUrl } from '../../utils/avatar';
import '../../styles/custom.css';

export default function UserManagementPage() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [statuses, setStatuses] = useState([]);

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [sortField, setSortField] = useState('');
    const [sortDir, setSortDir] = useState('asc');

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        axios.get('/ref/roles').then(res => setRoles(res.data));
        axios.get('/ref/user-statuses').then(res => setStatuses(res.data));
    }, []);

    const loadUsers = () => {
        const requestBody = {
            page: page - 1,
            size,
            username: search || null,
            email: null,
            roleId: roleFilter ? Number(roleFilter) : null,
            statusId: statusFilter ? Number(statusFilter) : null,
            sortBy: sortField || null,
            sortDirection: sortDir || null,
            filters: []
        };

        axios.post('/users/paged', requestBody)
            .then(res => {
                setUsers(res.data);
                setTotalPages(Math.ceil(res.data.length / size));
            })
            .catch(console.error);
    };

    useEffect(() => {
        const timeout = setTimeout(() => loadUsers(), 300);
        return () => clearTimeout(timeout);
    }, [search, roleFilter, statusFilter, sortField, sortDir, page]);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between">
                <input
                    className="form-control mb-3 w-50"
                    placeholder="Поиск (логин, email...)"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button
                    className="btn btn-warning mb-3"
                    onClick={() => setShowFilters(v => !v)}>
                    {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                </button>
            </div>

            {showFilters && (
                <div className="card p-3 mb-3">
                    <div className="row g-3">
                        <div className="col-sm">
                            <select className="form-select" value={roleFilter}
                                    onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
                                <option value="">Все роли</option>
                                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div className="col-sm">
                            <select className="form-select" value={statusFilter}
                                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                                <option value="">Все статусы</option>
                                {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-sm">
                            <select className="form-select" value={`${sortField}_${sortDir}`}
                                    onChange={e => {
                                        const [f, d] = e.target.value.split('_');
                                        setSortField(f === '_' ? '' : f);
                                        setSortDir(d);
                                        setPage(1);
                                    }}>
                                <option value="_">Без сортировки</option>
                                <option value="username_asc">Логин ↑</option>
                                <option value="username_desc">Логин ↓</option>
                                <option value="fullName_asc">Имя ↑</option>
                                <option value="fullName_desc">Имя ↓</option>
                                <option value="email_asc">Email ↑</option>
                                <option value="email_desc">Email ↓</option>
                                <option value="roleName_asc">Роль ↑</option>
                                <option value="roleName_desc">Роль ↓</option>
                                <option value="statusName_asc">Статус ↑</option>
                                <option value="statusName_desc">Статус ↓</option>
                                <option value="createdAt_asc">Дата регистрации ↑</option>
                                <option value="createdAt_desc">Дата регистрации ↓</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <div className="row">
                {users.map(u => (
                    <div key={u.id} className="col-sm-6 col-md-4 col-lg-3 mb-4"
                         onClick={() => navigate(`/admin/users/${u.id}`)}
                         style={{cursor: 'pointer'}}>
                        <div className="card h-100 shadow-sm text-center p-3 align-items-center">
                            <img src={getAvatarUrl(u.avatarPath)} alt="avatar"
                                 className="rounded-circle mb-2" style={{width:80, height:80, objectFit:'cover'}} />
                            <h5>{u.fullName}</h5>
                            <p className="text-muted">{u.username}</p>
                            <p>{u.email}</p>
                            <p className="fw-bold">{u.roleName}</p>
                            {u.isBlocked && !u.isDeleted && <span className="badge bg-warning text-black">Заблокирован</span>}
                            {u.isDeleted && <span className="badge bg-danger">Удален</span>}
                        </div>
                    </div>
                ))}
            </div>

            <nav>
                <ul className="pagination justify-content-center">
                    {Array.from({length: totalPages}, (_,i) => (
                        <li key={i} className={`page-item ${page===i+1?'active':''}`}>
                            <button className="page-link bg-warning text-black" onClick={() => setPage(i+1)}>
                                {i+1}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
