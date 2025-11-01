import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import CategoryAttributesTable from "../../components/category/CategoryAttributesTable";

const ProductAttributesPage = () => {
    return (
        <Container className="mt-4">
            <Row className="mb-3">
                <Col md={6}>
                    <h3>Управление атрибутами товаров</h3>
                </Col>
            </Row>

            <CategoryAttributesTable />
        </Container>
    );
};

export default ProductAttributesPage;
