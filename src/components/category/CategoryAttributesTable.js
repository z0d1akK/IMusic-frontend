import React, { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import {
    Table,
    Button,
    Form,
    Row,
    Col,
    Spinner
} from "react-bootstrap";
import CategoryAttributeModal from "./CategoryAttributeModal";
import ConfirmModal from "../ConfirmModal";

const CategoryAttributesTable = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalMode, setModalMode] = useState("add");

    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        axios.get("/ref/product-categories").then((res) => setCategories(res.data));
    }, []);

    useEffect(() => {
        if (selectedCategoryId) {
            fetchAttributes();
        } else {
            setAttributes([]);
        }
    }, [selectedCategoryId]);

    const fetchAttributes = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/category-attributes/category/${selectedCategoryId}`);
            setAttributes(res.data);
        } catch (e) {
            console.error("Ошибка загрузки атрибутов категории", e);
            setAttributes([]);
        } finally {
            setLoading(false);
        }
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
                await axios.post("/category-attributes", data);
            } else {
                await axios.put(`/category-attributes/${editingItem.id}`, data);
            }
            fetchAttributes();
        } catch (e) {
            console.error("Ошибка сохранения атрибута", e);
            alert("Ошибка при сохранении атрибута");
        } finally {
            setShowModal(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/category-attributes/${itemToDelete.id}`);
            fetchAttributes();
        } catch (e) {
            console.error("Ошибка удаления атрибута", e);
            alert("Ошибка при удалении атрибута");
        } finally {
            setShowConfirm(false);
        }
    };

    return (
        <div>
            <Row className="mb-3 align-items-center">
                <Col xs={12} md={6} lg={4}>
                    <Form.Select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                    >
                        <option value="">Выберите категорию</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col xs="auto" className="ms-auto">
                    <Button
                        variant="warning"
                        onClick={handleAdd}
                        disabled={!selectedCategoryId}
                    >
                        Добавить атрибут
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
                        <th>Название атрибута</th>
                        <th>Значение (по умолчанию)</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {attributes.length > 0 ? (
                        attributes.map((attr) => (
                            <tr key={attr.id}>
                                <td>{attr.name}</td>
                                <td>{attr.value ?? attr.defaultValue ?? ''}</td>
                                <td>
                                    <Button
                                        size="sm"
                                        variant="warning"
                                        className="me-2"
                                        onClick={() => handleEdit(attr)}
                                    >
                                        Изменить
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => handleDelete(attr)}
                                    >
                                        Удалить
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={3} className="text-center">
                                Нет атрибутов
                            </td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            )}

            <CategoryAttributeModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                item={editingItem}
                mode={modalMode}
                categoryId={selectedCategoryId}
            />

            <ConfirmModal
                show={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmDelete}
                message={`Удалить атрибут "${itemToDelete?.name}"?`}
            />
        </div>
    );
};

export default CategoryAttributesTable;
