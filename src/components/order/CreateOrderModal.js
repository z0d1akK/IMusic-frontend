import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import axiosInstance from "../../api/axiosInstance";

const CreateOrderModal = ({ show, onHide, clients, onSuccess }) => {
    const [selectedClientId, setSelectedClientId] = useState("");
    const [clientSearch, setClientSearch] = useState("");

    const [products, setProducts] = useState([]);
    const [items, setItems] = useState([]);

    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (show) {
            fetchProducts();
            fetchCategories();
        }
    }, [show, search, categoryId, minPrice, maxPrice]);

    const fetchProducts = async () => {
        try {
            const res = await axiosInstance.post("/products/paged", {
                page: 0,
                size: 100,
                name: search || null,
                categoryId: categoryId ? Number(categoryId) : null,
                minPrice: minPrice ? Number(minPrice) : null,
                maxPrice: maxPrice ? Number(maxPrice) : null,
                sortBy: "id",
                sortDirection: "ASC",
            });
            setProducts(res.data || []);
        } catch (e) {
            console.error("Ошибка загрузки продуктов", e);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axiosInstance.get("/ref/product-categories");
            setCategories(res.data || []);
        } catch (e) {
            console.error("Ошибка загрузки категорий", e);
        }
    };

    const handleQuantityChange = (productId, quantity) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.productId === productId);
            if (existing) {
                return prev.map((i) =>
                    i.productId === productId ? { ...i, quantity: +quantity } : i
                );
            } else {
                return [...prev, { productId, quantity: +quantity }];
            }
        });
    };

    const getTotal = () => {
        return items
            .reduce((sum, item) => {
                const product = products.find((p) => p.id === item.productId);
                return sum + (product?.price || 0) * item.quantity;
            }, 0)
            .toFixed(2);
    };

    const getQuantity = (productId) => {
        return items.find((i) => i.productId === productId)?.quantity || 0;
    };

    const handleSubmit = async () => {
        try {
            const filteredItems = items.filter((i) => i.quantity > 0);
            const clientId = Number(selectedClientId);
            const userId = Number(localStorage.getItem("userId"));
            if (!clientId || filteredItems.length === 0) {
                alert("Выберите клиента и добавьте хотя бы один товар");
                return;
            }

            await axiosInstance.post("/orders", {
                clientId,
                createdById: userId,
                items: filteredItems,
            });

            onHide();
            onSuccess();
        } catch (e) {
            console.error("Ошибка при создании заказа", e);
            alert("Не удалось создать заказ");
        }
    };

    const filteredClients = clients.filter((c) => {
        const query = clientSearch.toLowerCase();
        return (
            c.name?.toLowerCase().includes(query) ||
            c.email?.toLowerCase().includes(query) ||
            c.phone?.toLowerCase().includes(query)
        );
    });

    return (
        <Modal show={show} onHide={onHide} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Создание нового заказа</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-2">
                    <Form.Label>Поиск клиента</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Введите имя или телефон клиента"
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Клиент</Form.Label>
                    <Form.Select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                    >
                        <option value="">Выберите клиента</option>
                        {filteredClients.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name} ({c.phone})
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <div className="card p-3 mb-3">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <Form.Control
                                placeholder="Поиск по названию"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <Form.Select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                <option value="">Все категории</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>
                        <div className="col-md-2">
                            <Form.Control
                                type="number"
                                placeholder="Мин. цена"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2">
                            <Form.Control
                                type="number"
                                placeholder="Макс. цена"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <h5>Товары</h5>
                <Table bordered hover>
                    <thead>
                    <tr>
                        <th>Название</th>
                        <th>Цена</th>
                        <th>В наличии</th>
                        <th>Добавить</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.price?.toFixed(2)} ₽</td>
                            <td>{p.stockQuantity ?? "-"}</td>
                            <td>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={getQuantity(p.id)}
                                    onChange={(e) =>
                                        handleQuantityChange(p.id, e.target.value)
                                    }
                                />
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>

                <div className="text-end fw-bold">
                    Общая сумма: {getTotal()} ₽
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Отмена
                </Button>
                <Button
                    variant="warning"
                    onClick={handleSubmit}
                    disabled={!selectedClientId || items.every((i) => i.quantity <= 0)}
                >
                    Создать
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateOrderModal;
