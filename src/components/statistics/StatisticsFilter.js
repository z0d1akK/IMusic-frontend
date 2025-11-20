import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

const StatisticsFilter = ({ filters, onChange, onApply }) => {
    return (
        <Form className="mb-4">
            <Row className="align-items-end g-3">
                <Col xs={12} sm={6} md={3}>
                    <Form.Group controlId="startDate">
                        <Form.Label>Дата начала</Form.Label>
                        <Form.Control
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
                        />
                    </Form.Group>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <Form.Group controlId="endDate">
                        <Form.Label>Дата окончания</Form.Label>
                        <Form.Control
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
                        />
                    </Form.Group>
                </Col>

                <Col xs={12} sm={6} md="auto">
                    <Button variant="warning" onClick={onApply}>Применить</Button>
                </Col>
            </Row>
        </Form>
    );
};

export default StatisticsFilter;
