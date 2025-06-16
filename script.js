// ===== SCRIPT.JS TEST =====
console.log('✅ SCRIPT.JS YÜKLENDI!');
try {
  localStorage.setItem('script_test', 'LOADED_' + Date.now());
  console.log('✅ LocalStorage test başarılı');
} catch(e) {
  console.error('❌ LocalStorage hatası:', e);
}

// Örnek veriler ve değişkenler
let scenarios = [
  {
    id: 1,
    name: 'Test Senaryosu',
    description: 'Bu bir örnek senaryo açıklamasıdır.',
    status: 1, // 1: aktif, 0: pasif (silinmiş)
    mockServices: [
      {
        serviceName: 'Kullanıcı Servisi',
        endpointUrl: '/api/users',
        responseData: `{
  "userId": 1,
  "username": "testuser",
  "email": "test@example.com"
}`
      }
    ]
  }
];

let rules = [
  {
    id: 'rule-1',
    ruleValue: '12345',
    assignedScenarios: [1]
  }
];

let mockServiceCount = 1;
let editMockServiceCount = 1;

// LocalStorage fonksiyonları
function saveToLocalStorage() {
  localStorage.setItem('mockverse_scenarios', JSON.stringify(scenarios));
  
  // rules'un dizi olduğundan emin ol
  if (!Array.isArray(rules)) {
    console.error('saveToLocalStorage: rules bir dizi değil, boş dizi kullanılacak');
    rules = [];
  }
  
  localStorage.setItem('mockverse_rules', JSON.stringify(rules));
}

function loadFromLocalStorage() {
  const savedScenarios = localStorage.getItem('mockverse_scenarios');
  const savedRules = localStorage.getItem('mockverse_rules');
  
  if (savedScenarios) {
    try {
      scenarios = JSON.parse(savedScenarios);
    } catch (e) {
      console.error('Senaryolar parse edilemedi:', e);
      scenarios = [];
    }
  }
  
  if (savedRules) {
    try {
      const parsedRules = JSON.parse(savedRules);
      if (Array.isArray(parsedRules)) {
        rules = parsedRules;
      } else {
        console.error('Yüklenen kurallar dizi değil, boş dizi kullanılacak');
        rules = [];
      }
    } catch (e) {
      console.error('Kurallar parse edilemedi:', e);
      rules = [];
    }
  } else {
    console.log('Kaydedilmiş kural bulunamadı, boş dizi kullanılacak');
    rules = [];
  }
  
  updateScenarioList();
  updateRuleList();
  updateHeaderScenarioList();
}

// Memory Bank ayarlarını LocalStorage'a kaydet
function saveRules() {
  const bank = {
    scenarios,
    rules
  };
  
  localStorage.setItem('mockverse_memory', JSON.stringify(bank));
  console.log('Mevcut kurallar kaydedildi');
  alert('Mevcut kurallar başarıyla kaydedildi!');
}

// Memory Bank'ten yeni ayarlar yükle
function loadRules() {
  const rulesData = localStorage.getItem('mockverse_memory');
  
  if (rulesData) {
    try {
      const memory = JSON.parse(rulesData);
      if (Array.isArray(memory.scenarios)) {
        scenarios = memory.scenarios;
      } else {
        console.error('Yüklenen senaryolar dizi değil, değişiklik yapılmadı');
      }
      
      if (Array.isArray(memory.rules)) {
        rules = memory.rules;
      } else {
        console.error('Yüklenen kurallar dizi değil, boş dizi kullanılacak');
        rules = [];
      }
      
      updateScenarioList();
      updateRuleList();
      updateHeaderScenarioList();
      
      console.log('Kurallar başarıyla yüklendi!');
      alert('Kaydedilmiş kurallar başarıyla yüklendi!');
    } catch (e) {
      console.error('Memory Bank veri yükleme hatası:', e);
      alert('Kaydedilmiş kurallar yüklenirken hata oluştu!');
    }
  } else {
    alert('Kaydedilmiş kural bulunamadı!');
  }
}

// Global debug log system
let globalDebugLogs;
try {
  globalDebugLogs = JSON.parse(localStorage.getItem('mockaverse_debug_logs') || '[]');
} catch (e) {
  console.error('Error loading debug logs:', e);
  globalDebugLogs = [];
}

