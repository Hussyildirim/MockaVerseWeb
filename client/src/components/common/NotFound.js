import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Card className="text-center">
            <Card.Header as="h3">Sayfa Bulunamadı</Card.Header>
            <Card.Body>
              <Card.Title>404 Hatası</Card.Title>
              <Card.Text>
                Aradığınız sayfa bulunamadı veya taşınmış olabilir.
              </Card.Text>
              <Link to="/">
                <Button variant="primary">Ana Sayfaya Dön</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound; 