import React, { useRef } from "react";
import { Form, Row, Col } from "react-bootstrap";

const StatisticsFilter = ({ filters, onChange }) => {
    const debounceRef = useRef(null);

    const handleChange = (updated) => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onChange(updated);
        }, 120);
    };

    return (
        <Form className="mb-3 w-100">
            <Row className="g-3 w-100">
                <Col xs={12} md={4}>
                    <Form.Group>
                        <Form.Label>Дата начала</Form.Label>
                        <Form.Control
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleChange({ ...filters, startDate: e.target.value })}
                        />
                    </Form.Group>
                </Col>

                <Col xs={12} md={4}>
                    <Form.Group>
                        <Form.Label>Дата окончания</Form.Label>
                        <Form.Control
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleChange({ ...filters, endDate: e.target.value })}
                        />
                    </Form.Group>
                </Col>

                <Col xs={6} md={2}>
                    <Form.Label>Группа</Form.Label>
                    <Form.Select
                        value={filters.groupBy}
                        onChange={(e) => handleChange({ ...filters, groupBy: e.target.value })}
                    >
                        <option value="day">День</option>
                        <option value="month">Месяц</option>
                        <option value="year">Год</option>
                    </Form.Select>
                </Col>

                <Col xs={6} md={2}>
                    <Form.Label>Лимит</Form.Label>
                    <Form.Select
                        value={filters.limit}
                        onChange={(e) => handleChange({ ...filters, limit: Number(e.target.value) })}
                    >
                        <option value={30}>30</option>
                        <option value={60}>60</option>
                        <option value={100}>100</option>
                    </Form.Select>
                </Col>
            </Row>
        </Form>
    );
};

export default StatisticsFilter;