function debugLog(message, type = 'INFO') {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type}] SCRIPT: ${message}`;
    globalDebugLogs.push(logEntry);
    console.log(logEntry);
    
    // Keep only last 100 logs
    if (globalDebugLogs.length > 100) {
      globalDebugLogs = globalDebugLogs.slice(-100);
    }
    
    localStorage.setItem('mockaverse_debug_logs', JSON.stringify(globalDebugLogs));
  } catch (e) {
    console.error('Debug log error:', e);
  }
}

// Kullanıcı bilgilerini navbar'da göster
function updateUserDisplay() {
  debugLog('Script.js - 🔍 Starting updateUserDisplay()');
  
  // Yeni session format'ını kontrol et
  const sessionToken = localStorage.getItem('mockaverse_session') || sessionStorage.getItem('mockaverse_session');
  const userInfo = localStorage.getItem('mockaverse_user') || sessionStorage.getItem('mockaverse_user');
  
  debugLog('Script.js - Session token exists: ' + !!sessionToken);
  debugLog('Script.js - User info exists: ' + !!userInfo);
  
  // Eski format'ı da kontrol et (backward compatibility)
  const oldLoggedIn = localStorage.getItem('mockverse_logged_in');
  const oldUser = localStorage.getItem('mockverse_user');
  
  // Yeni format'ta session var mı?
  if (sessionToken && userInfo) {
    try {
      debugLog('Script.js - Validating session token...');
      debugLog('Script.js - Token length: ' + sessionToken.length);
      debugLog('Script.js - Token preview: ' + sessionToken.substring(0, 50) + '...');
      
      // Session token'ı validate et (Base64 decode)
      const decodedToken = atob(sessionToken);
      debugLog('Script.js - Decoded token: ' + decodedToken);
      
      const [tokenData, signature] = decodedToken.split('.');
      debugLog('Script.js - Token data: ' + tokenData);
      
      const tokenPayload = JSON.parse(tokenData);
      debugLog('Script.js - Token payload: ' + JSON.stringify(tokenPayload));
      
      // Token süresi kontrol et
      if (tokenPayload.expiry && Date.now() > tokenPayload.expiry) {
        debugLog('Script.js - Session token expired');
        return false;
      }
      
      const user = JSON.parse(userInfo);
      debugLog('Script.js - User info: ' + JSON.stringify(user));
      
      // Kullanıcı adını navbar'da göster
      const userElement = document.getElementById('currentUser');
      if (userElement) {
        userElement.textContent = user.fullName || user.username;
      }
      
      debugLog('Script.js - ✅ Valid session found for user: ' + user.username);
      return true;
    } catch (error) {
      debugLog('Script.js - ❌ Session validation error: ' + error.message, 'ERROR');
      debugLog('Script.js - ❌ Error details: ' + error.message, 'ERROR');
      debugLog('Script.js - ❌ Stack trace: ' + error.stack, 'ERROR');
      return false;
    }
  }
  
  // Eski format'ta session var mı?
  if (oldLoggedIn === 'true' && oldUser) {
    // Kullanıcı adını navbar'da göster
    const userElement = document.getElementById('currentUser');
    if (userElement) {
      userElement.textContent = oldUser;
    }
    
    return true;
  }
  
  return false;
}

// Çıkış yapma fonksiyonu
function logout() {
  // Onay dialogu göster
  if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
    // Yeni session format'ını temizle
    localStorage.removeItem('mockaverse_session');
    sessionStorage.removeItem('mockaverse_session');
    localStorage.removeItem('mockaverse_user');
    sessionStorage.removeItem('mockaverse_user');
    
    // Eski format'ı da temizle (backward compatibility)
    localStorage.removeItem('mockverse_logged_in');
    localStorage.removeItem('mockverse_user');
    
    // Hatırla beni seçeneği işaretlenmişse kullanıcı adını sakla
    const rememberMe = localStorage.getItem('mockverse_remember_me');
    if (rememberMe !== 'true') {
      localStorage.removeItem('mockverse_username');
      localStorage.removeItem('mockverse_remember_me');
    }
    
    // Login sayfasına yönlendir
    window.location.href = 'login.html';
  }
}

// Sayfa yüklendiğinde authentication kontrolü
document.addEventListener('DOMContentLoaded', function() {
  debugLog('Script.js - 🚀 DOM Content Loaded');
  debugLog('Script.js - Current URL: ' + window.location.href);
  
  // Authentication kontrolü yap
  const authResult = updateUserDisplay();
  debugLog('Script.js - Auth result: ' + authResult);
  
  if (!authResult) {
    // Session yoksa login'e yönlendir
    debugLog('Script.js - ❌ No valid session found, redirecting to login');
    window.location.href = 'login.html';
    return;
  }
  
  debugLog('Script.js - ✅ Authentication successful, continuing...');
  
  console.log('DOM loaded, initializing application...');
  
  // Önce test ve demo senaryoları oluştur (localStorage'a güvenmek yerine)
  console.log('Varsayılan senaryolar oluşturuluyor...');
  const defaultScenarios = [
    {
      id: 1,
      name: 'Test Senaryosu',
      description: 'Bu bir örnek senaryo açıklamasıdır.',
      channel: '154 - Enpara Bireysel Cep Şubesi', // KANAL bilgisi güncellendi
      status: 1, // 1: aktif, 0: pasif (silinmiş)
      mockServices: [
        {
          serviceName: 'Kullanıcı Servisi',
          endpointUrl: '/api/users',
          responseData: `{
  "userId": 1,
  "username": "testuser",
  "email": "test@example.com"
}`
        }
      ]
    },
    {
      id: 2,
      name: 'Müşteri Bilgileri',
      description: 'Müşteri bilgilerini getiren mock servis',
      channel: '111 - Enpara Bireysel Internet', // KANAL bilgisi güncellendi
      status: 1,
      mockServices: [
        {
          serviceName: 'Müşteri Servisi',
          endpointUrl: '/api/customers',
          responseData: `{
  "customerId": 123,
  "name": "Test Müşteri",
  "email": "customer@example.com"
}`
        }
      ]
    },
    {
      id: 3,
      name: 'Ödeme İşlemleri',
      description: 'Ödeme işlemlerini gerçekleştiren mock servis',
      channel: '303 - Enpara Şirketim İnternet Şube', // KANAL bilgisi güncellendi
      status: 1,
      mockServices: [
        {
          serviceName: 'Ödeme Servisi',
          endpointUrl: '/api/payments',
          responseData: `{
  "paymentId": "PMT123",
  "status": "success",
  "amount": 100.50
}`
        }
      ]
    }
  ];
  
  // LocalStorage'dan verileri yükle - FAKAT önce varsayılan değerleri ayarla
  scenarios = defaultScenarios;
  console.log('Default scenarios yüklendi:', scenarios);
  
  const savedScenarios = localStorage.getItem('mockverse_scenarios');
  const savedRules = localStorage.getItem('mockverse_rules');
  
  if (savedScenarios) {
    try {
      const parsedScenarios = JSON.parse(savedScenarios);
      // Sadece eğer aktif senaryo varsa localStorage'dan yükle
      if (parsedScenarios && parsedScenarios.length > 0 && parsedScenarios.some(s => s.status !== 0)) {
        scenarios = parsedScenarios;
        console.log('LocalStorage\'dan senaryolar yüklendi:', scenarios);
      } else {
        console.log('LocalStorage\'dan yüklenen senaryolar boş veya aktif senaryo yok, varsayılanlar kullanılacak');
      }
    } catch (e) {
      console.error('LocalStorage\'dan senaryo yükleme hatası:', e);
    }
  }
  
  if (savedRules) {
    try {
      rules = JSON.parse(savedRules);
    } catch (e) {
      console.error('LocalStorage\'dan kural yükleme hatası:', e);
    }
  }
  
  // LocalStorage'a varsayılan senaryoları kaydet (ilk yükleme için)
  saveToLocalStorage();
  
  // Sayfa açıldığında senaryo ve kural listelerini güncelle
  updateScenarioList();
  updateRuleList();
  updateHeaderScenarioList();
  
  // Senaryo checkbox alanlarını görünür hale getir
  makeScenarioCheckboxesVisible();
  
  // New Rule modal işlemleri
  const newRuleModal = document.getElementById('newRuleModal');
  if (newRuleModal) {
    newRuleModal.addEventListener('show.bs.modal', function() {
      console.log('New rule modal is about to be shown');
      // Modal açılmadan önce form sıfırlanır
      document.getElementById('newRuleForm').reset();
      document.getElementById('scenarioValidationFeedback').classList.add('d-none');
    });
    
    newRuleModal.addEventListener('shown.bs.modal', function() {
      console.log('New rule modal is now visible, rendering checkboxes...');
      
      // Emin olmak için mevcut senaryoları kontrol et
      const activeScenarios = scenarios.filter(s => s.status !== 0);
      console.log('Aktif senaryolar:', activeScenarios);
      
      // scenarioCheckboxes konteyneri bul
      const container = document.getElementById('scenarioCheckboxes');
      if (!container) {
        console.error('scenarioCheckboxes container not found!');
        return;
      }
      
      // Eğer hiç senaryo yoksa, kullanıcıya uyarı göster
      if (!activeScenarios || activeScenarios.length === 0) {
        container.innerHTML = '<div class="alert alert-warning my-2">Henüz hiç senaryo tanımlanmamış. Önce senaryo eklemelisiniz!</div>';
        return;
      }
      
      // HTML tabanlı basit ve güvenilir yaklaşım kullan
      let checkboxHtml = '';
      
      // Her senaryo için checkbox oluştur
      activeScenarios.forEach(scenario => {
        checkboxHtml += `
          <div class="form-check py-2">
            <input class="form-check-input" type="checkbox" value="${scenario.id}" id="scenarioCheckbox_${scenario.id}">
            <label class="form-check-label" for="scenarioCheckbox_${scenario.id}">
              <strong>${scenario.name}</strong> <small class="text-muted">(ID: ${scenario.id})</small>
              <span class="small text-muted">${scenario.description || 'Açıklama yok'}</span>
            </label>
          </div>
        `;
      });
      
      // İçeriği ayarla
      container.innerHTML = checkboxHtml;
      
      // Debug için checkbox sayısını kontrol et
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      console.log('Rendered checkbox count:', checkboxes.length);
    });
  } else {
    console.error('newRuleModal element not found!');
  }
  
  // Edit Rule modal işlemleri 
  const editRuleModal = document.getElementById('editRuleModal');
  if (editRuleModal) {
    editRuleModal.addEventListener('hidden.bs.modal', function() {
      document.getElementById('editScenarioValidationFeedback').classList.add('d-none');
    });
  } else {
    console.error('editRuleModal element not found!');
  }
  
  // Mock servis ekleme butonuna tıklanınca
  document.getElementById('addMockServiceBtn').addEventListener('click', function() {
    // Yeni mock servis ekle
    mockServiceCount++;
    const newService = document.createElement('div');
    newService.className = 'card mb-3 service-card';
    newService.innerHTML = `
      <div class="card-body">
        <h6>Mock Servis #${mockServiceCount}</h6>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Servis Adı</label>
            <input type="text" class="form-control" name="serviceName" required>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">TransactionName</label>
            <input type="text" class="form-control" name="endpointUrl">
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Çıktı Şeması / Örnek Response</label>
          <textarea class="form-control" name="responseData" rows="5" required></textarea>
        </div>
        <button type="button" class="btn btn-danger btn-sm remove-service">Bu Servisi Sil</button>
      </div>
    `;
    document.getElementById('mockServicesContainer').appendChild(newService);
    
    // Servis silme olayını ekle
    newService.querySelector('.remove-service').addEventListener('click', function() {
      this.closest('.service-card').remove();
    });
  });
  
  // Düzenleme modal servisi ekleme
  document.getElementById('editAddMockServiceBtn').addEventListener('click', function() {
    const count = document.querySelectorAll('#editMockServicesContainer .service-card').length + 1;
    const newService = document.createElement('div');
    newService.className = 'card mb-3 service-card';
    newService.innerHTML = `
      <div class="card-body">
        <h6>Mock Servis #${count}</h6>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Servis Adı</label>
            <input type="text" class="form-control" name="editServiceName" required>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">TransactionName</label>
            <input type="text" class="form-control" name="editEndpointUrl">
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Çıktı Şeması / Örnek Response</label>
          <textarea class="form-control" name="editResponseData" rows="5" required></textarea>
        </div>
        <button type="button" class="btn btn-danger btn-sm remove-service">Bu Servisi Sil</button>
      </div>
    `;
    document.getElementById('editMockServicesContainer').appendChild(newService);
    
    // Servis silme olayını ekle
    newService.querySelector('.remove-service').addEventListener('click', function() {
      this.closest('.service-card').remove();
    });
  });
  
  // Mevcut servis silme butonlarına olay ekle
  document.querySelectorAll('.service-card .btn-danger').forEach(btn => {
    btn.addEventListener('click', function() {
      if (!this.classList.contains('remove-service')) return;
      this.closest('.service-card').remove();
    });
  });

  // Filtreleme butonlarını ayarla - DOM yüklendikten sonra bir kez bağla
  const applyFiltersBtn = document.getElementById('applyFiltersBtn');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
      console.log('Apply filters button clicked');
      filterScenarios();
    });
  } else {
    console.error('Apply filters button not found!');
  }
  
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      console.log('Clear filters button clicked');
      // Tüm filtre alanlarını temizle
      document.getElementById('filterScenarioName').value = '';
      document.getElementById('filterServiceName').value = '';
      document.getElementById('filterTransactionName').value = '';
      document.getElementById('filterChannel').value = '';
      
      // Filtreleri kaldır ve tüm senaryoları göster
      filterScenarios();
    });
  } else {
    console.error('Clear filters button not found!');
  }
  
  // Enter tuşuna basılınca filtreleme yap
  const filterInputs = [
    document.getElementById('filterScenarioName'),
    document.getElementById('filterServiceName'),
    document.getElementById('filterTransactionName')
  ];
  
  filterInputs.forEach(input => {
    if (input) {
      input.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
          console.log('Enter key pressed in filter input');
          filterScenarios();
        }
      });
    }
  });
  
  // KANAL filtresi için change event listener
  const channelFilter = document.getElementById('filterChannel');
  if (channelFilter) {
    channelFilter.addEventListener('change', function() {
      console.log('Channel filter changed');
      filterScenarios();
    });
  }

  // Sayfa başında senaryo listesini güncelle
  updateHeaderScenarioList();
});

// Form işleme fonksiyonları
async function saveScenario() {
  const form = document.getElementById('newScenarioForm');
  if (form.checkValidity()) {
    // Senaryo bilgilerini al
    const name = document.getElementById('scenarioName').value;
    const description = document.getElementById('scenarioDescription').value;
    const channel = document.getElementById('scenarioChannel').value;
    
    // Aynı isimde bir senaryo var mı kontrol et
    const existingScenario = scenarios.find(s => s.name.toLowerCase() === name.toLowerCase() && s.status !== 0);
    
    if (existingScenario) {
      alert(`Bu isimde bir senaryo zaten mevcut! (Senaryo ID: ${existingScenario.id})\nLütfen farklı bir isim giriniz.`);
      return;
    }
    
    // Mock servisleri al
    const mockServices = [];
    const serviceCards = document.querySelectorAll('#mockServicesContainer .service-card');
    
    serviceCards.forEach(card => {
      const serviceName = card.querySelector('[name="serviceName"]').value;
      const endpointUrl = card.querySelector('[name="endpointUrl"]').value;
      const responseData = card.querySelector('[name="responseData"]').value;
      
      mockServices.push({
        serviceName,
        endpointUrl,
        responseData
      });
    });
    
    try {
      // Database entegrasyonu aktif ise
      if (USE_DATABASE) {
        console.log('🗄️ Saving to database...');
        
        const scenarioData = {
          name,
          description,
          channel,
          mockServices
        };
        
        const result = await DatabaseAPI.saveScenario(scenarioData);
        
        if (result.success) {
          console.log('✅ Database save successful');
          
          // Yeni senaryo oluştur (DB'den dönen ID ile)
          const newScenario = {
            id: result.data.id,
            name,
            description,
            channel,
            status: 1,
            mockServices
          };
          
          // Senaryoyu diziye ekle
          scenarios.push(newScenario);
          
          alert('Senaryo başarıyla database\'e kaydedildi!');
        } else {
          console.log('⚠️ Database save failed, falling back to localStorage');
          throw new Error(result.error);
        }
      } else {
        throw new Error('Database disabled');
      }
    } catch (error) {
      console.log('⚠️ Using localStorage fallback:', error.message);
      
      // Fallback: localStorage kullan
      // Yeni ID hesapla (mevcut en büyük ID + 1)
      let maxId = 0;
      if (scenarios.length > 0) {
        maxId = Math.max(...scenarios.map(s => s.id));
      }
      const newId = maxId + 1;
      
      // Yeni senaryo oluştur
      const newScenario = {
        id: newId,
        name,
        description,
        channel,
        status: 1,
        mockServices
      };
      
      // Senaryoyu diziye ekle
      scenarios.push(newScenario);
      
      alert('Senaryo başarıyla localStorage\'a kaydedildi!');
    }
    
    // Senaryo listesini güncelle
    updateScenarioList();
    
    // Sayfa başında senaryo listesini güncelle
    updateHeaderScenarioList();
    
    // LocalStorage'a da kaydet (backup)
    saveToLocalStorage();
    
    // Formu sıfırla
    form.reset();
    mockServiceCount = 1;
    
    // Sadece ilk mock servis kalacak şekilde diğerlerini temizle
    const container = document.getElementById('mockServicesContainer');
    while (container.children.length > 1) {
      container.removeChild(container.lastChild);
    }
    
    // Modalı kapat
    const modal = bootstrap.Modal.getInstance(document.getElementById('newScenarioModal'));
    modal.hide();
  } else {
    form.reportValidity();
  }
}

function updateScenario() {
  const form = document.getElementById('editScenarioForm');
  if (form.checkValidity()) {
    const scenarioId = parseInt(document.getElementById('editScenarioId').value);
    const name = document.getElementById('editScenarioName').value;
    const description = document.getElementById('editScenarioDescription').value;
    const channel = document.getElementById('editScenarioChannel').value;
    
    // Kendisi dışında aynı isimde bir senaryo var mı kontrol et
    const existingScenario = scenarios.find(s => 
      s.name.toLowerCase() === name.toLowerCase() && 
      s.id !== scenarioId && 
      s.status !== 0
    );
    
    if (existingScenario) {
      alert(`Bu isimde bir senaryo zaten mevcut! (Senaryo ID: ${existingScenario.id})\nLütfen farklı bir isim giriniz.`);
      return;
    }
    
    // Mock servisleri al
    const mockServices = [];
    const serviceCards = document.querySelectorAll('#editMockServicesContainer .service-card');
    
    serviceCards.forEach(card => {
      const serviceName = card.querySelector('[name="editServiceName"]').value;
      const endpointUrl = card.querySelector('[name="editEndpointUrl"]').value;
      const responseData = card.querySelector('[name="editResponseData"]').value;
      
      mockServices.push({
        serviceName,
        endpointUrl,
        responseData
      });
    });
    
    // Senaryoyu bul ve güncelle
    const scenarioIndex = scenarios.findIndex(s => s.id === scenarioId);
    if (scenarioIndex !== -1) {
      scenarios[scenarioIndex] = {
        ...scenarios[scenarioIndex],
        name,
        description,
        channel, // Yeni eklenen KANAL bilgisi
        mockServices
      };
      
      // Senaryo listesini güncelle
      updateScenarioList();
      
      // Sayfa başında senaryo listesini güncelle
      updateHeaderScenarioList();
    }
    
    alert('Senaryo başarıyla güncellendi!');
    const modal = bootstrap.Modal.getInstance(document.getElementById('editScenarioModal'));
    modal.hide();
  } else {
    form.reportValidity();
  }
}

function confirmDelete(id, type = 'scenario') {
  let message, item;
  
  if (type === 'scenario') {
    id = parseInt(id);
    item = scenarios.find(s => s.id === id);
    message = `"${item?.name || id}" isimli senaryoyu pasif duruma getirmek istediğinizden emin misiniz?`;
  } else {
    item = rules.find(r => r.id === id);
    message = `"${item?.ruleValue || id}" kuralını silmek istediğinizden emin misiniz?`;
  }
  
  if (confirm(message)) {
    if (type === 'scenario') {
      // Senaryoyu silmek yerine statüsünü 0 yap
      const scenarioIndex = scenarios.findIndex(s => s.id === id);
      if (scenarioIndex !== -1) {
        scenarios[scenarioIndex].status = 0;
        alert(`${scenarios[scenarioIndex].name} senaryosu pasif duruma getirildi!`);
        updateScenarioList();
        updateHeaderScenarioList();
      }
    } else {
      rules = rules.filter(r => r.id !== id);
      updateRuleList();
      alert(`Kural başarıyla silindi!`);
    }
    
    // LocalStorage'a kaydet
    saveToLocalStorage();
  }
}

function editScenario(id) {
  id = parseInt(id);
  const scenario = scenarios.find(s => s.id === id);
  if (!scenario) return;
  
  // Form alanlarını doldur
  document.getElementById('editScenarioId').value = scenario.id;
  document.getElementById('editScenarioName').value = scenario.name;
  document.getElementById('editScenarioDescription').value = scenario.description;
  
  // KANAL bilgisini ayarla (mevcut ise)
  const channelSelect = document.getElementById('editScenarioChannel');
  if (channelSelect) {
    channelSelect.value = scenario.channel || '';
  }
  
  // Mock servisleri temizle
  const container = document.getElementById('editMockServicesContainer');
  container.innerHTML = '';
  
  // Mock servisleri ekle
  scenario.mockServices.forEach((service, index) => {
    const serviceCard = document.createElement('div');
    serviceCard.className = 'card mb-3 service-card';
    serviceCard.innerHTML = `
      <div class="card-body">
        <h6>Mock Servis #${index + 1}</h6>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Servis Adı</label>
            <input type="text" class="form-control" name="editServiceName" value="${service.serviceName}" required>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">TransactionName</label>
            <input type="text" class="form-control" name="editEndpointUrl" value="${service.endpointUrl}">
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Çıktı Şeması / Örnek Response</label>
          <textarea class="form-control" name="editResponseData" rows="5" required>${service.responseData}</textarea>
        </div>
        ${scenario.mockServices.length > 1 ? '<button type="button" class="btn btn-danger btn-sm remove-service">Bu Servisi Sil</button>' : ''}
      </div>
    `;
    container.appendChild(serviceCard);
  });
  
  // Servis silme olayını ekle
  document.querySelectorAll('#editMockServicesContainer .remove-service').forEach(btn => {
    btn.addEventListener('click', function() {
      this.closest('.service-card').remove();
    });
  });
  
  // Modal göster
  const modal = new bootstrap.Modal(document.getElementById('editScenarioModal'));
  modal.show();
}

// Senaryo listesini güncelleme
function updateScenarioList() {
  console.log('Senaryo listesi güncelleniyor...');
  
  // Aktif senaryoları filtrele
  const activeScenarios = scenarios.filter(s => s.status !== 0);
  console.log('Aktif senaryo sayısı:', activeScenarios.length);
  
  // Senaryo listesi tablosunu al
  const scenarioTableBody = document.getElementById('scenarioTableBody');
  if (!scenarioTableBody) {
    console.error('scenarioTableBody element not found!');
    return;
  }
  
  // Tablo içeriğini temizle
  scenarioTableBody.innerHTML = '';
  
  // Eğer hiç senaryo yoksa bilgi mesajı göster
  if (activeScenarios.length === 0) {
    scenarioTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-3">
          <div class="alert alert-info mb-0">
            <i class="bi bi-info-circle me-2"></i> Henüz hiç senaryo oluşturulmamış.
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  // Her senaryo için tablo satırı oluştur
  activeScenarios.forEach(scenario => {
    // Senaryo servis adlarını al
    const serviceNames = scenario.mockServices.map(s => s.serviceName).join(', ');
    const transactionNames = scenario.mockServices.map(s => s.endpointUrl).join(', ');
    
    // Yeni satır oluştur
    const row = document.createElement('tr');
    row.className = 'scenario-row';
    row.setAttribute('data-scenario-id', scenario.id);
    row.setAttribute('data-scenario-name', scenario.name.toLowerCase());
    row.setAttribute('data-service-names', serviceNames.toLowerCase());
    row.setAttribute('data-transaction-names', transactionNames.toLowerCase());
    row.setAttribute('data-channel', scenario.channel || '');
    
    // Satır içeriğini oluştur
    row.innerHTML = `
      <td>${scenario.id}</td>
      <td>${scenario.name}</td>
      <td>${serviceNames}</td>
      <td>${transactionNames}</td>
      <td>${scenario.channel || '-'}</td>
      <td>
        <div class="btn-group" role="group">
          <button type="button" class="btn btn-sm btn-primary edit-scenario" data-scenario-id="${scenario.id}">
            <i class="bi bi-pencil"></i>
          </button>
          <button type="button" class="btn btn-sm btn-danger delete-scenario" data-scenario-id="${scenario.id}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    // Satırı tabloya ekle
    scenarioTableBody.appendChild(row);
  });
  
  // Düzenleme ve silme butonları olaylarını ekle
  document.querySelectorAll('.edit-scenario').forEach(btn => {
    btn.addEventListener('click', function() {
      const scenarioId = parseInt(this.getAttribute('data-scenario-id'));
      editScenario(scenarioId);
    });
  });
  
  document.querySelectorAll('.delete-scenario').forEach(btn => {
    btn.addEventListener('click', function() {
      const scenarioId = parseInt(this.getAttribute('data-scenario-id'));
      deleteScenario(scenarioId);
    });
  });
  
  // Toplam senaryo sayısını güncelle
  const totalCountElement = document.getElementById('scenarioTotalCount');
  const visibleCountElement = document.getElementById('scenarioVisibleCount');
  
  if (totalCountElement) {
    totalCountElement.textContent = `Toplam: ${activeScenarios.length} senaryo`;
  }
  
  if (visibleCountElement) {
    visibleCountElement.textContent = `Görüntülenen: ${Math.min(5, activeScenarios.length)} senaryo`;
  }
  
  // Sayfalama oluştur
  setupScenarioPagination();
  
  // İlk sayfayı göster
  showScenarioPage(1);
}

