-- MockaVerseWeb Sample Database Creation Script
-- Bu script DuckDB veritabanını sample veriler ile doldurur

-- 1. Users Tablosu (Authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Scenarios Tablosu (Test Senaryoları)
CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    channel VARCHAR(100),
    status INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Mock Services Tablosu (API Yanıtları)
CREATE TABLE IF NOT EXISTS mock_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    transaction_name VARCHAR(255),
    response_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
);

-- 4. Customers Tablosu (Müşteri Bilgileri)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_number VARCHAR(255),
    user_code VARCHAR(255),
    name VARCHAR(255),
    customer_type VARCHAR(100) DEFAULT 'individual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_customer_identifier CHECK (customer_number IS NOT NULL OR user_code IS NOT NULL)
);

-- 5. Customer Scenarios İlişki Tablosu
CREATE TABLE IF NOT EXISTS customer_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    scenario_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_customer_scenario UNIQUE (customer_id, scenario_id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
);

-- 6. Rules Tablosu (Kural Tanımları)
CREATE TABLE IF NOT EXISTS rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID,
    rule_text TEXT NOT NULL,
    rule_type VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
);

-- 7. Channels Tablosu (Kanal Tanımları)
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_code VARCHAR(10) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SAMPLE DATA INSERTION

-- Users (Authentication)
INSERT INTO users (username, password_hash, salt, email, full_name, role) VALUES
('admin', 'c5e8b8a3d7f2e1a9b4c6d8e2f3a7b5c9d1e4f6a8b2c5d7e9f1a3b6c8d2e5f7a9', '1907_admin_simple_salt', 'admin@mockaverse.com', 'System Administrator', 'admin'),
('huseyiny', 'a7b5c9d1e4f6a8b2c5d7e9f1a3b6c8d2e5f7a9c1e3f5a8b2d4e6f9a1c3e5f8b2', '1907_huseyiny_simple_salt', 'huseyiny@mockaverse.com', 'Hüseyin Yıldırım', 'user'),
('testuser', 'e9f1a3b6c8d2e5f7a9c1e3f5a8b2d4e6f9a1c3e5f8b2d4e7f9a2c4e6f8b1d3e5', '1907_testuser_simple_salt', 'test@mockaverse.com', 'Test Kullanıcısı', 'user'),
('demo', 'f8b2d4e7f9a2c4e6f8b1d3e5f7a9c2e4f6a8b1d3e6f8a2c4e7f9b2d4e6f8a1c3', '1907_demo_simple_salt', 'demo@mockaverse.com', 'Demo Hesabı', 'viewer');

-- Channels (Kanal Tanımları)
INSERT INTO channels (channel_code, description) VALUES
('111', 'Enpara Bireysel Internet'),
('115', 'Enpara Bireysel Çözüm Merkezi'),
('154', 'Enpara Bireysel Cep Şubesi'),
('303', 'Enpara Şirketim İnternet Şube'),
('305', 'Enpara Şirketim Çözüm Merkezi'),
('155', 'Enpara Şirketim Cep Şubesi');

-- Scenarios (Banking Senaryoları)
INSERT INTO scenarios (name, description, channel) VALUES
('Para Transferi', 'EFT ve Havale işlemleri için test senaryosu', '111'),
('Bakiye Sorgulama', 'Hesap bakiyesi ve hareket sorgulama senaryosu', '154'),
('Kredi Başvurusu', 'Bireysel kredi başvuru süreci senaryosu', '115'),
('Şirket Ödemesi', 'Kurumsal toplu ödeme işlemleri senaryosu', '303'),
('Kart İşlemleri', 'Kredi kartı ve banka kartı işlemleri senaryosu', '111'),
('Yatırım İşlemleri', 'Hisse senedi ve fon işlemleri senaryosu', '305');

-- Mock Services (API Yanıtları)
INSERT INTO mock_services (scenario_id, service_name, transaction_name, response_data) VALUES
((SELECT id FROM scenarios WHERE name = 'Para Transferi'), 'TransferService', 'ProcessTransfer', '{"status": "success", "transactionId": "TRX123456", "amount": 1000.00, "fee": 5.00, "message": "Transfer başarıyla gerçekleştirildi"}'),
((SELECT id FROM scenarios WHERE name = 'Para Transferi'), 'ValidateAccount', 'CheckAccount', '{"valid": true, "accountName": "John Doe", "accountType": "current"}'),

((SELECT id FROM scenarios WHERE name = 'Bakiye Sorgulama'), 'BalanceInquiry', 'GetBalance', '{"accountNumber": "1234567890", "availableBalance": 15750.50, "currentBalance": 16250.50, "currency": "TRY"}'),
((SELECT id FROM scenarios WHERE name = 'Bakiye Sorgulama'), 'TransactionHistory', 'GetHistory', '{"transactions": [{"date": "2024-01-15", "description": "ATM Para Çekme", "amount": -500.00}, {"date": "2024-01-14", "description": "Maaş Yatması", "amount": 8500.00}]}'),

((SELECT id FROM scenarios WHERE name = 'Kredi Başvurusu'), 'CreditApplication', 'SubmitApplication', '{"applicationId": "LOAN2024001", "status": "pending", "estimatedAmount": 50000.00, "message": "Başvurunuz değerlendirme aşamasındadır"}'),
((SELECT id FROM scenarios WHERE name = 'Kredi Başvurusu'), 'CreditScore', 'GetCreditScore', '{"score": 750, "rating": "Good", "eligible": true, "maxAmount": 75000.00}'),

