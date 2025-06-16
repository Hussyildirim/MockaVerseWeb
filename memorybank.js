// Memory Bank - Örnek Test Verileri
const bank = {
  scenarios: [
    {
      id: 1,
      name: 'Mobil Onboarding',
      description: 'Mobil bankacılık için yeni müşteri onboarding akışı',
      status: 1,
      mockServices: [
        {
          serviceName: 'Kimlik Doğrulama',
          endpointUrl: '/api/auth/verify',
          responseData: '{"status":"success","verified":true,"userId":1001}'
        },
        {
          serviceName: 'Müşteri Bilgileri',
          endpointUrl: '/api/customer/profile',
          responseData: '{"customerName":"Ali Yılmaz","customerNumber":"12345678","segment":"premium"}'
        }
      ]
    },
    {
      id: 2,
      name: 'Kredi Başvurusu',
      description: 'Bireysel müşteriler için kredi başvuru akışı',
      status: 1,
      mockServices: [
        {
          serviceName: 'Kredi Skoru Sorgulama',
          endpointUrl: '/api/credit/score',
          responseData: '{"score":850,"eligibility":"approved","limit":50000}'
        }
      ]
    },
    {
      id: 3,
      name: 'ATM Lokasyon',
      description: 'En yakın ATM lokasyonları için API',
      status: 1,
      mockServices: [
        {
          serviceName: 'Lokasyon Servisi',
          endpointUrl: '/api/locations/atm',
          responseData: '[{"id":1,"name":"Merkez Şube ATM","address":"İstanbul, Levent","status":"active"},{"id":2,"name":"AVM ATM","address":"İstanbul, Kadıköy","status":"active"}]'
        }
      ]
    },
    {
      id: 4,
      name: 'Para Transferi',
      description: 'Havale ve EFT işlemleri için API',
      status: 0,
      mockServices: [
        {
          serviceName: 'Transfer Servisi',
          endpointUrl: '/api/banking/transfer',
          responseData: '{"transactionId":"TR123456","status":"completed","fee":0}'
        }
      ]
    }
  ],
  customers: [
    {
      id: 'customer-1',
      customerNumber: '12345678',
      userCode: 'USER001',
      assignedScenarios: [1, 2]
    },
    {
      id: 'customer-2',
      customerNumber: '87654321',
      userCode: 'USER002',
      assignedScenarios: [1, 3]
    }
  ]
};

// Bu dosyayı script.js'e dahil ettiğinizde, aşağıdaki fonksiyonu çağırarak memory bank'i yükleyebilirsiniz
function initializeMemoryBank() {
  // Mevcut senaryoları ve müşterileri güncelle
  scenarios = bank.scenarios;
  customers = bank.customers;
  
  // Listeleri güncelle
  updateScenarioList();
  updateCustomerList();
  updateHeaderScenarioList();
  
  console.log('Memory Bank başarıyla yüklendi!');
} 