// Senaryo sayfalarını ayarla
function setupScenarioPagination() {
  // Aktif senaryoları al
  const activeScenarios = scenarios.filter(s => s.status !== 0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(activeScenarios.length / itemsPerPage);
  
  // Pagination container'ı al
  const paginationContainer = document.getElementById('scenarioPagination');
  if (!paginationContainer) {
    console.error('scenarioPagination element not found!');
    return;
  }
  
  // Pagination HTML'ini oluştur
  let paginationHTML = `
    <nav aria-label="Senaryo sayfaları">
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item disabled" id="scenarioPrevPage">
          <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Önceki</a>
        </li>
        <li class="page-item active"><a class="page-link" href="#" data-page="1">1</a></li>
  `;
  
  // Eğer birden fazla sayfa varsa, diğer sayfaları ekle
  if (totalPages > 1) {
    for (let i = 2; i <= Math.min(totalPages, 5); i++) {
      paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
    }
    
    // Eğer 5'ten fazla sayfa varsa, "..." ve son sayfayı ekle
    if (totalPages > 5) {
      paginationHTML += `
        <li class="page-item disabled"><span class="page-link">...</span></li>
        <li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>
      `;
    }
  }
  
  // Sonraki butonu ekle
  paginationHTML += `
        <li class="page-item ${totalPages <= 1 ? 'disabled' : ''}" id="scenarioNextPage">
          <a class="page-link" href="#">Sonraki</a>
        </li>
      </ul>
    </nav>
  `;
  
  // Pagination HTML'ini container'a ekle
  paginationContainer.innerHTML = paginationHTML;
  
  // Sayfa bağlantıları için olayları ayarla
  setupScenarioPageEvents(totalPages);
  
  // Eğer toplam sayfa sayısı 1 veya daha az ise, sayfalama gizlenebilir
  if (totalPages <= 1) {
    // Pagination container'ı gizleme seçeneği (isteğe bağlı)
    // paginationContainer.style.display = 'none';
  } else {
    paginationContainer.style.display = '';
  }
  
  console.log(`Sayfalama oluşturuldu: ${totalPages} sayfa, ${activeScenarios.length} senaryo`);
}

// Belirli bir sayfa numarasını göster
function showScenarioPage(page) {
  const rows = document.querySelectorAll('#scenarioTableBody .scenario-row');
  const itemsPerPage = 5; // 10'dan 5'e düşürüldü
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  rows.forEach((row, index) => {
    if (index >= startIndex && index < endIndex) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
  
  // Görüntülenen senaryo sayısını güncelle
  const visibleCountElement = document.getElementById('scenarioVisibleCount');
  if (visibleCountElement) {
    const visibleCount = Math.min(itemsPerPage, rows.length - startIndex);
    visibleCountElement.textContent = `Görüntülenen: ${visibleCount} senaryo`;
  }
}

// Filtreleme işlemi - güncellenmiş versiyonu
function filterScenarios() {
  console.log('Filtreleme işlemi başlatılıyor...');
  
  // Filtre değerlerini al
  const scenarioNameFilter = document.getElementById('filterScenarioName').value.toLowerCase().trim();
  const serviceNameFilter = document.getElementById('filterServiceName').value.toLowerCase().trim();
  const transactionNameFilter = document.getElementById('filterTransactionName').value.toLowerCase().trim();
  const channelFilter = document.getElementById('filterChannel').value;
  
  console.log('Filtre değerleri:', {
    scenarioName: scenarioNameFilter,
    serviceName: serviceNameFilter,
    transactionName: transactionNameFilter,
    channel: channelFilter
  });
  
  // Tüm aktif senaryoları getir
  const activeScenarios = scenarios.filter(s => s.status !== 0);
  console.log('Filtreleme öncesi aktif senaryo sayısı:', activeScenarios.length);
  
  // Filtreleri uygula
  let filteredScenarios = activeScenarios;
  
  // Senaryo adı filtresi
  if (scenarioNameFilter) {
    filteredScenarios = filteredScenarios.filter(scenario => 
      scenario.name.toLowerCase().includes(scenarioNameFilter)
    );
    console.log('Senaryo adı filtresinden sonra kalan senaryo sayısı:', filteredScenarios.length);
  }
  
  // Servis adı filtresi
  if (serviceNameFilter) {
    filteredScenarios = filteredScenarios.filter(scenario => {
      // En az bir servis bu filtre ile eşleşmeli
      return scenario.mockServices.some(service => 
        service.serviceName.toLowerCase().includes(serviceNameFilter)
      );
    });
    console.log('Servis adı filtresinden sonra kalan senaryo sayısı:', filteredScenarios.length);
  }
  
  // TransactionName filtresi
  if (transactionNameFilter) {
    filteredScenarios = filteredScenarios.filter(scenario => {
      // En az bir servis bu filtre ile eşleşmeli
      return scenario.mockServices.some(service => 
        service.endpointUrl.toLowerCase().includes(transactionNameFilter)
      );
    });
    console.log('TransactionName filtresinden sonra kalan senaryo sayısı:', filteredScenarios.length);
  }
  
  // KANAL filtresi
  if (channelFilter) {
    filteredScenarios = filteredScenarios.filter(scenario => 
      scenario.channel === channelFilter
    );
    console.log('KANAL filtresinden sonra kalan senaryo sayısı:', filteredScenarios.length);
  }
  
  console.log('Filtre sonucunda toplam senaryo sayısı:', filteredScenarios.length);
  
  // Filtrelenmiş senaryolar ile senaryo listesini güncelle
  displayFilteredScenarios(filteredScenarios);
}

// Filtrelenmiş senaryoları göster - yeni fonksiyon
function displayFilteredScenarios(filteredScenarios) {
  const scenarioListBody = document.getElementById('scenarioTableBody');
  
  if (!scenarioListBody) {
    console.error('scenarioTableBody element not found!');
    return;
  }
  
  // Önce mevcut senaryoları temizle
  scenarioListBody.innerHTML = '';
  
  // Eğer filtrelenmiş senaryo yoksa bilgi mesajı göster
  if (filteredScenarios.length === 0) {
    scenarioListBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-3">
          <div class="alert alert-info mb-0">
            <i class="bi bi-info-circle me-2"></i> Filtrelere uygun senaryo bulunamadı.
          </div>
        </td>
      </tr>
    `;
    
    // Filtreleme sayılarını güncelle
    updateScenarioCounts(0, scenarios.filter(s => s.status !== 0).length);
    
    // Pagination'ı gizle veya "1 sayfa" olarak göster
    const paginationContainer = document.getElementById('scenarioPagination');
    if (paginationContainer) {
      paginationContainer.innerHTML = `
        <nav aria-label="Senaryo sayfaları">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item disabled" id="scenarioPrevPage">
              <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Önceki</a>
            </li>
            <li class="page-item active"><a class="page-link" href="#" data-page="1">1</a></li>
            <li class="page-item disabled" id="scenarioNextPage">
              <a class="page-link" href="#">Sonraki</a>
            </li>
          </ul>
        </nav>
      `;
    }
    return;
  }
  
  // Filtre sonuçlarını tabloya ekle
  filteredScenarios.forEach(scenario => {
    // Senaryo servis adlarını al
    const serviceNames = scenario.mockServices.map(s => s.serviceName).join(', ');
    const transactionNames = scenario.mockServices.map(s => s.endpointUrl).join(', ');
    
    // Yeni satır oluştur
    const row = document.createElement('tr');
    row.className = 'scenario-row';
    row.setAttribute('data-scenario-id', scenario.id);
    row.setAttribute('data-scenario-name', scenario.name.toLowerCase());
    row.setAttribute('data-service-names', serviceNames.toLowerCase());
    row.setAttribute('data-transaction-names', transactionNames.toLowerCase());
    row.setAttribute('data-channel', scenario.channel || '');
    
    // Satır içeriğini oluştur
    row.innerHTML = `
      <td>${scenario.id}</td>
      <td>${scenario.name}</td>
      <td>${serviceNames}</td>
      <td>${transactionNames}</td>
      <td>${scenario.channel || '-'}</td>
      <td>
        <div class="btn-group" role="group">
          <button type="button" class="btn btn-sm btn-primary edit-scenario" data-scenario-id="${scenario.id}">
            <i class="bi bi-pencil"></i>
          </button>
          <button type="button" class="btn btn-sm btn-danger delete-scenario" data-scenario-id="${scenario.id}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    // Satırı tabloya ekle
    scenarioListBody.appendChild(row);
  });
  
  // Düzenleme ve silme butonları olaylarını ekle
  document.querySelectorAll('#scenarioTableBody .edit-scenario').forEach(btn => {
    btn.addEventListener('click', function() {
      const scenarioId = parseInt(this.getAttribute('data-scenario-id'));
      editScenario(scenarioId);
    });
  });
  
  document.querySelectorAll('#scenarioTableBody .delete-scenario').forEach(btn => {
    btn.addEventListener('click', function() {
      const scenarioId = parseInt(this.getAttribute('data-scenario-id'));
      deleteScenario(scenarioId);
    });
  });
  
  // Filtreleme sayılarını güncelle
  updateScenarioCounts(filteredScenarios.length, scenarios.filter(s => s.status !== 0).length);
  
  // Sayfalama oluştur - filtrelenmiş senaryolar için
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredScenarios.length / itemsPerPage);
  
  // Pagination container'ı al
  const paginationContainer = document.getElementById('scenarioPagination');
  if (paginationContainer) {
    // Pagination HTML'ini oluştur
    let paginationHTML = `
      <nav aria-label="Senaryo sayfaları">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item disabled" id="scenarioPrevPage">
            <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Önceki</a>
          </li>
          <li class="page-item active"><a class="page-link" href="#" data-page="1">1</a></li>
    `;
    
    // Eğer birden fazla sayfa varsa, diğer sayfaları ekle
    if (totalPages > 1) {
      for (let i = 2; i <= Math.min(totalPages, 5); i++) {
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
      }
      
      // Eğer 5'ten fazla sayfa varsa, "..." ve son sayfayı ekle
      if (totalPages > 5) {
        paginationHTML += `
          <li class="page-item disabled"><span class="page-link">...</span></li>
          <li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>
        `;
      }
    }
    
    // Sonraki butonu ekle
    paginationHTML += `
          <li class="page-item ${totalPages <= 1 ? 'disabled' : ''}" id="scenarioNextPage">
            <a class="page-link" href="#">Sonraki</a>
          </li>
        </ul>
      </nav>
    `;
    
    // Pagination HTML'ini container'a ekle
    paginationContainer.innerHTML = paginationHTML;
  }
  
  // İlk sayfayı göster
  showScenarioPage(1);
  
  // Sayfa bağlantıları için olayları ayarla - filtrelenmiş senaryolar için
  setupScenarioPageEvents(totalPages);
  
  console.log(`Filtreleme sonucu: ${filteredScenarios.length} senaryo, ${totalPages} sayfa`);
}

// Sayfa bağlantıları için olayları ayarla (yeni fonksiyon)
function setupScenarioPageEvents(totalPages) {
  const pageLinks = document.querySelectorAll('#scenarioPagination .page-link[data-page]');
  const prevPageBtn = document.getElementById('scenarioPrevPage');
  const nextPageBtn = document.getElementById('scenarioNextPage');
  
  let currentPage = 1;
  
  // Sayfa bağlantıları için olayları ayarla
  pageLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = parseInt(this.getAttribute('data-page'));
      if (page) {
        showScenarioPage(page);
        
        // Aktif sayfayı güncelle
        document.querySelectorAll('#scenarioPagination .page-item').forEach(item => {
          item.classList.remove('active');
        });
        this.parentElement.classList.add('active');
        currentPage = page;
        
        // Önceki/Sonraki butonlarını güncelle
        prevPageBtn.classList.toggle('disabled', page === 1);
        nextPageBtn.classList.toggle('disabled', page === totalPages);
      }
    });
  });
  
  // Önceki sayfa butonu
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (currentPage > 1) {
        showScenarioPage(currentPage - 1);
        
        // Aktif sayfayı güncelle
        const newActivePage = document.querySelector(`#scenarioPagination .page-link[data-page="${currentPage - 1}"]`);
        if (newActivePage) {
          document.querySelectorAll('#scenarioPagination .page-item').forEach(item => {
            item.classList.remove('active');
          });
          newActivePage.parentElement.classList.add('active');
        }
        
        currentPage--;
        prevPageBtn.classList.toggle('disabled', currentPage === 1);
        nextPageBtn.classList.toggle('disabled', currentPage === totalPages);
      }
    });
  }
  
  // Sonraki sayfa butonu
  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (currentPage < totalPages) {
        showScenarioPage(currentPage + 1);
        
        // Aktif sayfayı güncelle
        const newActivePage = document.querySelector(`#scenarioPagination .page-link[data-page="${currentPage + 1}"]`);
        if (newActivePage) {
          document.querySelectorAll('#scenarioPagination .page-item').forEach(item => {
            item.classList.remove('active');
          });
          newActivePage.parentElement.classList.add('active');
        }
        
        currentPage++;
        prevPageBtn.classList.toggle('disabled', currentPage === 1);
        nextPageBtn.classList.toggle('disabled', currentPage === totalPages);
      }
    });
  }
}

