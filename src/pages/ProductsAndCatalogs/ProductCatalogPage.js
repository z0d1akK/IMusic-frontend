import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from "../../utils/image";

export default function ProductCatalogPage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [unitFilter, setUnitFilter] = useState('');
    const [minPriceFilter, setMinPriceFilter] = useState('');
    const [maxPriceFilter, setMaxPriceFilter] = useState('');

    const [sortField, setSortField] = useState('');
    const [sortDir, setSortDir] = useState('asc');

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const pageSize = 12;

    useEffect(() => {
        axios.get('/ref/product-categories')
            .then(res => setCategories(res.data))
            .catch(() => setCategories([]));

        axios.get('/ref/product-units')
            .then(res => setUnits(res.data))
            .catch(() => setUnits([]));
    }, []);

    const load = () => {
        const request = {
            page: page -1,
            size: pageSize,
            categoryId: categoryFilter ? Number(categoryFilter) : null,
            minPrice: minPriceFilter ? Number(minPriceFilter) : null,
            maxPrice: maxPriceFilter ? Number(maxPriceFilter) : null,
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
    }, [search, categoryFilter, unitFilter, minPriceFilter, maxPriceFilter, sortField, sortDir, page]);


    const findCategoryName = (categoryId) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat ? cat.name : '-';
    };

    const findUnitName = (unitId) => {
        const u = units.find(u => u.id === unitId);
        return u ? u.name : '';
    };

    return (
        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Каталог товаров</h2>
                <input
                    className="form-control w-50"
                    placeholder="Поиск по названию"
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />
                <button
                    className="btn btn-warning"
                    onClick={() => setShowFilters(prev => !prev)}
                >
                    {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                </button>
            </div>

            {showFilters && (
                <div className="card p-3 mb-3">
                    <div className="row g-3">
                        <div className="col-sm">
                            <select
                                className="form-select"
                                value={categoryFilter}
                                onChange={e => {
                                    setCategoryFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">Все категории</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-sm">
                            <select
                                className="form-select"
                                value={unitFilter}
                                onChange={e => {
                                    setUnitFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">Все единицы</option>
                                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="col-sm">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Мин. цена"
                                value={minPriceFilter}
                                onChange={e => {
                                    setMinPriceFilter(e.target.value);
                                    setPage(1);
                                }}
                                min="0"
                            />
                        </div>
                        <div className="col-sm">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Макс. цена"
                                value={maxPriceFilter}
                                onChange={e => {
                                    setMaxPriceFilter(e.target.value);
                                    setPage(1);
                                }}
                                min={maxPriceFilter}
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
                                    setPage(1);
                                }}
                            >
                                <option value="_">Без сортировки</option>
                                <option value="name_asc">Название ↑</option>
                                <option value="name_desc">Название ↓</option>
                                <option value="price_asc">Цена ↑</option>
                                <option value="price_desc">Цена ↓</option>
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
                        onClick={() => navigate(`/catalog/${p.id}`)}
                        style={{cursor: 'pointer'}}
                    >
                        <div className="card h-100 shadow-sm text-center p-3 align-items-center">
                            <img
                                src={getImageUrl(p.imagePath)}
                                alt={p.name}
                                className="mb-2"
                                style={{width: 120, height: 120, objectFit: 'contain'}}
                            />
                            <h5>{p.name}</h5>
                            <p className="text-muted">{findCategoryName(p.categoryId)}</p>
                            <p><b>{p.price?.toFixed(2) ?? '-'} р.</b> {findUnitName(p.unitId)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <nav>
                <ul className="pagination justify-content-center">
                    {Array.from({length: totalPages}, (_, i) => (
                        <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                            <button className="page-link bg-warning text-black" onClick={() => setPage(i + 1)}>
                                {i + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
