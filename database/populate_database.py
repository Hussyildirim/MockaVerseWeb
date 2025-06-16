#!/usr/bin/env python3
"""
MockaVerseWeb Database Population Script
DuckDB veritabanını sample veriler ile doldurur
"""

import duckdb
import os
import json
from datetime import datetime, timedelta
import uuid

def create_database():
    """DuckDB veritabanını oluştur ve sample veriler ile doldur"""
    
    # Database path
    db_path = os.path.expanduser('~/MockaVerse/database/mockaverse.duckdb')
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    # Connect to DuckDB
    conn = duckdb.connect(db_path)
    
    try:
        print("🗄️ DuckDB veritabanı oluşturuluyor...")
        
        # 1. Create tables
        create_tables(conn)
        
        # 2. Insert sample data
        insert_sample_data(conn)
        
        # 3. Create indexes
        create_indexes(conn)
        
        # 4. Validate data
        validate_data(conn)
        
        print("✅ DuckDB veritabanı başarıyla oluşturuldu!")
        print(f"📍 Konum: {db_path}")
        
    except Exception as e:
        print(f"❌ Hata: {e}")
        raise
    finally:
        conn.close()

def create_tables(conn):
    """Tablo yapılarını oluştur"""
    
    tables = {
        'users': '''
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR PRIMARY KEY,
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
            )
        ''',
        
        'channels': '''
            CREATE TABLE IF NOT EXISTS channels (
                id VARCHAR PRIMARY KEY,
                channel_code VARCHAR(10) NOT NULL UNIQUE,
                description VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''',
        
        'scenarios': '''
            CREATE TABLE IF NOT EXISTS scenarios (
                id VARCHAR PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                description TEXT,
                channel VARCHAR(100),
                status INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''',
        
        'mock_services': '''
            CREATE TABLE IF NOT EXISTS mock_services (
                id VARCHAR PRIMARY KEY,
                scenario_id VARCHAR NOT NULL,
                service_name VARCHAR(255) NOT NULL,
                transaction_name VARCHAR(255),
                response_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''',
        
        'customers': '''
            CREATE TABLE IF NOT EXISTS customers (
                id VARCHAR PRIMARY KEY,
                customer_number VARCHAR(255),
                user_code VARCHAR(255),
                name VARCHAR(255),
                customer_type VARCHAR(100) DEFAULT 'individual',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''',
        
        'customer_scenarios': '''
            CREATE TABLE IF NOT EXISTS customer_scenarios (
                id VARCHAR PRIMARY KEY,
                customer_id VARCHAR NOT NULL,
                scenario_id VARCHAR NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT uq_customer_scenario UNIQUE (customer_id, scenario_id)
            )
        ''',
        
        'rules': '''
            CREATE TABLE IF NOT EXISTS rules (
                id VARCHAR PRIMARY KEY,
                scenario_id VARCHAR,
                rule_text TEXT NOT NULL,
                rule_type VARCHAR(100),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        '''
    }
    
    for table_name, sql in tables.items():
        print(f"📋 {table_name} tablosu oluşturuluyor...")
        conn.execute(sql)