// Sayaçları güncelle
function updateScenarioCounts(visibleCount, totalCount) {
  const totalCountElement = document.getElementById('scenarioTotalCount');
  const visibleCountElement = document.getElementById('scenarioVisibleCount');
  
  if (totalCountElement) {
    totalCountElement.textContent = `Toplam: ${totalCount} senaryo`;
  }
  
  if (visibleCountElement) {
    visibleCountElement.textContent = `Eşleşen: ${visibleCount} senaryo`;
  }
}

function saveRule() {
  console.log('saveRule() called');
  const form = document.getElementById('newRuleForm');
  const ruleValue = document.getElementById('ruleValue').value.trim();
  
  // Seçili senaryoları al
  const assignedScenarios = [];
  const checkboxes = document.querySelectorAll('#scenarioCheckboxes input[type="checkbox"]:checked');
  
  console.log(`Found ${checkboxes.length} selected scenarios`);
  
  checkboxes.forEach(checkbox => {
    assignedScenarios.push(parseInt(checkbox.value));
  });
  
  console.log('Assigned scenarios:', assignedScenarios);
  
  // Kural değerinin girildiğini kontrol et
  const ruleInfoValid = ruleValue !== '';
  
  // En az bir senaryonun seçildiğini kontrol et
  const scenariosValid = assignedScenarios.length > 0;
  
  // Validasyon feedback'lerini göster/gizle
  const scenarioValidationFeedback = document.getElementById('scenarioValidationFeedback');
  
  if (!scenariosValid) {
    scenarioValidationFeedback.classList.remove('d-none');
  } else {
    scenarioValidationFeedback.classList.add('d-none');
  }
  
  // Tüm validasyonlar geçtiyse formu kaydet
  if (ruleInfoValid && scenariosValid) {
    // Yeni kural oluştur
    const newRule = {
      id: 'rule-' + (rules.length + 1),
      ruleValue: ruleValue,
      assignedScenarios
    };
    
    console.log('Creating new rule:', newRule);
    
    // Kuralı diziye ekle
    rules.push(newRule);
    
    // Kural listesini güncelle
    updateRuleList();
    
    // LocalStorage'a kaydet
    saveToLocalStorage();
    
    // Formu sıfırla
    form.reset();
    scenarioValidationFeedback.classList.add('d-none');
    
    alert('Kural başarıyla kaydedildi!');
    const modal = bootstrap.Modal.getInstance(document.getElementById('newRuleModal'));
    modal.hide();
  } else if (!ruleInfoValid) {
    alert('Lütfen kural değerini giriniz.');
  } else if (!scenariosValid) {
    alert('Lütfen en az bir senaryo seçiniz.');
  }
}

