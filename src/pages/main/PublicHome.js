import React from 'react';

export default function PublicHome() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <main
                className="flex-grow-1 d-flex align-items-center justify-content-center text-white text-center"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7))',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '80px 20px',
                }}
            >
                <div>
                    <h1 className="display-3 fw-bold">IMusic</h1>
                    <p className="lead mb-4">Здесь есть техника, о которой вы мечтали</p>
                    <a href="/login" className="btn btn-dark btn-lg px-4 me-3 rounded-pill">
                        Начать
                    </a>
                    <a href="/catalog" className="btn btn-outline-light btn-lg px-4 rounded-pill">
                        Перейти в каталог
                    </a>
                </div>
            </main>
        </div>
    );
};