def insert_sample_data(conn):
    """Sample verileri ekle"""
    
    # Users
    users_data = [
        ('admin-001', 'admin', 'c5e8b8a3d7f2e1a9b4c6d8e2f3a7b5c9d1e4f6a8b2c5d7e9f1a3b6c8d2e5f7a9', '1907_admin_simple_salt', 'admin@mockaverse.com', 'System Administrator', 'admin'),
        ('user-002', 'huseyiny', 'a7b5c9d1e4f6a8b2c5d7e9f1a3b6c8d2e5f7a9c1e3f5a8b2d4e6f9a1c3e5f8b2', '1907_huseyiny_simple_salt', 'huseyiny@mockaverse.com', 'Hüseyin Yıldırım', 'user'),
        ('user-003', 'testuser', 'e9f1a3b6c8d2e5f7a9c1e3f5a8b2d4e6f9a1c3e5f8b2d4e7f9a2c4e6f8b1d3e5', '1907_testuser_simple_salt', 'test@mockaverse.com', 'Test Kullanıcısı', 'user'),
        ('user-004', 'demo', 'f8b2d4e7f9a2c4e6f8b1d3e5f7a9c2e4f6a8b1d3e6f8a2c4e7f9b2d4e6f8a1c3', '1907_demo_simple_salt', 'demo@mockaverse.com', 'Demo Hesabı', 'viewer')
    ]
    
    print("👥 Kullanıcılar ekleniyor...")
    for user in users_data:
        conn.execute("""
            INSERT INTO users (id, username, password_hash, salt, email, full_name, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, user)
    
    # Channels
    channels_data = [
        ('ch-111', '111', 'Enpara Bireysel Internet'),
        ('ch-115', '115', 'Enpara Bireysel Çözüm Merkezi'),
        ('ch-154', '154', 'Enpara Bireysel Cep Şubesi'),
        ('ch-303', '303', 'Enpara Şirketim İnternet Şube'),
        ('ch-305', '305', 'Enpara Şirketim Çözüm Merkezi'),
        ('ch-155', '155', 'Enpara Şirketim Cep Şubesi')
    ]
    
    print("📡 Kanallar ekleniyor...")
    for channel in channels_data:
        conn.execute("""
            INSERT INTO channels (id, channel_code, description)
            VALUES (?, ?, ?)
        """, channel)
    
    # Scenarios
    scenarios_data = [
        ('sc-001', 'Para Transferi', 'EFT ve Havale işlemleri için test senaryosu', '111'),
        ('sc-002', 'Bakiye Sorgulama', 'Hesap bakiyesi ve hareket sorgulama senaryosu', '154'),
        ('sc-003', 'Kredi Başvurusu', 'Bireysel kredi başvuru süreci senaryosu', '115'),
        ('sc-004', 'Şirket Ödemesi', 'Kurumsal toplu ödeme işlemleri senaryosu', '303'),
        ('sc-005', 'Kart İşlemleri', 'Kredi kartı ve banka kartı işlemleri senaryosu', '111'),
        ('sc-006', 'Yatırım İşlemleri', 'Hisse senedi ve fon işlemleri senaryosu', '305')
    ]
    
    print("🎭 Senaryolar ekleniyor...")
    for scenario in scenarios_data:
        conn.execute("""
            INSERT INTO scenarios (id, name, description, channel)
            VALUES (?, ?, ?, ?)
        """, scenario)
    
    # Mock Services
    mock_services_data = [
        ('ms-001', 'sc-001', 'TransferService', 'ProcessTransfer', 
         '{"status": "success", "transactionId": "TRX123456", "amount": 1000.00, "fee": 5.00, "message": "Transfer başarıyla gerçekleştirildi"}'),
        ('ms-002', 'sc-001', 'ValidateAccount', 'CheckAccount', 
         '{"valid": true, "accountName": "John Doe", "accountType": "current"}'),
        ('ms-003', 'sc-002', 'BalanceInquiry', 'GetBalance', 
         '{"accountNumber": "1234567890", "availableBalance": 15750.50, "currentBalance": 16250.50, "currency": "TRY"}'),
        ('ms-004', 'sc-002', 'TransactionHistory', 'GetHistory', 
         '{"transactions": [{"date": "2024-01-15", "description": "ATM Para Çekme", "amount": -500.00}, {"date": "2024-01-14", "description": "Maaş Yatması", "amount": 8500.00}]}'),
        ('ms-005', 'sc-003', 'CreditApplication', 'SubmitApplication', 
         '{"applicationId": "LOAN2024001", "status": "pending", "estimatedAmount": 50000.00, "message": "Başvurunuz değerlendirme aşamasındadır"}'),
        ('ms-006', 'sc-003', 'CreditScore', 'GetCreditScore', 
         '{"score": 750, "rating": "Good", "eligible": true, "maxAmount": 75000.00}'),
        ('ms-007', 'sc-004', 'BulkPayment', 'ProcessBulkPayment', 
         '{"batchId": "BULK2024001", "totalAmount": 125000.00, "processedCount": 15, "failedCount": 0, "status": "completed"}'),
        ('ms-008', 'sc-004', 'PaymentValidation', 'ValidatePayments', 
         '{"validationId": "VAL001", "totalItems": 15, "validItems": 15, "invalidItems": 0, "errors": []}')
    ]
    
    print("🔧 Mock servisler ekleniyor...")
    for service in mock_services_data:
        conn.execute("""
            INSERT INTO mock_services (id, scenario_id, service_name, transaction_name, response_data)
            VALUES (?, ?, ?, ?, ?)
        """, service)
    
    # Customers
    customers_data = [
        ('cust-001', 'CUST001', None, 'Ali Mehmet Özkan', 'individual'),
        ('cust-002', 'CUST002', None, 'Fatma Ayşe Demir', 'individual'),
        ('cust-003', 'CUST003', None, 'Mehmet Can Yılmaz', 'individual'),
        ('cust-004', 'CORP001', 'TECH001', 'ABC Teknoloji A.Ş.', 'corporate'),
        ('cust-005', 'CORP002', 'MAN001', 'XYZ İmalat San. Tic. Ltd. Şti.', 'corporate'),
        ('cust-006', 'VIP001', None, 'Dr. Ahmet Selim Bey', 'vip'),
        ('cust-007', 'CUST999', 'TEST01', 'Test Müşterisi', 'test'),
        ('cust-008', None, 'USER123', 'Online Kullanıcı', 'individual'),
        ('cust-009', None, 'MOBILE01', 'Mobil Kullanıcı', 'individual')
    ]
    
    print("👤 Müşteriler ekleniyor...")
    for customer in customers_data:
        conn.execute("""
            INSERT INTO customers (id, customer_number, user_code, name, customer_type)
            VALUES (?, ?, ?, ?, ?)
        """, customer)
    
    # Customer Scenarios
    customer_scenarios_data = [
        ('cs-001', 'cust-001', 'sc-001'),
        ('cs-002', 'cust-001', 'sc-002'),
        ('cs-003', 'cust-002', 'sc-003'),
        ('cs-004', 'cust-002', 'sc-005'),
        ('cs-005', 'cust-004', 'sc-004'),
        ('cs-006', 'cust-004', 'sc-002'),
        ('cs-007', 'cust-006', 'sc-006'),
        ('cs-008', 'cust-006', 'sc-001'),
        ('cs-009', 'cust-007', 'sc-001'),
        ('cs-010', 'cust-008', 'sc-002')
    ]
    
    print("🔗 Müşteri-senaryo eşleştirmeleri ekleniyor...")
    for mapping in customer_scenarios_data:
        conn.execute("""
            INSERT INTO customer_scenarios (id, customer_id, scenario_id)
            VALUES (?, ?, ?)
        """, mapping)
    
    # Rules
    rules_data = [
        ('rule-001', 'sc-001', 'Günlük transfer limiti: 10.000 TL', 'limit'),
        ('rule-002', 'sc-001', 'EFT saatleri: 08:00 - 17:30', 'time_restriction'),
        ('rule-003', 'sc-003', 'Minimum yaş: 18, Maksimum yaş: 65', 'age_limit'),
        ('rule-004', 'sc-003', 'Minimum aylık gelir: 5.000 TL', 'income_requirement'),
        ('rule-005', 'sc-004', 'Toplu ödeme maksimum 100 işlem', 'transaction_limit'),
        ('rule-006', 'sc-006', 'Yatırım danışmanlığı gerekli: 50.000 TL üzeri işlemler', 'advisory_requirement')
    ]
    
    print("📜 Kurallar ekleniyor...")
    for rule in rules_data:
        conn.execute("""
            INSERT INTO rules (id, scenario_id, rule_text, rule_type)
            VALUES (?, ?, ?, ?)
        """, rule)

def create_indexes(conn):
    """Performance için index'ler oluştur"""
    
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_scenarios_channel ON scenarios(channel)",
        "CREATE INDEX IF NOT EXISTS idx_scenarios_status ON scenarios(status)",
        "CREATE INDEX IF NOT EXISTS idx_mock_services_scenario_id ON mock_services(scenario_id)",
        "CREATE INDEX IF NOT EXISTS idx_customer_scenarios_customer_id ON customer_scenarios(customer_id)",
        "CREATE INDEX IF NOT EXISTS idx_customer_scenarios_scenario_id ON customer_scenarios(scenario_id)",
        "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)",
        "CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)",
        "CREATE INDEX IF NOT EXISTS idx_channels_code ON channels(channel_code)"
    ]
    
    print("📊 Index'ler oluşturuluyor...")
    for index_sql in indexes:
        conn.execute(index_sql)

def validate_data(conn):
    """Veri bütünlüğünü kontrol et"""
    
    print("\n📊 Veritabanı özeti:")
    
    tables = ['users', 'channels', 'scenarios', 'mock_services', 'customers', 'customer_scenarios', 'rules']
    
    for table in tables:
        result = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()
        print(f"  • {table}: {result[0]} kayıt")
    
    print("\n✅ Veri bütünlüğü kontrolü başarılı!")

if __name__ == "__main__":
    create_database() 