import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import '../../styles/custom.css';
import ClientCreateModal from '../../components/client/ClientCreateModal';
import ClientEditModal from '../../components/client/ClientEditModal';

const ClientManagementPage = () => {
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDir, setSortDir] = useState('asc');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [emailFilter, setEmailFilter] = useState('');
    const [phoneFilter, setPhoneFilter] = useState('');
    const [addressFilter, setAddressFilter] = useState('');

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingClientId, setEditingClientId] = useState(null);

    const pageSize = 12;

    const loadClients = () => {
        const requestBody = {
            name: search || null,
            email: emailFilter || null,
            phone: phoneFilter || null,
            address: addressFilter || null,
            page: page,
            size: pageSize,
            sortBy: sortField || null,
            sortDirection: sortField ? sortDir : null,
            filters: []
        };

        axios.post('/clients/paged', requestBody)
            .then(res => {
                setClients(res.data.content || []);
                setTotalPages(res.data.totalPages || 1);
            })
            .catch(console.error);
    };

    useEffect(() => {
        const timeout = setTimeout(() => loadClients(), 300);
        return () => clearTimeout(timeout);
    }, [search, emailFilter, phoneFilter, addressFilter, sortField, sortDir, page]);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center">
                <input
                    className="form-control mb-3 w-50"
                    placeholder="Поиск (название компании)"
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value);
                        setPage(0);
                    }}
                />
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-dark mb-3"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        Добавить клиента
                    </button>
                    <button
                        className="btn btn-warning mb-3"
                        onClick={() => setShowFilters(v => !v)}
                    >
                        {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="card p-3 mb-3">
                    <div className="row g-3">
                        <div className="col-sm">
                            <input
                                className="form-control"
                                placeholder="Email"
                                value={emailFilter}
                                onChange={e => { setEmailFilter(e.target.value); setPage(0); }}
                            />
                        </div>
                        <div className="col-sm">
                            <input
                                className="form-control"
                                placeholder="Телефон"
                                value={phoneFilter}
                                onChange={e => { setPhoneFilter(e.target.value); setPage(0); }}
                            />
                        </div>
                        <div className="col-sm">
                            <input
                                className="form-control"
                                placeholder="Адрес"
                                value={addressFilter}
                                onChange={e => { setAddressFilter(e.target.value); setPage(0); }}
                            />
                        </div>
                        <div className="col-sm">
                            <select
                                className="form-select"
                                value={`${sortField}_${sortDir}`}
                                onChange={e => {
                                    const [f, d] = e.target.value.split('_');
                                    setSortField(f === '_' ? '' : f);
                                    setSortDir(d);
                                    setPage(0);
                                }}
                            >
                                <option value="_">Без сортировки</option>
                                <option value="companyName_asc">Компания ↑</option>
                                <option value="companyName_desc">Компания ↓</option>
                                <option value="email_asc">Email ↑</option>
                                <option value="email_desc">Email ↓</option>
                                <option value="phone_asc">Телефон ↑</option>
                                <option value="phone_desc">Телефон ↓</option>
                                <option value="address_asc">Адрес ↑</option>
                                <option value="address_desc">Адрес ↓</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <div className="row">
                {clients.map(c => (
                    <div key={c.id}
                         className="col-sm-6 col-md-4 col-lg-3 mb-4"
                         onClick={() => { setEditingClientId(c.id); setEditModalOpen(true); }}
                         style={{ cursor: 'pointer' }}>
                        <div className="card h-100 shadow-sm text-center p-3 align-items-center">
                            <div
                                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mb-2"
                                style={{ width: 80, height: 80, fontSize: '1.5rem' }}>
                                {c.companyName ? c.companyName.charAt(0).toUpperCase() : '?'}
                            </div>
                            <h5>{c.companyName}</h5>
                            <p>{c.email}</p>
                            <p>{c.phone}</p>
                            <small className="text-muted">{c.contactPerson}</small>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <nav>
                    <ul className="pagination justify-content-center">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                                <button
                                    className="page-link bg-warning text-black"
                                    onClick={() => setPage(i)}
                                >
                                    {i + 1}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            {createModalOpen && (
                <ClientCreateModal
                    isOpen={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onSaveSuccess={loadClients}
                />
            )}
            {editModalOpen && editingClientId && (
                <ClientEditModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    clientId={editingClientId}
                    onSaveSuccess={loadClients}
                />
            )}
        </div>
    );
};

export default ClientManagementPage;
