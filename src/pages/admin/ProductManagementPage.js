import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { getBasePath } from '../../utils/basePath';
import { getImageUrl } from '../../utils/image';
import '../../styles/custom.css';

export default function ProductManagementPage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [minPriceFilter, setMinPriceFilter] = useState('');
    const [maxPriceFilter, setMaxPriceFilter] = useState('');
    const [minStockFilter, setMinStockFilter] = useState('');
    const [maxStockFilter, setMaxStockFilter] = useState('');

    const [sortField, setSortField] = useState('');
    const [sortDir, setSortDir] = useState('asc');

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const pageSize = 12;
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');

    useEffect(() => {
        axios.get('/ref/product-categories')
            .then(res => setCategories(res.data))
            .catch(() => setCategories([]));
    }, []);

    const load = () => {
        const request = {
            page: page -1,
            size: pageSize,
            categoryId: categoryFilter ? Number(categoryFilter) : null,
            minPrice: minPriceFilter ? Number(minPriceFilter) : null,
            maxPrice: maxPriceFilter ? Number(maxPriceFilter) : null,
            minStockLevel: minStockFilter ? Number(minStockFilter) : null,
            maxStockLevel: maxStockFilter ? Number(maxStockFilter) : null,
            sortBy: sortField || null,
            sortDirection: sortDir || "asc",
            search: search?.trim() || null,
            filters: null
        };

        axios.post('/products/paged', request)
            .then(res => {
                setProducts(res.data);
                setTotalPages(Math.ceil(res.data.length / pageSize));
            })
            .catch(console.error);
    };


    useEffect(() => {
        const timeout = setTimeout(() => {
            if ((minPriceFilter && Number(minPriceFilter) < 0) || (maxPriceFilter && Number(maxPriceFilter) < 0)) {
                alert("Введите корректные значения цен (неотрицательные числа)");
                return;
            }
            if (minPriceFilter && maxPriceFilter && Number(minPriceFilter) > Number(maxPriceFilter)) {
                alert("Мин. цена не может быть больше макс. цены");
                return;
            }
            load();
        }, 500);

        return () => clearTimeout(timeout);
    }, [search, categoryFilter, minPriceFilter, maxPriceFilter, minStockFilter, maxStockFilter, sortField, sortDir, page]);


    const isIncomplete = product => !product.name?.trim() || product.price == null || !product.unitId || !product.categoryId;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <input
                    className="form-control w-50"
                    placeholder="Поиск по названию"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(0); }}
                />
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-dark"
                            onClick={() => navigate(`${getBasePath(roles)}/products/create`)}>
                        Добавить продукт
                    </button>
                    <button className="btn btn-warning" onClick={() => setShowFilters(v => !v)}>
                        {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="card p-3 mb-3">
                    <div className="row g-3">
                        <div className="col-sm">
                            <select
                                className="form-select"
                                value={categoryFilter}
                                onChange={e => { setCategoryFilter(e.target.value); setPage(0); }}
                            >
                                <option value="">Все категории</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="col-sm">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Мин. цена"
                                value={minPriceFilter}
                                onChange={e => { setMinPriceFilter(e.target.value); setPage(1); }}
                                min="0"
                            />
                        </div>

                        <div className="col-sm">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Макс. цена"
                                value={maxPriceFilter}
                                onChange={e => { setMaxPriceFilter(e.target.value); setPage(0); }}
                                min="0"
                            />
                        </div>

                        <div className="col-sm">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Мин. остаток"
                                value={minStockFilter}
                                onChange={e => { setMinStockFilter(e.target.value); setPage(0); }}
                                min="0"
                            />
                        </div>

                        <div className="col-sm">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Макс. остаток"
                                value={maxStockFilter}
                                onChange={e => { setMaxStockFilter(e.target.value); setPage(0); }}
                                min="0"
                            />
                        </div>

                        <div className="col-sm">
                            <select
                                className="form-select"
                                value={`${sortField}_${sortDir}`}
                                onChange={e => {
                                    const [f, d] = e.target.value.split('_');
                                    setSortField(f !== '_' ? f : null);
                                    setSortDir(d || 'asc');
                                }}
                            >
                                <option value="_">Без сортировки</option>
                                <option value="name_asc">Название ↑</option>
                                <option value="name_desc">Название ↓</option>
                                <option value="price_asc">Цена ↑</option>
                                <option value="price_desc">Цена ↓</option>
                                <option value="stockQuantity_asc">Остаток ↑</option>
                                <option value="stockQuantity_desc">Остаток ↓</option>
                                <option value="createdAt_asc">Дата создания ↑</option>
                                <option value="createdAt_desc">Дата создания ↓</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <div className="row">
                {products.map(p => (
                    <div
                        key={p.id}
                        className="col-sm-6 col-md-4 col-lg-3 mb-4"
                        onClick={() => navigate(`${getBasePath(roles)}/products/${p.id}`)}
                        style={{cursor: 'pointer'}}
                    >
                        <div
                            className={`card h-100 shadow-sm text-center p-3 align-items-center ${isIncomplete(p) ? 'border-warning border-3' : ''}`}>
                            <img
                                src={getImageUrl(p.imagePath)}
                                alt={p.name}
                                className="mb-2"
                                style={{width: 120, height: 120, objectFit: 'contain'}}
                            />
                            <h5>{p.name}</h5>
                            <p className="text-muted">{p.categoryName || '-'}</p>
                            <p><b>{p.price?.toFixed(2) ?? '-'}р.</b> {p.unitName}</p>
                        </div>
                    </div>
                ))}
            </div>

            <nav>
                <ul className="pagination justify-content-center">
                    {Array.from({length: totalPages}, (_, i) => (
                        <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                            <button className="page-link bg-warning text-black" onClick={() => setPage(i)}>
                                {i + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
