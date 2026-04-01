import React, { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist } from '../../utils/wishlist';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/image';

export default function WishlistPage() {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    const load = () => {
        getWishlist()
            .then(res => setProducts(res.data))
            .catch(() => setProducts([]));
    };

    useEffect(() => {
        load();
    }, []);

    const handleRemove = (productId) => {
        removeFromWishlist(productId)
            .then(load)
            .catch(() => alert("Ошибка удаления"));
    };

    if (products.length === 0) {
        return (
            <div className="container mt-5 text-center">
                <h4>Список избранного пуст</h4>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Избранные товары</h2>

            <div className="row">
                {products.map(p => (
                    <div
                        key={p.id}
                        className="col-sm-6 col-md-4 col-lg-3 mb-4"
                        onClick={() => navigate(`/catalog/${p.id}`)}
                        style={{cursor: 'pointer'}}
                    >
                        <div className="card h-100 shadow-sm p-3 d-flex flex-column">
                            <div className="text-center">
                                <img
                                    src={getImageUrl(p.imagePath)}
                                    alt={p.name}
                                    style={{width: 120, height: 120, objectFit: 'contain'}}
                                />
                            </div>
                            <div className="mt-2 text-center" style={{minHeight: 90}}>
                                <h6
                                    className="fw-bold mb-1"
                                    style={{
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}
                                >
                                    {p.name}
                                </h6>
                                <p className="mb-0">
                                    <b>{p.price?.toFixed(2) ?? '-'} р.</b>
                                </p>
                            </div>

                            <div className="mt-auto">
                                <button
                                    className="btn btn-outline-danger btn-sm w-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(p.id);
                                    }}
                                >
                                    Удалить из избранного
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}