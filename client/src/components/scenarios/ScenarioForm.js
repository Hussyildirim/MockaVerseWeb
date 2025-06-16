import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Loader from '../common/Loader';
import Message from '../common/Message';
import { getScenarioByIdApi, createScenarioApi, updateScenarioApi } from '../../services/api';

const ScenarioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mockServices, setMockServices] = useState([
    { serviceName: '', endpointUrl: '', responseData: '' }
  ]);

  useEffect(() => {
    if (isEditMode) {
      fetchScenario();
    }
  }, [id]);

  const fetchScenario = async () => {
    try {
      setLoading(true);
      const data = await getScenarioByIdApi(id);
      setName(data.name);
      setDescription(data.description);
      
      if (data.mockServices && data.mockServices.length > 0) {
        setMockServices(data.mockServices);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Senaryo detayları yüklenirken bir hata oluştu.');
      console.error('Senaryo detayları yüklenirken hata:', err);
      setLoading(false);
    }
  };

  const addMockService = () => {
    setMockServices([
      ...mockServices,
      { serviceName: '', endpointUrl: '', responseData: '' }
    ]);
  };

  const removeMockService = (index) => {
    const updatedServices = [...mockServices];
    updatedServices.splice(index, 1);
    setMockServices(updatedServices);
  };

  const handleMockServiceChange = (index, field, value) => {
    const updatedServices = [...mockServices];
    updatedServices[index][field] = value;
    setMockServices(updatedServices);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Lütfen senaryo adını giriniz');
      return;
    }

    // Mock servislerin gerekli alanlarını kontrol et
    for (let i = 0; i < mockServices.length; i++) {
      const service = mockServices[i];
      if (!service.serviceName.trim() || !service.endpointUrl.trim() || !service.responseData.trim()) {
        toast.error(`Lütfen ${i + 1}. mock servisin tüm alanlarını doldurunuz`);
        return;
      }
    }

    const scenarioData = {
      name,
      description,
      mockServices
    };

    try {
      setLoading(true);
      
      if (isEditMode) {
        await updateScenarioApi(id, scenarioData);
        toast.success('Senaryo başarıyla güncellendi');
      } else {
        await createScenarioApi(scenarioData);
        toast.success('Yeni senaryo başarıyla oluşturuldu');
      }
      
      setLoading(false);
      navigate('/scenarios');
    } catch (err) {
      setError(isEditMode ? 'Senaryo güncellenirken bir hata oluştu' : 'Senaryo oluşturulurken bir hata oluştu');
      console.error('Form gönderilirken hata:', err);
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="light"
        className="mb-3"
        onClick={() => navigate('/scenarios')}
      >
        Geri Dön
      </Button>

      <Card>
        <Card.Header as="h2">
          {isEditMode ? 'Senaryoyu Düzenle' : 'Yeni Senaryo Oluştur'}
        </Card.Header>
        <Card.Body>
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <Form onSubmit={submitHandler}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Senaryo Adı</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Senaryo adını giriniz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="description" className="mb-3">
                <Form.Label>Açıklama</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Senaryo açıklamasını giriniz"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>

              <h4 className="mt-4 mb-3">Mock Servisler</h4>
              
              {mockServices.map((service, index) => (
                <Card key={index} className="service-card mb-3 p-3">
                  <h5>Servis #{index + 1}</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group controlId={`serviceName-${index}`} className="mb-3">
                        <Form.Label>Servis Adı</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Servis adını giriniz"
                          value={service.serviceName}
                          onChange={(e) => handleMockServiceChange(index, 'serviceName', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId={`endpointUrl-${index}`} className="mb-3">
                        <Form.Label>Endpoint URL</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Endpoint URL'yi giriniz"
                          value={service.endpointUrl}
                          onChange={(e) => handleMockServiceChange(index, 'endpointUrl', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group controlId={`responseData-${index}`} className="mb-3">
                    <Form.Label>Çıktı Şeması / Örnek Response</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      placeholder="JSON formatında örnek çıktı giriniz"
                      value={service.responseData}
                      onChange={(e) => handleMockServiceChange(index, 'responseData', e.target.value)}
                      required
                    />
                  </Form.Group>

                  {mockServices.length > 1 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeMockService(index)}
                      className="mt-2"
                    >
                      Bu Servisi Sil
                    </Button>
                  )}
                </Card>
              ))}

              <Button
                variant="secondary"
                className="mb-4"
                onClick={addMockService}
              >
                <i className="fas fa-plus btn-icon"></i> Yeni Mock Servis Ekle
              </Button>

              <div className="d-grid gap-2">
                <Button type="submit" variant="primary" size="lg">
                  {isEditMode ? 'Senaryoyu Güncelle' : 'Senaryoyu Oluştur'}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default ScenarioForm; 