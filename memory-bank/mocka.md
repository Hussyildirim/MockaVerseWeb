# MockaVerse ve Mock Servisleri

## Mocka Nedir?

"Mocka", "Mock" kelimesinin Türkçeleştirilmiş bir versiyonudur. Bu proje kapsamında, özellikle finans ve bankacılık sektöründe, gerçek sistemlerin davranışlarını simüle eden mock (sahte) servisler için kullanılan bir terimdir.

## Mock Servislerin Amacı

Mock servisler, aşağıdaki amaçlar için kullanılır:

1. **Geliştirme Ortamında Test**: Gerçek sistemlere bağlı olmadan uygulama geliştirmesini kolaylaştırır
2. **Performans Testi**: Gerçek sistemlere yük bindirmeden performans testleri yapılabilir
3. **Hata Senaryoları Testi**: Gerçek ortamda oluşturulması zor olan hata senaryolarını test etmeyi sağlar
4. **Bağımlılıkları Azaltma**: Diğer sistemlerin kullanılabilirliğine bağımlılığı azaltır
5. **Paralel Geliştirme**: Diğer ekiplerin geliştirmeleri tamamlanmadan önce bile çalışmayı mümkün kılar

## MockaVerse'de Mock Servis Yapısı

MockaVerse'de bir mock servis aşağıdaki bileşenlerden oluşur:

```
{
  serviceName: "Örnek Servis",
  endpointUrl: "/api/ornek-servis",
  responseData: "{\"status\": \"success\", \"data\": {...}}"
}
```

- **serviceName**: Servisin insan tarafından okunabilir adı
- **endpointUrl**: Servisin çağrılacağı URL yolu
- **responseData**: Servisin döneceği cevap (JSON formatında)

## MockaVerse Özellikleri

MockaVerse, mock servisleri yönetmek için aşağıdaki özellikleri sunar:

1. **Senaryo Tabanlı Yaklaşım**: Her senaryo birden fazla mock servis içerebilir
2. **Müşteri Ataması**: Senaryolar müşterilere atanabilir, böylece her müşteri farklı bir davranış sergileyebilir
3. **Kolayca Düzenleme**: Servis yanıtlarını dinamik olarak düzenleme imkanı
4. **Merkezi Yönetim**: Tüm mock servisleri tek bir arayüzden yönetme

## Tipik Kullanım Senaryoları

### Bankacılık Mock Servisleri Örnekleri:

1. **Hesap Bilgileri Servisi**:
   ```json
   {
     "serviceName": "Hesap Bilgileri Servisi",
     "endpointUrl": "/api/accounts",
     "responseData": "{\"accountNumber\":\"12345678\",\"balance\":1500.75,\"currency\":\"TRY\",\"accountType\":\"Vadesiz\",\"status\":\"Aktif\"}"
   }
   ```

2. **Kart Bilgileri Servisi**:
   ```json
   {
     "serviceName": "Kart Bilgileri Servisi",
     "endpointUrl": "/api/cards",
     "responseData": "{\"cardNumber\":\"1234-XXXX-XXXX-5678\",\"cardType\":\"Kredi\",\"expireDate\":\"12/25\",\"availableLimit\":5000,\"currency\":\"TRY\"}"
   }
   ```

3. **Kredi Uygunluk Servisi**:
   ```json
   {
     "serviceName": "Kredi Uygunluk Servisi",
     "endpointUrl": "/api/credit-eligibility",
     "responseData": "{\"eligible\":true,\"maxAmount\":25000,\"interestRate\":1.59,\"term\":36}"
   }
   ```

### Müşteri Özelleştirme Örnekleri:

- **Normal Müşteri**: Standart hesap bakiyesi, normal kredi limiti
- **Premium Müşteri**: Yüksek hesap bakiyesi, yüksek kredi limiti
- **Riskli Müşteri**: Düşük hesap bakiyesi, kredi başvurusu reddedilmiş
- **Yeni Müşteri**: Sınırlı ürün erişimi, düşük limitler

## Mevcut Kullanım İçin Uyarılar

1. **Gerçek Veriler Kullanmayın**: Test amaçlı olarak dahi olsa, gerçek müşteri verilerini mock servislerde kullanmayın
2. **Güvenlik Testi İçin Uygun Değildir**: MockaVerse güvenlik testleri için değil, fonksiyonel testler için tasarlanmıştır
3. **Periyodik Güncelleme**: Gerçek servislerdeki değişiklikler oldukça mock servisleri de güncelleyin

## Teknik Entegrasyon

MockaVerse, aşağıdaki yöntemlerle mevcut sistemlere entegre edilebilir:

1. **API Gateway Yönlendirmesi**: API Gateway'in belirli koşullarda istekleri MockaVerse'e yönlendirmesi
2. **Proxy Kullanımı**: İstemci tarafında bir proxy ile isteklerin MockaVerse'e yönlendirilmesi
3. **Direkt Çağrı**: Test sistemlerinin doğrudan MockaVerse API'sini çağırması

## MockaVerse by IBTECH

MockaVerse, IBTECH tarafından geliştirilen bir projedir ve şu özellikler dahilinde hizmet vermektedir:

- Modern ve kullanımı kolay arayüz tasarımı
- Esnek senaryo yapılandırma özellikleri
- Yeşil renk teması ve minimalist tasarım felsefesi
- Güvenli ve IBTECH güvencesi altında bir deneyim 