((SELECT id FROM scenarios WHERE name = 'Şirket Ödemesi'), 'BulkPayment', 'ProcessBulkPayment', '{"batchId": "BULK2024001", "totalAmount": 125000.00, "processedCount": 15, "failedCount": 0, "status": "completed"}'),
((SELECT id FROM scenarios WHERE name = 'Şirket Ödemesi'), 'PaymentValidation', 'ValidatePayments', '{"validationId": "VAL001", "totalItems": 15, "validItems": 15, "invalidItems": 0, "errors": []}');

-- Customers (Müşteri Bilgileri)
INSERT INTO customers (customer_number, user_code, name, customer_type) VALUES
('CUST001', NULL, 'Ali Mehmet Özkan', 'individual'),
('CUST002', NULL, 'Fatma Ayşe Demir', 'individual'),
('CUST003', NULL, 'Mehmet Can Yılmaz', 'individual'),
('CORP001', 'TECH001', 'ABC Teknoloji A.Ş.', 'corporate'),
('CORP002', 'MAN001', 'XYZ İmalat San. Tic. Ltd. Şti.', 'corporate'),
('VIP001', NULL, 'Dr. Ahmet Selim Bey', 'vip'),
('CUST999', 'TEST01', 'Test Müşterisi', 'test'),
(NULL, 'USER123', 'Online Kullanıcı', 'individual'),
(NULL, 'MOBILE01', 'Mobil Kullanıcı', 'individual');

-- Customer Scenarios (Müşteri-Senaryo Eşleştirmeleri)
INSERT INTO customer_scenarios (customer_id, scenario_id) VALUES
((SELECT id FROM customers WHERE customer_number = 'CUST001'), (SELECT id FROM scenarios WHERE name = 'Para Transferi')),
((SELECT id FROM customers WHERE customer_number = 'CUST001'), (SELECT id FROM scenarios WHERE name = 'Bakiye Sorgulama')),
((SELECT id FROM customers WHERE customer_number = 'CUST002'), (SELECT id FROM scenarios WHERE name = 'Kredi Başvurusu')),
((SELECT id FROM customers WHERE customer_number = 'CUST002'), (SELECT id FROM scenarios WHERE name = 'Kart İşlemleri')),
((SELECT id FROM customers WHERE customer_number = 'CORP001'), (SELECT id FROM scenarios WHERE name = 'Şirket Ödemesi')),
((SELECT id FROM customers WHERE customer_number = 'CORP001'), (SELECT id FROM scenarios WHERE name = 'Bakiye Sorgulama')),
((SELECT id FROM customers WHERE customer_number = 'VIP001'), (SELECT id FROM scenarios WHERE name = 'Yatırım İşlemleri')),
((SELECT id FROM customers WHERE customer_number = 'VIP001'), (SELECT id FROM scenarios WHERE name = 'Para Transferi')),
((SELECT id FROM customers WHERE customer_number = 'CUST999'), (SELECT id FROM scenarios WHERE name = 'Para Transferi')),
((SELECT id FROM customers WHERE user_code = 'USER123'), (SELECT id FROM scenarios WHERE name = 'Bakiye Sorgulama'));

-- Rules (Kural Tanımları)
INSERT INTO rules (scenario_id, rule_text, rule_type) VALUES
((SELECT id FROM scenarios WHERE name = 'Para Transferi'), 'Günlük transfer limiti: 10.000 TL', 'limit'),
((SELECT id FROM scenarios WHERE name = 'Para Transferi'), 'EFT saatleri: 08:00 - 17:30', 'time_restriction'),
((SELECT id FROM scenarios WHERE name = 'Kredi Başvurusu'), 'Minimum yaş: 18, Maksimum yaş: 65', 'age_limit'),
((SELECT id FROM scenarios WHERE name = 'Kredi Başvurusu'), 'Minimum aylık gelir: 5.000 TL', 'income_requirement'),
((SELECT id FROM scenarios WHERE name = 'Şirket Ödemesi'), 'Toplu ödeme maksimum 100 işlem', 'transaction_limit'),
((SELECT id FROM scenarios WHERE name = 'Yatırım İşlemleri'), 'Yatırım danışmanlığı gerekli: 50.000 TL üzeri işlemler', 'advisory_requirement');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scenarios_channel ON scenarios(channel);
CREATE INDEX IF NOT EXISTS idx_scenarios_status ON scenarios(status);
CREATE INDEX IF NOT EXISTS idx_mock_services_scenario_id ON mock_services(scenario_id);
CREATE INDEX IF NOT EXISTS idx_customer_scenarios_customer_id ON customer_scenarios(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_scenarios_scenario_id ON customer_scenarios(scenario_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_channels_code ON channels(channel_code);

-- Data validation and summary
SELECT 'Database created successfully!' as message;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as scenario_count FROM scenarios;
SELECT COUNT(*) as mock_service_count FROM mock_services;
SELECT COUNT(*) as customer_count FROM customers;
SELECT COUNT(*) as customer_scenario_count FROM customer_scenarios;
SELECT COUNT(*) as rule_count FROM rules;
SELECT COUNT(*) as channel_count FROM channels; 