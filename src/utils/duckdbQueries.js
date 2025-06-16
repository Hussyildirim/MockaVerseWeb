// MockaVerse DuckDB Query Library
// Bu dosya frontend ile DuckDB MCP entegrasyonu için gerekli sorguları içerir

export const duckdbQueries = {
  // Authentication sorguları
  getUserByUsername: `
    SELECT 
      id, username, password_hash, salt, email, full_name, role, is_active, last_login
    FROM users 
    WHERE username = ? AND is_active = true;
  `,

  createUser: `
    INSERT INTO users (username, password_hash, salt, email, full_name, role)
    VALUES (?, ?, ?, ?, ?, ?)
    RETURNING id, username, email, full_name, role, created_at;
  `,

  updateLastLogin: `
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP 
    WHERE id = ?;
  `,

  updateLoginAttempts: `
    UPDATE users 
    SET login_attempts = ?, locked_until = ?
    WHERE username = ?;
  `,

  getAllUsers: `
    SELECT 
      id, username, email, full_name, role, is_active, created_at, last_login, login_attempts
    FROM users 
    ORDER BY created_at DESC;
  `,

  updateUserStatus: `
    UPDATE users 
    SET is_active = ?
    WHERE id = ?;
  `,

  updateUserRole: `
    UPDATE users 
    SET role = ?
    WHERE id = ?;
  `,

  getUserStats: `
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
      COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
      COUNT(CASE WHEN last_login > NOW() - INTERVAL '7 days' THEN 1 END) as recent_logins
    FROM users;
  `,

  // Tüm senaryoları listele
  getAllScenarios: `
    SELECT 
      id, name, description, channel, status, created_at, updated_at
    FROM scenarios 
    ORDER BY name;
  `,

  // Senaryo detayı ve mock servisleri
  getScenarioWithServices: `
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
    WHERE s.id = ?
    GROUP BY s.id, s.name, s.description, s.channel, s.status, s.created_at;
  `,

  // Müşteri listesi
  getAllCustomers: `
    SELECT 
      id, customer_number, user_code, name, created_at, updated_at
    FROM customers 
    ORDER BY name;
  `,

  // Müşteri senaryoları
  getCustomerScenarios: `
    SELECT 
      c.id as customer_id,
      c.customer_number,
      c.user_code, 
      c.name as customer_name,
      s.id as scenario_id,
      s.name as scenario_name,
      s.channel,
      cs.assigned_at,
      cs.is_active
    FROM customers c
    JOIN customer_scenarios cs ON c.id = cs.customer_id
    JOIN scenarios s ON cs.scenario_id = s.id
    WHERE c.id = ?
    ORDER BY s.name;
  `,

  // Belirli müşteri için eşleşen kurallar
  getCustomerRules: `
    SELECT 
      r.id,
      r.rule_content,
      r.customer_match_criteria,
      r.is_active,
      s.name as scenario_name
    FROM rules r
    JOIN scenarios s ON r.scenario_id = s.id
    WHERE r.customer_match_criteria = ? 
       OR r.customer_match_criteria LIKE '%' || SUBSTRING(?, 1, 4) || '*'
       OR r.customer_match_criteria = '*'
    ORDER BY s.name;
  `,

  // Senaryo bazlı istatistikler
  getScenarioStats: `
    SELECT 
      s.name as scenario_name,
      COUNT(DISTINCT cs.customer_id) as customer_count,
      COUNT(DISTINCT ms.id) as service_count,
      COUNT(DISTINCT r.id) as rule_count
    FROM scenarios s
    LEFT JOIN customer_scenarios cs ON s.id = cs.scenario_id
    LEFT JOIN mock_services ms ON s.id = ms.scenario_id
    LEFT JOIN rules r ON s.id = r.scenario_id
    GROUP BY s.id, s.name
    ORDER BY customer_count DESC;
  `,

  // Kanal bazlı dağılım
  getChannelDistribution: `
    SELECT 
      channel,
      COUNT(*) as scenario_count,
      COUNT(DISTINCT cs.customer_id) as customer_count
    FROM scenarios s
    LEFT JOIN customer_scenarios cs ON s.id = cs.scenario_id
    GROUP BY channel
    ORDER BY scenario_count DESC;
  `,

  // Mock servis arama
  searchMockServices: `
    SELECT 
      ms.id,
      ms.service_name,
      ms.transaction_name,
      ms.response_data,
      s.name as scenario_name,
      s.channel
    FROM mock_services ms
    JOIN scenarios s ON ms.scenario_id = s.id
    WHERE ms.service_name LIKE '%' || ? || '%'
       OR ms.transaction_name LIKE '%' || ? || '%'
       OR s.name LIKE '%' || ? || '%'
    ORDER BY s.name, ms.service_name;
  `,

  // Müşteri senaryosu ekleme
  addCustomerScenario: `
    INSERT INTO customer_scenarios (customer_id, scenario_id)
    VALUES (?, ?)
    ON CONFLICT (customer_id, scenario_id) DO NOTHING;
  `,

  // Müşteri senaryosu kaldırma
  removeCustomerScenario: `
    DELETE FROM customer_scenarios 
    WHERE customer_id = ? AND scenario_id = ?;
  `,

  // Yeni senaryo ekleme
  addScenario: `
    INSERT INTO scenarios (name, description, channel, status)
    VALUES (?, ?, ?, 1)
    RETURNING id, name, description, channel, status, created_at;
  `,

  // Mock servis ekleme
  addMockService: `
    INSERT INTO mock_services (scenario_id, service_name, transaction_name, response_data)
    VALUES (?, ?, ?, ?)
    RETURNING id, scenario_id, service_name, transaction_name, response_data;
  `,

  // Kural ekleme
  addRule: `
    INSERT INTO rules (rule_content, scenario_id, customer_match_criteria, is_active)
    VALUES (?, ?, ?, true)
    RETURNING id, rule_content, scenario_id, customer_match_criteria, is_active;
  `,

  // Dashboard için özet veriler (users dahil)
  getDashboardSummary: `
    SELECT 
      'total_scenarios' as metric, COUNT(*) as value FROM scenarios
    UNION ALL
    SELECT 
      'total_customers' as metric, COUNT(*) as value FROM customers
    UNION ALL
    SELECT 
      'total_mock_services' as metric, COUNT(*) as value FROM mock_services
    UNION ALL
    SELECT 
      'total_rules' as metric, COUNT(*) as value FROM rules
    UNION ALL
    SELECT 
      'total_users' as metric, COUNT(*) as value FROM users
    UNION ALL
    SELECT 
      'active_users' as metric, COUNT(*) as value FROM users WHERE is_active = true
    UNION ALL
    SELECT 
      'active_customer_scenarios' as metric, COUNT(*) as value 
      FROM customer_scenarios WHERE is_active = true;
  `,

  // Son aktiviteler (users dahil)
  getRecentActivity: `
    SELECT 
      'scenario' as type, 
      name as title, 
      'Senaryo oluşturuldu' as action,
      created_at as timestamp
    FROM scenarios
    UNION ALL
    SELECT 
      'customer_scenario' as type,
      c.name || ' - ' || s.name as title,
      'Müşteri senaryoya atandı' as action,
      cs.assigned_at as timestamp
    FROM customer_scenarios cs
    JOIN customers c ON cs.customer_id = c.id
    JOIN scenarios s ON cs.scenario_id = s.id
    UNION ALL
    SELECT 
      'user_login' as type,
      u.full_name || ' (' || u.username || ')' as title,
      'Kullanıcı giriş yaptı' as action,
      u.last_login as timestamp
    FROM users u
    WHERE u.last_login IS NOT NULL
    ORDER BY timestamp DESC
    LIMIT 10;
  `
};

