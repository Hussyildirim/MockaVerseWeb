import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button, Table, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Loader from '../common/Loader';
import Message from '../common/Message';
import { getScenariosApi, deleteScenarioApi } from '../../services/api';

const ScenarioList = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const data = await getScenariosApi();
      setScenarios(data);
      setLoading(false);
    } catch (err) {
      setError('Senaryolar yüklenirken bir hata oluştu.');
      console.error('Senaryo listesi yüklenirken hata:', err);
      setLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Bu senaryoyu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteScenarioApi(id);
        toast.success('Senaryo başarıyla silindi');
        fetchScenarios();
      } catch (err) {
        toast.error('Senaryo silinirken bir hata oluştu');
        console.error('Senaryo silinirken hata:', err);
      }
    }
  };

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="header-title">Senaryolar</h1>
        </Col>
        <Col className="text-end">
          <Link to="/scenarios/new">
            <Button variant="primary">
              <i className="fas fa-plus btn-icon"></i> Yeni Senaryo
            </Button>
          </Link>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Card>
          <Card.Body>
            {scenarios.length === 0 ? (
              <Message>Henüz hiç senaryo tanımlanmamış.</Message>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Senaryo Adı</th>
                    <th>Açıklama</th>
                    <th>Mock Servis Sayısı</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((scenario) => (
                    <tr key={scenario._id}>
                      <td>{scenario._id}</td>
                      <td>{scenario.name}</td>
                      <td>{scenario.description}</td>
                      <td>{scenario.mockServices.length}</td>
                      <td>
                        <Link to={`/scenarios/edit/${scenario._id}`}>
                          <Button variant="info" size="sm" className="me-2">
                            <i className="fas fa-edit"></i> Düzenle
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteHandler(scenario._id)}
                        >
                          <i className="fas fa-trash"></i> Sil
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default ScenarioList; 