function updateRule() {
  const form = document.getElementById('editRuleForm');
  const ruleId = document.getElementById('editRuleId').value;
  const ruleValue = document.getElementById('editRuleValue').value.trim();
  
  // Seçili senaryoları al
  const assignedScenarios = [];
  const checkboxes = document.querySelectorAll('#editScenarioCheckboxes input[type="checkbox"]:checked');
  
  checkboxes.forEach(checkbox => {
    assignedScenarios.push(parseInt(checkbox.value));
  });
  
  // Kural değerinin girildiğini kontrol et
  const ruleInfoValid = ruleValue !== '';
  
  // En az bir senaryonun seçildiğini kontrol et
  const scenariosValid = assignedScenarios.length > 0;
  
  // Validasyon feedback'lerini göster/gizle
  const scenarioValidationFeedback = document.getElementById('editScenarioValidationFeedback');
  
  if (!scenariosValid) {
    scenarioValidationFeedback.classList.remove('d-none');
  } else {
    scenarioValidationFeedback.classList.add('d-none');
  }
  
  // Tüm validasyonlar geçtiyse formu kaydet
  if (ruleInfoValid && scenariosValid) {
    // Kuralı bul ve güncelle
    const ruleIndex = rules.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
      rules[ruleIndex] = {
        ...rules[ruleIndex],
        ruleValue: ruleValue,
        assignedScenarios
      };
      
      // Kural listesini güncelle
      updateRuleList();
      
      // LocalStorage'a kaydet
      saveToLocalStorage();
    }
    
    scenarioValidationFeedback.classList.add('d-none');
    alert('Kural başarıyla güncellendi!');
    const modal = bootstrap.Modal.getInstance(document.getElementById('editRuleModal'));
    modal.hide();
  } else if (!ruleInfoValid) {
    alert('Lütfen kural değerini giriniz.');
  }
}

function editRule(id) {
  console.log(`Editing rule with ID: ${id}`);
  const rule = rules.find(r => r.id === id);
  
  if (!rule) {
    console.error(`Rule with ID ${id} not found!`);
    return;
  }
  
  console.log(`Found rule:`, rule);
  
  // Modal element
  const modalElement = document.getElementById('editRuleModal');
  if (!modalElement) {
    console.error('Edit rule modal not found!');
    return;
  }
  
  // Önce form değerlerini ayarla
  document.getElementById('editRuleId').value = rule.id;
  document.getElementById('editRuleValue').value = rule.ruleValue;
  
  // Modalı göster
  const modal = new bootstrap.Modal(modalElement);
  
  // Modal gösterilmeden önce bir olay dinleyicisi ekle (tek seferlik)
  modalElement.addEventListener('shown.bs.modal', function onModalShown() {
    console.log('Edit rule modal shown, rendering checkboxes...');
    
    // Debug bilgileri ekle
    console.log('Edit modal - Active scenarios check:', scenarios.filter(s => s.status !== 0));
    console.log('Edit modal - editScenarioCheckboxes element exists:', !!document.getElementById('editScenarioCheckboxes'));
    
    // Manuel olarak editScenarioCheckboxes içeriğini doldur
    const container = document.getElementById('editScenarioCheckboxes');
    if (container) {
      // Aktif senaryoları filtrele
      const activeScenarios = scenarios.filter(s => s.status !== 0);
      console.log('Edit modal - Aktif senaryolar:', activeScenarios);
      console.log('Edit modal - Seçili senaryolar:', rule.assignedScenarios);
      
      // Eğer hiç senaryo yoksa, kullanıcıya uyarı göster
      if (!activeScenarios || activeScenarios.length === 0) {
        container.innerHTML = '<div class="alert alert-warning my-2">Henüz hiç senaryo tanımlanmamış. Önce senaryo eklemelisiniz!</div>';
        return;
      }
      
      // HTML tabanlı basit ve güvenilir yaklaşım kullan
      let checkboxHtml = '';
      
      // Her senaryo için checkbox oluştur
      activeScenarios.forEach(scenario => {
        const isChecked = rule.assignedScenarios && rule.assignedScenarios.includes(scenario.id);
        checkboxHtml += `
          <div class="form-check py-2">
            <input class="form-check-input" type="checkbox" value="${scenario.id}" 
                   id="editScenarioCheckbox_${scenario.id}" ${isChecked ? 'checked' : ''}>
            <label class="form-check-label" for="editScenarioCheckbox_${scenario.id}">
              <strong>${scenario.name}</strong> <small class="text-muted">(ID: ${scenario.id})</small>
              <span class="small text-muted">${scenario.description || 'Açıklama yok'}</span>
            </label>
          </div>
        `;
      });
      
      // İçeriği ayarla
      container.innerHTML = checkboxHtml;
      
      // Debug için checkbox sayısını kontrol et
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      console.log('Edit modal - Rendered checkbox count:', checkboxes.length);
    } else {
      console.error('editScenarioCheckboxes container not found!');
    }
    
    // Olay dinleyicisini kaldır (bir sonraki için yeniden eklenmesi gerekecek)
    modalElement.removeEventListener('shown.bs.modal', onModalShown);
  });
  
  // Modalı göster
  modal.show();
}

