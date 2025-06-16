# MockaVerseWeb

MockaVerseWeb, senaryo tanımlama ve müşteri eşleştirme işlemleri için geliştirilmiş modern web tabanlı bir uygulamadır. Bu uygulama, mock servis yönetimi ve senaryo-müşteri eşleştirme süreçlerini kolaylaştırmak için tasarlanmıştır.

## 🚀 Özellikler

### Ana Özellikler
- **Senaryo Yönetimi**: Senaryo oluşturma, düzenleme, silme işlemleri
- **Mock Servis Tanımlama**: Her senaryo için dinamik mock servis yapılandırması
- **Müşteri Yönetimi**: Müşteri oluşturma ve senaryoları müşterilerle eşleştirme
- **Kanal Yönetimi**: Parametrik kanal tanımlama ve yönetme sistemi
- **Authentication**: Güvenli giriş sistemi ve kullanıcı yönetimi
- **Responsive Tasarım**: Tüm cihazlarda optimize edilmiş kullanıcı arayüzü

### Teknik Özellikler
- **MERN Stack**: MongoDB, Express, React, Node.js tabanlı mimari
- **DuckDB Entegrasyonu**: Performanslı veri analizi için DuckDB desteği
- **LocalStorage**: Client-side veri depolama
- **Bootstrap 5**: Modern ve responsive UI framework
- **RESTful API**: Temiz ve organize edilmiş API yapısı

## 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- MongoDB (veya DuckDB kullanım için)
- Modern web tarayıcısı

## 🔧 Kurulum

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/[username]/MockaVerseWeb.git
cd MockaVerseWeb
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Client Bağımlılıklarını Yükleyin
```bash
npm run install-client
```

### 4. Uygulamayı Başlatın
```bash
# Geliştirme modu (server: 5000, client: 3000)
npm run dev

# Sadece server
npm start
```

## 💻 Kullanım

### Giriş Yapma
- **Admin**: admin / admin123
- **Test Kullanıcısı**: huseyiny / user123

### Senaryo Yönetimi
1. Ana sayfada "Senaryolar" sekmesine gidin
2. "Yeni Senaryo Ekle" butonuna tıklayın
3. Senaryo bilgilerini ve mock servis detaylarını girin
4. Senaryoyu kaydedin

### Kanal Yönetimi
1. "Kanallar" sekmesine gidin
2. Yeni kanal ekleyin veya mevcut kanalları düzenleyin
3. Kanal kodları ve açıklamaları tanımlayın

### Müşteri ve Senaryo Eşleştirme
1. "Kural-Senaryo Eşleştirme" sekmesine gidin
2. Müşteri bilgilerini girin
3. Uygun senaryoları seçin ve eşleştirin

## 🏗 Proje Yapısı

```
MockaVerseWeb/
├── index.html          # Ana uygulama sayfası
├── login.html          # Authentication sayfası
├── script.js           # Ana JavaScript logic
├── server.js           # Backend server
├── package.json        # Dependencies
├── client/             # Frontend assets
├── models/             # Veri modelleri
├── routes/             # API route'ları
├── memory-bank/        # Proje dokümantasyonu
└── images/             # Statik görsel dosyalar
```

## 📚 Dokümantasyon

Detaylı proje dokümantasyonu `memory-bank/` klasöründe bulunmaktadır:
- `projectbrief.md` - Proje genel bilgileri
- `progress.md` - Gelişim süreci ve milestone'lar
- `techContext.md` - Teknik detaylar
- `systemPatterns.md` - Sistem mimarisi

## 🧪 Test

Uygulamada built-in test case'leri bulunmaktadır. Detaylı test senaryoları için `MockaVerse_Manual_Test_Cases.txt` dosyasına bakınız.

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında dağıtılmaktadır. Detaylar için `LICENSE` dosyasına bakınız.

## 🔗 Bağlantılar

- [GitHub Repository](https://github.com/[username]/MockaVerseWeb)
- [Demo Uygulaması](https://mockverseWeb-demo.com) (yakında)

## 📞 İletişim

Proje ile ilgili sorularınız için GitHub Issues kullanabilirsiniz.

---

⭐ Bu projeyi beğendiyseniz star vermeyi unutmayın! 