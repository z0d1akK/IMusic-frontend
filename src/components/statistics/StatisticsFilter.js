import React, { useRef } from "react";
import { Form, Row, Col } from "react-bootstrap";

const StatisticsFilter = ({ filters, onChange }) => {
    const debounceRef = useRef(null);

    const handleChange = (updated) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            onChange(updated);
        }, 100);
    };

    return (
        <Form className="mb-3 w-100">
            <Row className="g-3 w-100">
                <Col xs={12} md={6}>
                    <Form.Group controlId="startDate" className="w-100">
                        <Form.Label>Дата начала</Form.Label>
                        <Form.Control
                            type="date"
                            className="w-100"
                            value={filters.startDate}
                            onChange={(e) => handleChange({
                                ...filters,
                                startDate: e.target.value
                            })}
                        />
                    </Form.Group>
                </Col>

                <Col xs={12} md={6}>
                    <Form.Group controlId="endDate" className="w-100">
                        <Form.Label>Дата окончания</Form.Label>
                        <Form.Control
                            type="date"
                            className="w-100"
                            value={filters.endDate}
                            onChange={(e) => handleChange({
                                ...filters,
                                endDate: e.target.value
                            })}
                        />
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    );
};

export default StatisticsFilter;
