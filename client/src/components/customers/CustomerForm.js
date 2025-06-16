import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Row, Col, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Loader from '../common/Loader';
import Message from '../common/Message';
import { 
  getCustomerByIdApi, 
  createCustomerApi, 
  updateCustomerApi,
  getScenariosApi
} from '../../services/api';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [customerNumber, setCustomerNumber] = useState('');
  const [userCode, setUserCode] = useState('');
  const [assignedScenarios, setAssignedScenarios] = useState([]);
  
  const [scenarios, setScenarios] = useState([]);
  const [scenariosLoading, setScenariosLoading] = useState(false);

  useEffect(() => {
    fetchScenarios();
    
    if (isEditMode) {
      fetchCustomer();
    }
  }, [id]);

  const fetchScenarios = async () => {
    try {
      setScenariosLoading(true);
      const data = await getScenariosApi();
      setScenarios(data);
      setScenariosLoading(false);
    } catch (err) {
      console.error('Senaryolar yüklenirken hata:', err);
      setScenariosLoading(false);
    }
  };

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const data = await getCustomerByIdApi(id);
      setCustomerNumber(data.customerNumber);
      setUserCode(data.userCode);
      
      if (data.assignedScenarios && data.assignedScenarios.length > 0) {
        const scenarioIds = data.assignedScenarios.map(s => 
          typeof s === 'object' ? s._id : s
        );
        setAssignedScenarios(scenarioIds);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Müşteri detayları yüklenirken bir hata oluştu.');
      console.error('Müşteri detayları yüklenirken hata:', err);
      setLoading(false);
    }
  };

  const handleScenarioCheck = (scenarioId) => {
    setAssignedScenarios(prevState => {
      if (prevState.includes(scenarioId)) {
        return prevState.filter(id => id !== scenarioId);
      } else {
        return [...prevState, scenarioId];
      }
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!customerNumber.trim()) {
      toast.error('Lütfen müşteri numarasını giriniz');
      return;
    }

    if (!userCode.trim()) {
      toast.error('Lütfen kullanıcı kodunu giriniz');
      return;
    }

    const customerData = {
      customerNumber,
      userCode,
      assignedScenarios
    };

    try {
      setLoading(true);
      
      if (isEditMode) {
        await updateCustomerApi(id, customerData);
        toast.success('Müşteri başarıyla güncellendi');
      } else {
        await createCustomerApi(customerData);
        toast.success('Yeni müşteri başarıyla oluşturuldu');
      }
      
      setLoading(false);
      navigate('/customers');
    } catch (err) {
      setError(isEditMode ? 'Müşteri güncellenirken bir hata oluştu' : 'Müşteri oluşturulurken bir hata oluştu');
      console.error('Form gönderilirken hata:', err);
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="light"
        className="mb-3"
        onClick={() => navigate('/customers')}
      >
        Geri Dön
      </Button>

      <Card>
        <Card.Header as="h2">
          {isEditMode ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Oluştur'}
        </Card.Header>
        <Card.Body>
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <Form onSubmit={submitHandler}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="customerNumber" className="mb-3">
                    <Form.Label>Müşteri Numarası</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Müşteri numarasını giriniz"
                      value={customerNumber}
                      onChange={(e) => setCustomerNumber(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="userCode" className="mb-3">
                    <Form.Label>Kullanıcı Kodu</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Kullanıcı kodunu giriniz"
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h4 className="mt-4 mb-3">Senaryoları Atama</h4>
              
              {scenariosLoading ? (
                <Loader />
              ) : scenarios.length === 0 ? (
                <Message>Henüz hiç senaryo tanımlanmamış. Önce senaryo ekleyin.</Message>
              ) : (
                <Card>
                  <Card.Header>Mevcut Senaryolar</Card.Header>
                  <ListGroup variant="flush" className="scenario-list">
                    {scenarios.map((scenario) => (
                      <ListGroup.Item key={scenario._id}>
                        <Form.Check
                          type="checkbox"
                          id={`scenario-${scenario._id}`}
                          label={`${scenario.name} - ${scenario.description || 'Açıklama yok'}`}
                          checked={assignedScenarios.includes(scenario._id)}
                          onChange={() => handleScenarioCheck(scenario._id)}
                        />
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card>
              )}

              <div className="d-grid gap-2 mt-4">
                <Button type="submit" variant="primary" size="lg">
                  {isEditMode ? 'Müşteriyi Güncelle' : 'Müşteriyi Oluştur'}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default CustomerForm; 