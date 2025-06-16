# MockaVerseWeb Database

DuckDB veritabanı ve script'leri.

## Dosyalar

- `mockaverse.duckdb` (6.8MB) - Production-ready sample data
- `create_sample_data.sql` - SQL creation script  
- `populate_database.py` - Python database creation script

## Database Schema

7 tablo, 49 kayıt:
- users (4) - Authentication
- channels (6) - Enpara kanalları
- scenarios (6) - Banking senaryoları
- mock_services (8) - API responses
- customers (9) - Müşteri profilleri
- customer_scenarios (10) - Eşleştirmeler
- rules (6) - Business rules

## Kullanım

```python
import duckdb
conn = duckdb.connect('database/mockaverse.duckdb')
result = conn.execute("SELECT * FROM scenarios").fetchall()
```

## Test Kullanıcıları

- admin / admin123 (admin)
- huseyiny / user123 (user)
- testuser / test123 (user)
- demo / demo123 (viewer) 