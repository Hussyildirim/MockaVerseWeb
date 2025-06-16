import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button, Table, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Loader from '../common/Loader';
import Message from '../common/Message';
import { getCustomersApi, deleteCustomerApi } from '../../services/api';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomersApi();
      setCustomers(data);
      setLoading(false);
    } catch (err) {
      setError('Müşteriler yüklenirken bir hata oluştu.');
      console.error('Müşteri listesi yüklenirken hata:', err);
      setLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteCustomerApi(id);
        toast.success('Müşteri başarıyla silindi');
        fetchCustomers();
      } catch (err) {
        toast.error('Müşteri silinirken bir hata oluştu');
        console.error('Müşteri silinirken hata:', err);
      }
    }
  };

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="header-title">Müşteri - Senaryo Eşleştirme</h1>
        </Col>
        <Col className="text-end">
          <Link to="/customers/new">
            <Button variant="primary">
              <i className="fas fa-plus btn-icon"></i> Yeni Müşteri
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
            {customers.length === 0 ? (
              <Message>Henüz hiç müşteri tanımlanmamış.</Message>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Müşteri No</th>
                    <th>Kullanıcı Kodu</th>
                    <th>Atanan Senaryolar</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td>{customer.customerNumber}</td>
                      <td>{customer.userCode}</td>
                      <td>
                        {customer.assignedScenarios && customer.assignedScenarios.length > 0 ? (
                          <ul className="mb-0">
                            {customer.assignedScenarios.map((scenario, index) => (
                              <li key={index}>{scenario.name}</li>
                            ))}
                          </ul>
                        ) : (
                          'Atanmış senaryo yok'
                        )}
                      </td>
                      <td>
                        <Link to={`/customers/edit/${customer._id}`}>
                          <Button variant="info" size="sm" className="me-2">
                            <i className="fas fa-edit"></i> Düzenle
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteHandler(customer._id)}
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

export default CustomerList; 