import React, { useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import DictionaryTable from "../../components/dictionary/DictionaryTable";

const DictionariesPage = () => {
    const [selectedDictionary, setSelectedDictionary] = useState("roles");

    const dictionaries = [
        { label: "Роли", value: "roles" },
        { label: "Статусы пользователей", value: "user-statuses" },
        { label: "Статусы заказов", value: "order-statuses" },
        { label: "Статусы оплаты", value: "payment-statuses"},
        { label: "Способы оплаты", value: "payment-methods"},
        { label: "Категории продуктов", value: "product-categories" },
        { label: "Единицы измерения", value: "product-units" },
        { label: "Тип передвижения продукта" , value: "inventory-movement-types"},
        { label: "Тип уведомлений", value: "notification-types"}
    ];

    return (
        <Container className="mt-4">
            <Row className="mb-3">
                <Col md={6}>
                    <h3>Управление справочниками</h3>
                </Col>
                <Col md={6}>
                    <Form.Select
                        value={selectedDictionary}
                        onChange={(e) => setSelectedDictionary(e.target.value)}
                    >
                        {dictionaries.map((dict) => (
                            <option key={dict.value} value={dict.value}>
                                {dict.label}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>
            <DictionaryTable dictionaryType={selectedDictionary} />
        </Container>
    );
};

export default DictionariesPage;