function updateRuleList() {
  const ruleContainer = document.getElementById('ruleList');
  
  // rules'un dizi olduğundan emin ol
  if (!Array.isArray(rules)) {
    console.error('updateRuleList: rules bir dizi değil, boş dizi kullanılacak');
    rules = [];
  }
  
  if (rules.length === 0) {
    ruleContainer.innerHTML = `
      <div class="alert alert-info">
        Henüz hiç kural tanımlanmamış. Yeni bir kural ekleyin.
      </div>
    `;
    return;
  }
  
  // Filtreleme butonlarını ayarla
  const applyRuleFilterBtn = document.getElementById('applyRuleFilterBtn');
  const clearRuleFilterBtn = document.getElementById('clearRuleFilterBtn');
  const filterRuleInput = document.getElementById('filterRuleText');
  
  if (applyRuleFilterBtn) {
    applyRuleFilterBtn.addEventListener('click', filterRules);
  }
  
  if (clearRuleFilterBtn) {
    clearRuleFilterBtn.addEventListener('click', function() {
      // Filtre alanını temizle
      if (filterRuleInput) {
        filterRuleInput.value = '';
      }
      
      // Filtreleri kaldır ve tüm kuralları göster
      filterRules();
    });
  }
  
  if (filterRuleInput) {
    filterRuleInput.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        filterRules();
      }
    });
  }
  
  renderRuleList(rules);
  
  // LocalStorage'a kaydet
  saveToLocalStorage();
}

// Kuralları filtreleme fonksiyonu
function filterRules() {
  const filterText = document.getElementById('filterRuleText')?.value.toLowerCase() || '';
  
  if (!filterText) {
    // Filtre yoksa tüm kuralları göster
    renderRuleList(rules);
    return;
  }
  
  // Kurallarda arama yap
  const filteredRules = rules.filter(rule => {
    // Kural metninde arama yap
    if (rule.ruleValue.toLowerCase().includes(filterText)) {
      return true;
    }
    
    // Atanan senaryoların isimlerinde arama yap
    const assignedScenarios = rule.assignedScenarios || [];
    const matchingScenarios = assignedScenarios.some(id => {
      const scenario = scenarios.find(s => s.id === id && s.status !== 0);
      return scenario && scenario.name.toLowerCase().includes(filterText);
    });
    
    return matchingScenarios;
  });
  
  // Filtrelenmiş kuralları göster
  renderRuleList(filteredRules, filterText);
}

// Kural listesini render eden fonksiyon
function renderRuleList(rulesToRender, filterText = '') {
  const ruleContainer = document.getElementById('ruleList');
  
  if (!rulesToRender || rulesToRender.length === 0) {
    if (filterText) {
      ruleContainer.innerHTML = `
        <div class="alert alert-warning">
          "${filterText}" içeren kural bulunamadı.
        </div>
      `;
    } else {
      ruleContainer.innerHTML = `
        <div class="alert alert-info">
          Henüz hiç kural tanımlanmamış. Yeni bir kural ekleyin.
        </div>
      `;
    }
    return;
  }
  
  let html = '<div class="row">';
  
  rulesToRender.forEach(rule => {
    // Atanan senaryoları bul (sadece aktif olanları)
    const assignedScenarioNames = rule.assignedScenarios.map(id => {
      const scenario = scenarios.find(s => s.id === id && s.status !== 0);
      return scenario ? scenario.name : null;
    }).filter(name => name !== null); // Null değerleri filtrele
    
    let scenarioListHtml = '';
    if (assignedScenarioNames.length > 0) {
      scenarioListHtml = `
        <ul class="list-group list-group-flush">
          ${assignedScenarioNames.map(name => `<li class="list-group-item py-1">${name}</li>`).join('')}
        </ul>
      `;
    } else {
      scenarioListHtml = '<p class="text-muted mb-0">Atanmış senaryo yok</p>';
    }
    
    // HTML karakterlerini escape et
    const escapedRuleValue = escapeHtml(rule.ruleValue);
    
    // Filtre metni varsa vurgula
    let highlightedRuleValue = escapedRuleValue;
    if (filterText) {
      const regex = new RegExp(`(${filterText})`, 'gi');
      highlightedRuleValue = escapedRuleValue.replace(regex, '<mark>$1</mark>');
    }
    
    html += `
      <div class="col-md-6 col-lg-4 mb-3 rule-card" data-rule-id="${rule.id}" data-rule-text="${escapedRuleValue.toLowerCase()}">
        <div class="card h-100">
          <div class="card-header">
            <span class="fw-bold"><i class="bi bi-filter-square"></i> Kural</span>
          </div>
          <div class="card-body p-3">
            <div class="mb-3 p-2 bg-light rounded xml-content">
              <code class="xml-code" style="white-space: pre-wrap; word-break: break-word;">${highlightedRuleValue}</code>
            </div>
            <h6 class="border-bottom pb-2 mb-2"><i class="bi bi-list-check"></i> Atanan Senaryolar</h6>
            ${scenarioListHtml}
          </div>
          <div class="card-footer bg-transparent">
            <div class="d-flex justify-content-end">
              <button class="btn btn-info btn-sm me-2" onclick="editRule('${rule.id}')">
                <i class="bi bi-pencil"></i> Düzenle
              </button>
              <button class="btn btn-danger btn-sm" onclick="confirmDelete('${rule.id}', 'rule')">
                <i class="bi bi-trash"></i> Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  // Filtreleme sonuçları bilgisi
  if (filterText) {
    const totalRules = rules.length;
    const filteredCount = rulesToRender.length;
    
    html = `
      <div class="alert alert-info mb-3">
        <i class="bi bi-info-circle"></i> 
        "${filterText}" için ${filteredCount} kural bulundu (toplam: ${totalRules} kural)
      </div>
    ` + html;
  }
  
  ruleContainer.innerHTML = html;
  
  // XML içeriğine özel stil ekleyin
  addXmlStyles();
}

// XML stil ekleme fonksiyonu
function addXmlStyles() {
  // Stil zaten varsa ekleme
  if (document.getElementById('xml-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'xml-styles';
  style.textContent = `
    .xml-content {
      font-family: "Consolas", "Monaco", "Courier New", monospace;
      font-size: 14px;
      line-height: 1.5;
      background-color: #f8f9fa;
    }
    .xml-code {
      color: #333;
      display: block;
    }
    .xml-code .tag {
      color: #0000ff;
    }
    .xml-code .attr {
      color: #7a0055;
    }
    .xml-code .string {
      color: #2a00ff;
    }
  `;
  document.head.appendChild(style);
}

// HTML karakterlerini escape et
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function makeScenarioCheckboxesVisible() {
  console.log("Fonksiyon çağrıldı: makeScenarioCheckboxesVisible");
  
  // Senaryo checkbox alanları için bir stil ekleyelim
  const style = document.createElement('style');
  style.textContent = `
    #scenarioCheckboxes, #editScenarioCheckboxes {
      border: 1px solid #ddd;
      background-color: #f8f9fa;
      padding: 10px;
      max-height: 200px;
      overflow-y: auto;
    }
    .form-check {
      margin-bottom: 6px;
      padding: 5px 10px;
      border-bottom: 1px solid #efefef;
      display: flex;
      align-items: flex-start;
    }
    .form-check:last-child {
      border-bottom: none;
    }
    .form-check-input {
      margin-top: 0.3em;
      margin-right: 8px;
      flex-shrink: 0;
    }
    .form-check-label {
      margin-left: 4px;
      flex-grow: 1;
    }
    .form-check .small {
      display: block;
      margin-top: 2px;
    }
    /* Ana sayfa senaryo listesi için stil */
    #headerScenarioList .table-responsive {
      max-height: 250px;
      overflow-y: auto;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }
    #headerScenarioList table {
      margin-bottom: 0;
    }
    #headerScenarioList thead {
      position: sticky;
      top: 0;
      background-color: #fff;
      z-index: 1;
    }
    #headerScenarioList thead th {
      border-bottom: 2px solid #dee2e6;
    }
    /* Ana senaryo listesi tablosu için stil */
    #scenarioList .table-responsive {
      max-height: 350px;
      overflow-y: auto;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }
    #scenarioList table {
      margin-bottom: 0;
    }
    #scenarioList thead {
      position: sticky;
      top: 0;
      background-color: #fff;
      z-index: 1;
    }
    #scenarioList thead th {
      border-bottom: 2px solid #dee2e6;
    }
    /* Sayfalama için sarı renk */
    .pagination .page-link[data-page] {
      color: #108206 !important;
    }
    .pagination .page-item.active .page-link {
      background-color: #343a40;
      border-color: #343a40;
    }
  `;
  document.head.appendChild(style);
}

// Modal kapatma fonksiyonu
function closeAddRuleModal() {
  console.log('closeAddRuleModal() çağrıldı');
  try {
    const modalElement = document.getElementById('addRuleForScenarioModal');
    if (!modalElement) {
      console.error('Modal elementi bulunamadı!');
      return;
    }
    
    // Method 1: Bootstrap Modal
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      console.log('Bootstrap Modal API kullanılıyor...');
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        console.log('Modal instance bulundu, kapatılıyor...');
        modal.hide();
        return;
      }
    }
    
    // Method 2: jQuery
    if (typeof jQuery !== 'undefined') {
      console.log('jQuery kullanılıyor...');
      try {
        jQuery(modalElement).modal('hide');
        return;
      } catch (e) {
        console.error('jQuery modal hide hatası:', e);
      }
    }
    
    // Method 3: Direct DOM manipulation
    console.log('DOM manipülasyonu kullanılıyor...');
    modalElement.classList.remove('show');
    modalElement.style.display = 'none';
    document.body.classList.remove('modal-open');
    
    // Backdrop kaldırma
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  } catch (error) {
    console.error('Modal kapatma hatası:', error);
    logError('Modal kapatma hatası', error);
  }
}

// Senaryo için kural ekleme fonksiyonu
function addRuleForScenario(scenarioId) {
  console.log('addRuleForScenario() çağrıldı, senaryo ID:', scenarioId);
  
  // İlgili senaryoyu bul
  const scenario = scenarios.find(s => s.id === scenarioId);
  if (!scenario) {
    console.error('Senaryo bulunamadı:', scenarioId);
    return;
  }
  
  // Formu sıfırla
  document.getElementById('addRuleForScenarioForm').reset();
  document.getElementById('ruleDefinitionFeedback').classList.add('d-none');
  
  // Modal başlığını ve senaryo bilgisini güncelle
  document.getElementById('addRuleForScenarioLabel').textContent = `Kural - Senaryo Eşleştir`;
  document.getElementById('ruleScenarioId').value = scenarioId;
  document.getElementById('ruleScenarioName').textContent = scenario.name;
  
  // Modal'ı manuel olarak aç
  const modalElement = document.getElementById('addRuleForScenarioModal');
  modalElement.addEventListener('shown.bs.modal', function() {
    document.getElementById('ruleDefinition').focus();
  }, { once: true });
  
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

// Log fonksiyonu
function logError(message, error = null, data = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    message: message,
    error: error ? { name: error.name, message: error.message, stack: error.stack } : null,
    data: data
  };
  
  console.error('HATA LOGU:', logEntry);
  
  // Mevcut logları al
  let logs = localStorage.getItem('mockverse_error_logs') || '[]';
  try {
    logs = JSON.parse(logs);
  } catch (e) {
    logs = [];
  }
  
  // Yeni logu ekle
  logs.push(logEntry);
  
  // Logları kaydet
  localStorage.setItem('mockverse_error_logs', JSON.stringify(logs));
  
  // Text dosyaya logları yaz
  try {
    const logText = `
