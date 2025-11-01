import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import AddOrEditMovementModal from "../../components/inventory/AddOrEditMovementModal";
import MovementHistoryModal from "../../components/inventory/MovementHistoryModal";

const InventoryMovementPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [movementTypes, setMovementTypes] = useState([]);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortDir, setSortDir] = useState("asc");
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);

    const [minStockQuantity, setMinStockQuantity] = useState("");
    const [maxStockQuantity, setMaxStockQuantity] = useState("");
    const [minWarehouseQuantity, setMinWarehouseQuantity] = useState("");
    const [maxWarehouseQuantity, setMaxWarehouseQuantity] = useState("");

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [editMovementData, setEditMovementData] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const fetchProducts = async () => {
        try {
            const body = {
                page: page - 1,
                size: 20,
                categoryId: categoryFilter || null,
                minStockLevel: minStockQuantity ? Number(minStockQuantity) : null,
                maxStockLevel: maxStockQuantity ? Number(maxStockQuantity) : null,
                minWarehouseQuantity: minWarehouseQuantity ? Number(minWarehouseQuantity) : null,
                maxWarehouseQuantity: maxWarehouseQuantity ? Number(maxWarehouseQuantity) : null,
                sortBy: sortField,
                sortDirection: sortDir || "asc",
                filters: search ? [search] : [],
            };

            const res = await axiosInstance.post("/products/paged", body);
            setProducts(res.data);
        } catch (e) {
            console.error("Ошибка при загрузке продуктов", e);
        }
    };


    const validateRange = (min, max, label) => {
        if (min && (isNaN(min) || min < 0)) return `${label}: мин. должно быть >= 0`;
        if (max && (isNaN(max) || max < 0)) return `${label}: макс. должно быть >= 0`;
        if (min && max && Number(min) > Number(max)) return `${label}: мин. не может быть больше макс.`;
        return null;
    };

    const fetchCategories = async () => {
        try {
            const res = await axiosInstance.get("/ref/product-categories");
            setCategories(res.data);
        } catch (e) {
            console.error("Ошибка при загрузке категорий", e);
        }
    };

    const fetchMovementTypes = async () => {
        try {
            const res = await axiosInstance.get("/ref/inventory-movement-types");
            setMovementTypes(res.data);
        } catch (e) {
            console.error("Ошибка при загрузке типов движений", e);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            const errors = [
                validateRange(minStockQuantity, maxStockQuantity, "В наличии"),
                validateRange(minWarehouseQuantity, maxWarehouseQuantity, "На складе"),
            ].filter(Boolean);

            if (errors.length > 0) {
                alert(errors.join("\n"));
                return;
            }

            fetchProducts();
        }, 500);

        return () => clearTimeout(timeout);
    }, [
        search,
        categoryFilter,
        sortField,
        sortDir,
        page,
        minStockQuantity,
        maxStockQuantity,
        minWarehouseQuantity,
        maxWarehouseQuantity,
    ]);


    useEffect(() => {
        fetchCategories();
        fetchMovementTypes();
    }, []);

    const handleAddMovement = (product) => {
        setSelectedProduct(product);
        setEditMovementData(null);
        setShowAddEditModal(true);
    };

    const handleEditMovement = (movement) => {
        setSelectedProduct((prevProduct) => {
            const productObj = products.find((p) => p.id === movement.productId);
            if (!productObj) {
                console.warn("Продукт не найден для редактирования", movement.productId);
            }
            return productObj || prevProduct;
        });
        setEditMovementData(movement);
        setShowAddEditModal(true);
    };


    const handleViewHistory = (product) => {
        setSelectedProduct(product);
        setShowHistoryModal(true);
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-4">Движение товаров</h3>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <input
                    className="form-control w-50"
                    placeholder="Поиск по названию"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />
                <button
                    className="btn btn-warning"
                    onClick={() => setShowFilters((v) => !v)}
                >
                    {showFilters ? "Скрыть фильтры" : "Показать фильтры"}
                </button>
            </div>

            {showFilters && (
                <div className="card p-3 mb-3">
                    <div className="row g-3">
                        <div className="col-sm">
                            <select
                                className="form-select"
                                value={categoryFilter}
                                onChange={(e) => {
                                    setCategoryFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">Все категории</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-sm">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Мин. в наличии"
                                value={minStockQuantity}
                                onChange={(e) => {
                                    setMinStockQuantity(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="col-sm">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Макс. в наличии"
                                value={maxStockQuantity}
                                onChange={(e) => {
                                    setMaxStockQuantity(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="col-sm">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Мин. на складе"
                                value={minWarehouseQuantity}
                                onChange={(e) => {
                                    setMinWarehouseQuantity(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="col-sm">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Макс. на складе"
                                value={maxWarehouseQuantity}
                                onChange={(e) => {
                                    setMaxWarehouseQuantity(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>

                        <div className="col-sm">
                            <select
                                className="form-select"
                                value={`${sortField}_${sortDir}`}
                                onChange={(e) => {
                                    const [field, dir] = e.target.value.split("_");
                                    setSortField(field !== "_" ? field : null);
                                    setSortDir(dir || "asc");
                                    setPage(1);
                                }}
                            >
                                <option value="_">Без сортировки</option>
                                <option value="name_asc">Название ↑</option>
                                <option value="name_desc">Название ↓</option>
                                <option value="stockQuantity_asc">В наличии ↑</option>
                                <option value="stockQuantity_desc">В наличии ↓</option>
                                <option value="warehouseQuantity_asc">На складе ↑</option>
                                <option value="warehouseQuantity_desc">На складе ↓</option>
                            </select>
                        </div>
                    </div>
                    {(parseFloat(minStockQuantity) > parseFloat(maxStockQuantity)) && (
                        <div className="text-danger small mt-2">Мин. в наличии не может быть больше макс.</div>
                    )}
                    {(parseFloat(minWarehouseQuantity) > parseFloat(maxWarehouseQuantity)) && (
                        <div className="text-danger small mt-2">Мин. в наличии не может быть больше макс.</div>
                    )}
                </div>
            )}

            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                    <tr>
                        <th>Название</th>
                        <th>Категория</th>
                        <th>В наличии</th>
                        <th>На складе</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{categories.find((c) => c.id === p.categoryId)?.name}</td>
                            <td>{p.stockQuantity}</td>
                            <td>{p.warehouseQuantity}</td>
                            <td>
                                <div className="btn-group btn-group-sm">
                                    <button
                                        className="btn btn-warning"
                                        onClick={() => handleAddMovement(p)}
                                    >
                                        Добавить движение
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => handleViewHistory(p)}
                                    >
                                        История движения
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {products.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center">
                                Нет данных
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {showAddEditModal && selectedProduct && (
                <AddOrEditMovementModal
                    show={showAddEditModal}
                    onHide={() => setShowAddEditModal(false)}
                    product={selectedProduct}
                    movementTypes={movementTypes}
                    editData={editMovementData}
                    onSuccess={fetchProducts}
                />
            )}

            {showHistoryModal && selectedProduct && (
                <MovementHistoryModal
                    show={showHistoryModal}
                    onHide={() => setShowHistoryModal(false)}
                    product={selectedProduct}
                    onEditMovement={handleEditMovement}
                />
            )}
        </div>
    );
};

export default InventoryMovementPage;