// DuckDB MCP bağlantısı için yardımcı fonksiyonlar
export const duckdbHelpers = {
  // Veritabanı bağlantısını test et
  testConnection: () => {
    return "SELECT 'DuckDB MCP Bağlantısı Aktif' as message, current_timestamp as timestamp;";
  },

  // Tablo yapısını kontrol et
  checkTables: () => {
    return "SHOW TABLES;";
  },

  // Veritabanı sürümü
  getVersion: () => {
    return "SELECT version() as duckdb_version;";
  }
};

// Authentication helper functions
export const authQueries = {
  // Login işlemi
  loginUser: (username) => 
    duckdbQueries.getUserByUsername.replace('?', `'${username}'`),
  
  // Kullanıcı oluşturma
  createNewUser: (username, passwordHash, salt, email, fullName, role) =>
    `INSERT INTO users (username, password_hash, salt, email, full_name, role) VALUES ('${username}', '${passwordHash}', '${salt}', '${email}', '${fullName}', '${role}') RETURNING id, username, email, full_name, role, created_at;`,
  
  // Son login güncelleme
  updateUserLastLogin: (userId) =>
    `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = '${userId}';`,
  
  // Login denemesi güncelleme
  updateUserLoginAttempts: (username, attempts, lockUntil) =>
    `UPDATE users SET login_attempts = ${attempts}, locked_until = ${lockUntil ? `'${lockUntil}'` : 'NULL'} WHERE username = '${username}';`
};

// Frontend kullanımı için örnek
export const queryExamples = {
  // Belirli bir müşterinin senaryolarını getir
  getCustomerScenariosById: (customerId) => 
    duckdbQueries.getCustomerScenarios.replace('?', `'${customerId}'`),
  
  // Senaryo detayını getir
  getScenarioDetailsById: (scenarioId) =>
    duckdbQueries.getScenarioWithServices.replace('?', `'${scenarioId}'`),
  
  // Mock servis arama
  searchServices: (searchTerm) => 
    duckdbQueries.searchMockServices.replaceAll('?', `'${searchTerm}'`),
  
  // Müşteri kuralları
  getCustomerRulesById: (customerNumber) =>
    duckdbQueries.getCustomerRules.replaceAll('?', `'${customerNumber}'`),
  
  // Kullanıcı login
  loginUser: (username) =>
    authQueries.loginUser(username)
};

export default {
  duckdbQueries,
  duckdbHelpers,
  queryExamples,
  authQueries
}; 