===== HATA LOGU (${new Date().toLocaleString()}) =====
Mesaj: ${message}
${error ? `Hata: ${error.name} - ${error.message}
Stack: ${error.stack}` : ''}
${data ? `Veri: ${JSON.stringify(data, null, 2)}` : ''}
=======================================
`;
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mockverse-error-log-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Log dosyası oluşturulamadı:', e);
  }
}

// Senaryo için kural kaydetme fonksiyonu
function saveRuleForScenario() {
  console.log('saveRuleForScenario() çağrıldı');
  
  try {
    // Form değerlerini al
    const scenarioIdElement = document.getElementById('ruleScenarioId');
    const ruleDefinitionElement = document.getElementById('ruleDefinition');
    
    if (!scenarioIdElement) {
      throw new Error('ruleScenarioId elementi bulunamadı');
    }
    
    if (!ruleDefinitionElement) {
      throw new Error('ruleDefinition elementi bulunamadı');
    }
    
    const scenarioIdValue = scenarioIdElement.value;
    const scenarioId = parseInt(scenarioIdValue);
    const ruleText = ruleDefinitionElement.value.trim();
    
    // Debug bilgileri
    const debugData = {
      scenarioIdElement: scenarioIdElement ? true : false,
      ruleDefinitionElement: ruleDefinitionElement ? true : false,
      scenarioIdValue: scenarioIdValue,
      scenarioId: scenarioId,
      ruleText: ruleText,
      ruleScenarioNameContent: document.getElementById('ruleScenarioName') ? document.getElementById('ruleScenarioName').textContent : 'bulunamadı',
      modalElement: document.getElementById('addRuleForScenarioModal') ? true : false,
      currentRulesCount: rules ? (Array.isArray(rules) ? rules.length : 'rules dizisi değil') : 'rules undefined',
      rulesType: typeof rules,
      rulesIsArray: Array.isArray(rules)
    };
    
    console.log('Debug bilgileri:', debugData);
    
    // Validasyon
    if (!ruleText) {
      const feedbackElement = document.getElementById('ruleDefinitionFeedback');
      if (feedbackElement) {
        feedbackElement.classList.remove('d-none');
      }
      logError('Kural metni boş', null, debugData);
      return false;
    }
    
    if (isNaN(scenarioId)) {
      logError('Geçersiz senaryo ID', null, debugData);
      alert('Geçersiz senaryo ID');
      return false;
    }
    
    // Senaryo var mı kontrol et
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      logError(`Senaryo bulunamadı (ID: ${scenarioId})`, null, debugData);
      alert(`Senaryo bulunamadı (ID: ${scenarioId})`);
      return false;
    }
    
    // rules değişkeninin dizi olduğundan emin ol
    if (!Array.isArray(rules)) {
      console.error('rules bir dizi değil, yeni bir dizi oluşturuluyor', rules);
      rules = [];
    }
    
    // Benzersiz ID oluştur
    const ruleId = 'rule-' + Date.now();
    
    // Yeni kural oluştur
    const newRule = {
      id: ruleId,
      ruleValue: ruleText,
      assignedScenarios: [scenarioId]
    };
    
    // Kuralı ekle
    rules.push(newRule);
    
    // LocalStorage'a kaydet
    saveToLocalStorage();
    
    // Kural listesini güncelle
    updateRuleList();
    
    // Modalı kapat
    closeAddRuleModal();
    
    // Başarı mesajı
    setTimeout(() => {
      alert('Kural başarıyla eklendi!');
    }, 300);
    
    return true;
  } catch (error) {
    // Hatayı logla
    logError('Kural kaydetme hatası', error, {
      forms: {
        addRuleForScenarioForm: document.getElementById('addRuleForScenarioForm') ? true : false,
        ruleScenarioId: document.getElementById('ruleScenarioId') ? document.getElementById('ruleScenarioId').value : 'bulunamadı',
        ruleDefinition: document.getElementById('ruleDefinition') ? document.getElementById('ruleDefinition').value : 'bulunamadı'
      },
      modal: document.getElementById('addRuleForScenarioModal') ? true : false,
      modals: {
        bootstrap: typeof bootstrap !== 'undefined',
        Modal: typeof bootstrap !== 'undefined' && typeof bootstrap.Modal !== 'undefined'
      },
      dataState: {
        scenariosLength: scenarios.length,
        rulesLength: rules ? (Array.isArray(rules) ? rules.length : 'rules dizisi değil') : 'rules undefined',
        rulesType: typeof rules,
        rulesIsArray: Array.isArray(rules)
      }
    });
    
    alert('Kural kaydedilirken bir hata oluştu. Detaylar konsola kaydedildi ve log dosyası indirildi.');
    return false;
  }
}

function renderScenarioCheckboxes(containerId, selectedIds = []) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }
  
  console.log(`Rendering scenario checkboxes to container: ${containerId}`);
  console.log(`Selected IDs:`, selectedIds);
  console.log(`Available scenarios:`, scenarios);
  
  // Container içeriğini temizle
  container.innerHTML = '';
  
  // Varsayılan senaryo kontrolü - scenarios dizisi boşsa veya aktif senaryo yoksa varsayılan bir senaryo ekle
  if (!scenarios || scenarios.length === 0) {
    console.log('Scenarios dizisi boş, varsayılan senaryo ekleniyor...');
    scenarios = [
      {
        id: 1,
        name: 'Test Senaryosu',
        description: 'Bu bir örnek senaryo açıklamasıdır.',
        status: 1,
        mockServices: [
          {
            serviceName: 'Kullanıcı Servisi',
            endpointUrl: '/api/users',
            responseData: `{
  "userId": 1,
  "username": "testuser",
  "email": "test@example.com"
}`
          }
        ]
      },
      {
        id: 2,
        name: 'Müşteri Bilgileri',
        description: 'Müşteri bilgilerini getiren mock servis',
        status: 1,
        mockServices: [
          {
            serviceName: 'Müşteri Servisi',
            endpointUrl: '/api/customers',
            responseData: `{
  "customerId": 123,
  "name": "Test Müşteri",
  "email": "customer@example.com"
}`
          }
        ]
      }
    ];
    
    // LocalStorage'a kaydet
    saveToLocalStorage();
    
    // Senaryo listesini güncelle
    updateScenarioList();
  }
  
  // Sadece aktif senaryoları göster
  const activeScenarios = scenarios.filter(s => s.status !== 0);
  
  console.log(`Found ${activeScenarios.length} active scenarios to render`);
  
  if (activeScenarios.length === 0) {
    container.innerHTML = '<p class="text-center text-muted my-3">Henüz hiç senaryo tanımlanmamış.</p>';
    return;
  }
  
  // Arama alanı ekle
  const searchDiv = document.createElement('div');
  searchDiv.className = 'mb-2';
  searchDiv.innerHTML = `
    <div class="input-group input-group-sm">
      <input type="text" class="form-control form-control-sm checkbox-search-input" 
             placeholder="Senaryo adına göre ara..." data-container="${containerId}">
      <button class="btn btn-outline-secondary btn-sm checkbox-search-btn" type="button" 
              data-container="${containerId}">
        <i class="bi bi-search"></i>
      </button>
    </div>
  `;
  container.appendChild(searchDiv);
  
  // Checkbox'ları container içinde kaydırılabilir bir div içine yerleştir
  const checkboxesContainer = document.createElement('div');
  checkboxesContainer.id = `${containerId}_checkboxes`;
  checkboxesContainer.style.maxHeight = '200px';
  checkboxesContainer.style.overflowY = 'auto';
  checkboxesContainer.style.border = '1px solid #dee2e6';
  checkboxesContainer.style.borderRadius = '4px';
  checkboxesContainer.style.padding = '8px';
  container.appendChild(checkboxesContainer);
  
  // Senaryoları container'a ekle
  activeScenarios.forEach(scenario => {
    const isChecked = selectedIds && selectedIds.includes(scenario.id);
    console.log(`Scenario ${scenario.id} checked: ${isChecked}`);
    
    const checkbox = document.createElement('div');
    checkbox.className = 'form-check py-1 checkbox-item';
    checkbox.setAttribute('data-scenario-id', scenario.id);
    checkbox.setAttribute('data-scenario-name', scenario.name.toLowerCase());
    checkbox.innerHTML = `
      <input class="form-check-input" type="checkbox" value="${scenario.id}" id="${containerId}_${scenario.id}" ${isChecked ? 'checked' : ''}>
      <label class="form-check-label" for="${containerId}_${scenario.id}">
        <strong>${scenario.name}</strong> <small class="text-muted">(ID: ${scenario.id})</small>
        <span class="small text-muted">${scenario.description || 'Açıklama yok'}</span>
      </label>
    `;
    checkboxesContainer.appendChild(checkbox);
  });
  
  // Sayfalama ekle (20'den fazla senaryo varsa)
  if (activeScenarios.length > 20) {
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'd-flex justify-content-between align-items-center mt-2';
    
    const totalPages = Math.ceil(activeScenarios.length / 20);
    
    paginationDiv.innerHTML = `
      <div class="text-muted small">
        <span>Toplam: ${activeScenarios.length} senaryo</span>
      </div>
      <div class="pagination-container">
        <nav aria-label="Senaryo sayfaları">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item disabled" id="${containerId}_prevPage">
              <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Önceki</a>
            </li>
            <li class="page-item active"><a class="page-link" href="#" data-page="1" data-container="${containerId}">1</a></li>
            ${totalPages > 1 ? Array.from({length: Math.min(totalPages - 1, 2)}, (_, i) => 
              `<li class="page-item"><a class="page-link" href="#" data-page="${i + 2}" data-container="${containerId}">${i + 2}</a></li>`
            ).join('') : ''}
            ${totalPages > 3 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            ${totalPages > 3 ? `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}" data-container="${containerId}">${totalPages}</a></li>` : ''}
            <li class="page-item ${totalPages <= 1 ? 'disabled' : ''}" id="${containerId}_nextPage">
              <a class="page-link" href="#">Sonraki</a>
            </li>
          </ul>
        </nav>
      </div>
    `;
    
    container.appendChild(paginationDiv);
    
    // Sayfalama olayları
    setupCheckboxPagination(containerId, totalPages);
    
    // İlk sayfayı göster
    showCheckboxPage(containerId, 1);
  }
  
  // Arama işlevini ekle
  const searchInput = searchDiv.querySelector('.checkbox-search-input');
  const searchBtn = searchDiv.querySelector('.checkbox-search-btn');
  
  const filterCheckboxes = (targetContainerId) => {
    const searchTermValue = searchInput.value.toLowerCase();
    const checkboxes = document.querySelectorAll(`#${targetContainerId}_checkboxes .checkbox-item`);
    
    let visibleCount = 0;
    
    checkboxes.forEach(checkbox => {
      const scenarioName = checkbox.getAttribute('data-scenario-name');
      if (scenarioName.includes(searchTermValue)) {
        checkbox.style.display = '';
        visibleCount++;
      } else {
        checkbox.style.display = 'none';
      }
    });
    
    // Sayfalama gizle/göster
    const paginationContainer = document.querySelector(`#${targetContainerId} .pagination-container`);
    if (paginationContainer) {
      paginationContainer.style.display = searchTermValue ? 'none' : '';
    }
  };
  
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      filterCheckboxes(containerId);
    }
  });
  
  searchBtn.addEventListener('click', () => {
    filterCheckboxes(containerId);
  });
}

