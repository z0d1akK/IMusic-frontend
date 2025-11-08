import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import { Table, Button, InputGroup, FormControl, Pagination, Spinner, Row, Col, Form } from "react-bootstrap";
import DictionaryModal from "./DictionaryModal";
import ConfirmModal from "../ConfirmModal";

const DictionaryTable = ({ dictionaryType }) => {
    const [items, setItems] = useState([]);
    const [codeFilter, setCodeFilter] = useState("");
    const [nameFilter, setNameFilter] = useState("");
    const [sortField, setSortField] = useState("name");
    const [sortDir, setSortDir] = useState("asc");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalMode, setModalMode] = useState("add");

    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        fetchData();
    }, [dictionaryType, codeFilter, nameFilter, sortField, sortDir, page, size]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const requestBody = {
                code: codeFilter || null,
                name: nameFilter || null,
                page,
                size,
                sortBy: sortField || null,
                sortDirection: sortDir || null,
                filters: []
            };

            const response = await axios.post(`/ref/${dictionaryType}/filter`, requestBody);

            if (response.data.content) {
                setItems(response.data.content);
                setTotalPages(response.data.totalPages || 1);
            } else {
                setItems(response.data);
                setTotalPages(1);
            }

            const totalPagesHeader = response.headers["x-total-pages"] || response.headers["X-Total-Pages"];
            if (totalPagesHeader) {
                setTotalPages(parseInt(totalPagesHeader, 10));
            }
        } catch (err) {
            console.error("Ошибка загрузки справочника:", err);
            setItems([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDir("asc");
        }
        setPage(0);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setModalMode("add");
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setModalMode("edit");
        setShowModal(true);
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowConfirm(true);
    };

    const handleSave = async (data) => {
        try {
            if (modalMode === "add") {
                await axios.post(`/ref/${dictionaryType}`, data);
            } else {
                await axios.put(`/ref/${dictionaryType}/${editingItem.id}`, data);
            }
            fetchData();
        } catch (err) {
            console.error("Ошибка сохранения:", err);
        } finally {
            setShowModal(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/ref/${dictionaryType}/${itemToDelete.id}`);
            fetchData();
        } catch (err) {
            console.error("Ошибка удаления:", err);
        } finally {
            setShowConfirm(false);
        }
    };

    const paginationItems = [];
    for (let i = 0; i < totalPages; i++) {
        paginationItems.push(
            <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>
                {i + 1}
            </Pagination.Item>
        );
    }

    return (
        <div>
            <Row className="mb-3 align-items-center">
                <Col xs={12} md={4} lg={3}>
                    <InputGroup>
                        <FormControl
                            placeholder="Поиск по коду"
                            value={codeFilter}
                            onChange={(e) => {
                                setCodeFilter(e.target.value);
                                setPage(0);
                            }}
                        />
                    </InputGroup>
                </Col>
                <Col xs={12} md={4} lg={3}>
                    <InputGroup>
                        <FormControl
                            placeholder="Поиск по названию"
                            value={nameFilter}
                            onChange={(e) => {
                                setNameFilter(e.target.value);
                                setPage(0);
                            }}
                        />
                    </InputGroup>
                </Col>
                <Col xs={12} md={4} lg={3}>
                    <Form.Select
                        value={`${sortField}_${sortDir}`}
                        onChange={(e) => {
                            const [field, dir] = e.target.value.split("_");
                            setSortField(field);
                            setSortDir(dir);
                            setPage(0);
                        }}
                    >
                        <option value="code_asc">Код ↑</option>
                        <option value="code_desc">Код ↓</option>
                        <option value="name_asc">Название ↑</option>
                        <option value="name_desc">Название ↓</option>
                    </Form.Select>
                </Col>
                <Col xs="auto" className="ms-auto">
                    <Button variant="warning" onClick={handleAdd}>
                        Добавить
                    </Button>
                </Col>
            </Row>

            {loading ? (
                <div className="text-center my-4">
                    <Spinner animation="border" />
                </div>
            ) : (
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th onClick={() => handleSort("code")} style={{ cursor: "pointer" }}>
                            Код {sortField === "code" && (sortDir === "asc" ? "▲" : "▼")}
                        </th>
                        <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                            Название {sortField === "name" && (sortDir === "asc" ? "▲" : "▼")}
                        </th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.length > 0 ? (
                        items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.code}</td>
                                <td>{item.name}</td>
                                <td>
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        onClick={() => handleEdit(item)}
                                        className="me-2"
                                    >
                                        Изменить
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(item)}
                                    >
                                        Удалить
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={3} className="text-center">
                                Нет данных
                            </td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            )}

            {totalPages > 1 && (
                <div className="d-flex justify-content-center">
                    <Pagination>{paginationItems}</Pagination>
                </div>
            )}

            <DictionaryModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                item={editingItem}
                mode={modalMode}
            />

            <ConfirmModal
                show={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmDelete}
                message={`Удалить "${itemToDelete?.name}"?`}
            />
        </div>
    );
};

export default DictionaryTable;
