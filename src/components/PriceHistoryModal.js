import React, { useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend
} from 'recharts';

export default function PriceHistoryModal({
                                              show,
                                              onClose,
                                              data,
                                              period,
                                              onPeriodChange,
                                              loading
                                          }) {
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [show]);

    if (!show) return null;

    const formatLabel = (label) => {
        if (period === 2) return label.slice(5);
        return label;
    };

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{ background: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
            onClick={onClose}
        >
            <div
                className="bg-white p-4 rounded shadow"
                style={{ width: '90%', maxWidth: '800px' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">История изменения цены</h5>
                    <button className="btn-close" onClick={onClose} />
                </div>

                <div className="mb-3">
                    <button
                        className={`btn me-2 ${period === 2 ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => onPeriodChange(2)}
                    >
                        2 месяца
                    </button>

                    <button
                        className={`btn ${period === 12 ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => onPeriodChange(12)}
                    >
                        12 месяцев
                    </button>
                </div>

                {loading ? (
                    <div className="text-center">Загрузка графика...</div>
                ) : (
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis
                                    dataKey="label"
                                    tickFormatter={formatLabel}
                                />

                                <YAxis />

                                <Tooltip
                                    formatter={(value) => `${value.toFixed(2)} р.`}
                                />

                                <Legend />

                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    name="Цена"
                                    stroke="#28a745"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}