// Checkbox sayfalama olaylarını ayarla
function setupCheckboxPagination(containerId, totalPages) {
  const pageLinks = document.querySelectorAll(`#${containerId} .page-link[data-page][data-container="${containerId}"]`);
  const prevPageBtn = document.getElementById(`${containerId}_prevPage`);
  const nextPageBtn = document.getElementById(`${containerId}_nextPage`);
  
  let currentPage = 1;
  
  // Sayfa bağlantıları için olayları ayarla
  pageLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = parseInt(this.getAttribute('data-page'));
      if (page) {
        showCheckboxPage(containerId, page);
        
        // Aktif sayfayı güncelle
        document.querySelectorAll(`#${containerId} .page-item`).forEach(item => {
          item.classList.remove('active');
        });
        this.parentElement.classList.add('active');
        currentPage = page;
        
        // Önceki/Sonraki butonlarını güncelle
        prevPageBtn.classList.toggle('disabled', page === 1);
        nextPageBtn.classList.toggle('disabled', page === totalPages);
      }
    });
  });
  
  // Önceki sayfa butonu
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (currentPage > 1) {
        showCheckboxPage(containerId, currentPage - 1);
        
        // Aktif sayfayı güncelle
        const newActivePage = document.querySelector(`#${containerId} .page-link[data-page="${currentPage - 1}"][data-container="${containerId}"]`);
        if (newActivePage) {
          document.querySelectorAll(`#${containerId} .page-item`).forEach(item => {
            item.classList.remove('active');
          });
          newActivePage.parentElement.classList.add('active');
        }
        
        currentPage--;
        prevPageBtn.classList.toggle('disabled', currentPage === 1);
        nextPageBtn.classList.toggle('disabled', currentPage === totalPages);
      }
    });
  }
  
  // Sonraki sayfa butonu
  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (currentPage < totalPages) {
        showCheckboxPage(containerId, currentPage + 1);
        
        // Aktif sayfayı güncelle
        const newActivePage = document.querySelector(`#${containerId} .page-link[data-page="${currentPage + 1}"][data-container="${containerId}"]`);
        if (newActivePage) {
          document.querySelectorAll(`#${containerId} .page-item`).forEach(item => {
            item.classList.remove('active');
          });
          newActivePage.parentElement.classList.add('active');
        }
        
        currentPage++;
        prevPageBtn.classList.toggle('disabled', currentPage === 1);
        nextPageBtn.classList.toggle('disabled', currentPage === totalPages);
      }
    });
  }
}

// Belirli bir checkbox sayfasını göster
function showCheckboxPage(containerId, page) {
  const checkboxes = document.querySelectorAll(`#${containerId}_checkboxes .checkbox-item`);
  const itemsPerPage = 20;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  checkboxes.forEach((checkbox, index) => {
    if (index >= startIndex && index < endIndex) {
      checkbox.style.display = '';
    } else {
      checkbox.style.display = 'none';
    }
  });
}

// HeaderScenarioList bölümünü güncelleme
function updateHeaderScenarioList() {
  const container = document.getElementById('headerScenarioList');
  if (!container) return;
  
  // Bu fonksiyon şu anda aktif olarak kullanılmıyor, boş bırakıyoruz
  console.log('updateHeaderScenarioList çağrıldı');
}

// MockaVerse - Ana JavaScript Dosyası
// Database entegrasyonu ve senaryo yönetimi

// === DuckDB Database Integration ===
const DatabaseAPI = {
  // MCP query wrapper
  async query(sql) {
    try {
      console.log('🗄️ Database Query:', sql);
      
      // MCP Client kullanarak query gönder
      if (window.MCPClient) {
        return await window.MCPClient.query(sql);
      } else {
        console.log('⚠️ MCP Client not available, using fallback');
        return { success: false, error: 'MCP Client not initialized' };
      }
      
    } catch (error) {
      console.error('❌ Database Query Error:', error);
      return { success: false, error: error.message };
    }
  },

  // Senaryo kaydetme
  async saveScenario(scenarioData) {
    try {
      const { name, description, channel, mockServices } = scenarioData;
      
      // 1. Önce senaryo kaydı
      const scenarioQuery = `
        INSERT INTO scenarios (name, description, channel, status)
        VALUES ('${name}', '${description}', '${channel}', 1)
        RETURNING id, name, description, channel, status, created_at;
      `;
      
      const scenarioResult = await this.query(scenarioQuery);
      if (!scenarioResult.success) {
        throw new Error('Senaryo kaydedilemedi');
      }
      
      // 2. Mock servisleri kaydet
      const scenarioId = scenarioResult.data.id;
      for (const service of mockServices) {
        const serviceQuery = `
          INSERT INTO mock_services (scenario_id, service_name, transaction_name, response_data)
          VALUES ('${scenarioId}', '${service.serviceName}', '${service.endpointUrl}', '${service.responseData}');
        `;
        await this.query(serviceQuery);
      }
      
      return { success: true, data: scenarioResult.data };
    } catch (error) {
      console.error('❌ Senaryo kaydetme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // Senaryoları yükleme
  async loadScenarios() {
    try {
      const query = `
        SELECT 
          s.id,
          s.name,
          s.description, 
          s.channel,
          s.status,
          s.created_at,
          JSON_GROUP_ARRAY(
            JSON_OBJECT(
              'id', ms.id,
              'serviceName', ms.service_name,
              'transactionName', ms.transaction_name,
              'responseData', ms.response_data
            )
          ) as mockServices
        FROM scenarios s
        LEFT JOIN mock_services ms ON s.id = ms.scenario_id
        WHERE s.status = 1
        GROUP BY s.id, s.name, s.description, s.channel, s.status, s.created_at
        ORDER BY s.created_at DESC;
      `;
      
      const result = await this.query(query);
      if (result.success) {
        return result.data.map(scenario => ({
          id: scenario.id,
          name: scenario.name,
          description: scenario.description,
          channel: scenario.channel,
          status: scenario.status,
          mockServices: JSON.parse(scenario.mockServices || '[]')
        }));
      }
      
      return [];
    } catch (error) {
      console.error('❌ Senaryo yükleme hatası:', error);
      return [];
    }
  },

  // Senaryo silme
  async deleteScenario(scenarioId) {
    try {
      // Soft delete
      const query = `UPDATE scenarios SET status = 0 WHERE id = '${scenarioId}';`;
      const result = await this.query(query);
      return result.success;
    } catch (error) {
      console.error('❌ Senaryo silme hatası:', error);
      return false;
    }
  }
};

// === Configuration ===
let USE_DATABASE = true; // Database entegrasyonu aktif/pasif