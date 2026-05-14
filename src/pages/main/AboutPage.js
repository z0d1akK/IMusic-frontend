import React from 'react';

const MAP_EMBED_SRC =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2350.8939808963876!2d27.5911303!3d53.9188056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46dbcfa7bec46317%3A0x3efd8e8ffb993d!2z0JHQvtC70YzRidC10YLRgdC60LDRjyDQkdC10LvQuNC90LAg0JHRg9C70YzQstC-LdCz0L7RgNC-0YHRgtC-0LU!5e0!3m2!1sru!2sby!4v1714322545305!5m2!1sru!2sby';

const YOUTUBE_EMBED_SRC = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

export default function AboutPage() {
    return (
        <div className="about-page bg-light py-5">
            <div className="container">
                <h1 className="text-dark mb-4">О компании IMusic</h1>

                <div className="about-section">
                    <p>
                        <strong>IMusic</strong> — интернет-магазин аудиотехники и сопутствующих товаров. Мы работаем
                        для того, чтобы удобно подобрать наушники, колонки, плееры и аксессуары с понятными
                        характеристиками и честными ценами.
                    </p>
                    <p>
                        В каталоге представлены решения для дома, учёбы и путешествий: проводная и беспроводная
                        акустика, Hi-Fi и мобильный звук, кабели и кейсы от проверенных брендов.
                    </p>
                    <p>
                        Ниже на карте отмечен наш офис, а в коротком ролике на YouTube — краткий рассказ о сервисе.
                    </p>
                </div>

                <div className="mt-4">
                    <h4 className="text-dark">Наш офис на карте</h4>
                    <iframe
                        className="about-embed mt-2"
                        title="Карта — офис IMusic"
                        src={MAP_EMBED_SRC}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                    />

                    <h4 className="text-dark mt-5">IMusic на YouTube</h4>
                    <iframe
                        className="about-embed mt-2"
                        title="YouTube — о компании IMusic"
                        src={YOUTUBE_EMBED_SRC}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
}
