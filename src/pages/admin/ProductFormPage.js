import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBasePath } from "../../utils/basePath";
import axios from '../../api/axiosInstance';

export default function ProductFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const roles = JSON.parse(localStorage.getItem('roles') || '[]');

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [unitId, setUnitId] = useState('');
    const [warehouseQuantity, setWarehouseQuantity] = useState('');
    const [stockQuantity, setStockQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [imagePath, setImagePath] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [attributes, setAttributes] = useState([]);
    const [attributeValues, setAttributeValues] = useState({});
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);

    useEffect(() => {
        axios.get('/ref/product-categories').then(res => setCategories(res.data));
        axios.get('/ref/product-units').then(res => setUnits(res.data));
    }, []);

    useEffect(() => {
        if (!isEdit) return;

        async function fetchProduct() {
            try {
                const { data: product } = await axios.get(`/products/${id}`);
                setName(product.name);
                setDescription(product.description);
                setCategoryId(product.categoryId);
                setUnitId(product.unitId);
                setPrice(product.price);
                setImagePath(product.imagePath || '');
                setWarehouseQuantity(product.warehouseQuantity ?? '');
                setStockQuantity(product.stockQuantity ?? '');

                const { data: attrsWithValues } = await axios.get(`/products/${id}/attributes-with-values`);
                setAttributes(attrsWithValues);

                const values = {};
                attrsWithValues.forEach(attr => {
                    values[attr.id] = attr.value || '';
                });
                setAttributeValues(values);
            } catch (error) {
                alert('Ошибка загрузки товара');
                console.error(error);
            }
        }

        fetchProduct();
    }, [id, isEdit]);

    useEffect(() => {
        if (!categoryId) {
            setAttributes([]);
            setAttributeValues({});
            return;
        }
        if (!isEdit) {
            axios.get(`/category-attributes/category/${categoryId}`)
                .then(res => {
                    setAttributes(res.data);
                    const values = {};
                    res.data.forEach(attr => values[attr.id] = attr.defaultValue || '');
                    setAttributeValues(values);
                })
                .catch(err => {
                    alert('Ошибка загрузки атрибутов категории');
                    console.error(err);
                });
        }
    }, [categoryId, isEdit]);


    useEffect(() => {
        if (!isEdit) {
            setStockQuantity(warehouseQuantity);
        }
    }, [warehouseQuantity, isEdit]);

    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(imageFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    const getImageUrl = (path) => {
        if (!path) return '/uploads/products/default.webp';
        if (path.startsWith('http') || path.startsWith('/uploads/')) return path;
        return `/uploads/${path.replace(/^\/+/g, '')}`;
    };

    const handleSave = async () => {
        const trimmedName = name.trim();
        const trimmedDescription = description.trim();

        if (!trimmedName || trimmedName.length < 3)
            return alert('Название должно содержать минимум 3 символа');
        if (description && trimmedDescription.length < 3)
            return alert('Описание должно содержать минимум 3 символа');
        if (!categoryId) return alert('Выберите категорию');
        if (!unitId) return alert('Выберите единицу измерения');

        const priceNum = parseFloat(price.toString().replace(',', '.'));
        const warehouseNum = parseInt(warehouseQuantity.toString(), 10);

        if (isNaN(priceNum) || priceNum < 0) return alert('Введите корректную цену (число >= 0)');
        if (isNaN(warehouseNum) || warehouseNum < 0) return alert('Введите корректное количество на складе (число >= 0)');

        const emptyAttr = attributes.find(attr => !attributeValues[attr.id]?.trim());
        if (emptyAttr) return alert(`Заполните значение для атрибута "${emptyAttr.name}"`);

        const payload = {
            name: trimmedName,
            description: trimmedDescription,
            categoryId,
            unitId,
            price: priceNum,
            warehouseQuantity: warehouseNum,
            stockQuantity: warehouseNum,
            attributes: Object.entries(attributeValues).map(([attrId, value]) => ({
                categoryAttributeId: parseInt(attrId, 10),
                value,
            })),
        };

        try {
            const res = isEdit
                ? await axios.put(`/products/${id}`, payload)
                : await axios.post('/products', payload);

            const productId = isEdit ? id : res.data.id;

            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                await axios.post(`/products/${productId}/image`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const { data: updatedProduct } = await axios.get(`/products/${productId}`);
                setImagePath(updatedProduct.imagePath || '');
                setImageFile(null);
                setPreviewUrl(null);
            }

            alert('Сохранено');
            navigate(`${getBasePath(roles)}/products`);
        } catch (err) {
            console.error('Ошибка при сохранении:', err);
            alert('Ошибка при сохранении');
        }
    };

    const handleDelete = () => {
        if (!isEdit) return;
        if (window.confirm('Удалить товар?')) {
            axios.delete(`/products/${id}`)
                .then(() => {
                    alert('Удалено');
                    navigate(`${getBasePath(roles)}/products`);
                })
                .catch(err => {
                    console.error('Ошибка при удалении:', err);
                    alert('Ошибка при удалении');
                });
        }
    };

    return (
        <div className="container mt-4">
            <h2>{isEdit ? 'Редактировать товар' : 'Создать товар'}</h2>

            <div className="text-center mb-3">
                <img
                    src={previewUrl || getImageUrl(imagePath)}
                    alt="preview"
                    className="rounded"
                    style={{ maxWidth: 150, maxHeight: 150, objectFit: 'cover' }}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Фото</label>
                <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files[0])}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Название</label>
                <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="mb-3">
                <label className="form-label">Описание</label>
                <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div className="mb-3">
                <label className="form-label">Категория</label>
                <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                    <option value="">Выберите категорию</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Единица измерения</label>
                <select className="form-select" value={unitId} onChange={e => setUnitId(e.target.value)}>
                    <option value="">Выберите единицу</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Цена</label>
                <input type="number" className="form-control" value={price} onChange={e => setPrice(e.target.value.replace(',', '.'))} min={0} />
            </div>

            <div className="mb-3">
                <label className="form-label">Количество на складе</label>
                <input type="number" className="form-control" value={warehouseQuantity} onChange={e => setWarehouseQuantity(e.target.value.replace(',', '.'))} min={0} disabled={isEdit} />
            </div>

            {isEdit && (
                <div className="mb-3">
                    <label className="form-label">Количество в наличии</label>
                    <input type="number" className="form-control" value={stockQuantity} disabled />
                </div>
            )}

            {attributes.length > 0 && (
                <div className="mb-3">
                    <h5>Атрибуты</h5>
                    {attributes.map(attr => (
                        <div key={attr.id} className="mb-2">
                            <label className="form-label">{attr.name}</label>
                            <input className="form-control" value={attributeValues[attr.id] || ''} onChange={e => setAttributeValues(prev => ({ ...prev, [attr.id]: e.target.value }))} />
                        </div>
                    ))}
                </div>
            )}

            <div className="d-flex gap-2 justify-content-between mb-3">
                <button className="btn btn-warning" onClick={handleSave}>{isEdit ? 'Сохранить' : 'Создать'}</button>
                {isEdit && <button className="btn btn-danger" onClick={handleDelete}>Удалить</button>}
                <button className="btn btn-secondary" onClick={() => navigate(`${getBasePath(roles)}/products`)}>Отмена</button>
            </div>
        </div>
    );
}
