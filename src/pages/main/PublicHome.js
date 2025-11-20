import React from 'react';

export default function PublicHome() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <main
                className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-white text-center home-hero"
            >
                <div className="home-content px-3">
                    <h1 className="display-3 fw-bold mb-3">IMusic</h1>
                    <p className="lead mb-4">Здесь есть техника, о которой вы мечтали</p>
                    <div className="d-flex flex-wrap justify-content-center gap-3">
                        <a href="/login" className="btn btn-dark btn-lg px-4 rounded-pill">
                            Начать
                        </a>
                        <a href="/catalog" className="btn btn-outline-light btn-lg px-4 rounded-pill">
                            Перейти в каталог
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
