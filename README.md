### 🌍 WordLingo


🚀 **Canlı Demo:**
👉 [**WordLingo'yu hemen dene**](https://tolgagame.github.io/Word-Lingo/)


İngilizce kelime ve düzensiz fiil öğrenimi için hazırlanmış, tamamen ücretsiz ve open source bir eşleştirme oyunu. Herhangi bir framework/bağımlılık gerektirmez — saf **HTML / CSS / JavaScript** ile yazılmıştır.

---

## 📁 Proje Yapısı

```
kelime-pratik/
├── index.html          # Ana sayfa (menü, oyun ekranları, footer, modallar)
├── css/
│   └── style.css       # Tüm görsel stiller
├── js/
│   └── app.js          # Oyun mantığı, state yönetimi, modal kontrolü
└── data/
    ├── words.json       # Kelime Eşleştirme modu veri seti (en / tr)
    └── verbs.json       # Düzensiz Fiiller modu veri seti (v1 / v2 / tr)
```

## 🎮 Özellikler

### 1. Ana Menü
İki oyun modu arasında seçim yapılan giriş ekranı:
- **Kelime Eşleştirme** — İngilizce kelimeleri Türkçe anlamlarıyla eşleştirme
- **Düzensiz Fiiller** — V1 (base form) → V2 (past simple) eşleştirmesi

### 2. Oyun Mekaniği
- Her turda `data/*.json` dosyalarından rastgele **5 çift** (`PAIR_COUNT`) seçilir.
- Sol ve sağ kolonlar ayrı ayrı karıştırılır (shuffle).
- Doğru eşleşmede kart yeşile döner, puan +10 eklenir, kart elenir (fade-out).
- Yanlış eşleşmede kartlar kırmızıya döner ve kısa bir "shake" animasyonuyla geri seçilebilir hale gelir.
- Bir turdaki tüm çiftler eşleşince rastgele bir **kutlama ekranı** (emoji + mesaj) gösterilir ve otomatik olarak yeni tur başlar.
- Veri havuzu (`pool`) tükendiğinde otomatik olarak yeniden karıştırılıp baştan kullanılır — oyun sonsuz döngüde devam eder.

### 3. İstatistikler
Her mod için ayrı ayrı takip edilir:
- **Puan** — toplam kazanılan puan
- **Tur** — kaçıncı turda olunduğu
- **Toplam** — o moda ait tüm kelime/fiil setinin kaç kez tam olarak eşleştirildiği (ilerleme çubuğu ile gösterilir)

### 4. Footer & Bilgilendirme Modalları
Sayfanın sağ alt köşesinde üç bağlantı bulunur:

| Buton | Davranış |
|---|---|
| **Privacy Policy** | Modal açar — hiçbir kullanıcı verisinin toplanmadığını/işlenmediğini belirten klasik gizlilik metni |
| **Support Us** | Yeni sekmede GitHub Sponsors sayfasına yönlendirir |
| **About Us** | Modal açar — projenin tamamen ücretsiz, abonesiz, süresiz ve open source olduğunu anlatan açıklama |

Modallar `modal-overlay` üzerinden açılır/kapanır; dışarı tıklama veya `✕` butonu ile kapatılabilir. Mobil ekranlarda footer statik akışa geçer.

## 🧠 Veri Formatı

**`words.json`**
```json
{ "en": "example", "tr": "örnek" }
```

**`verbs.json`**
```json
{ "v1": "go", "v2": "went", "tr": "gitmek" }
```

Yeni kelime/fiil eklemek için ilgili JSON dosyasına aynı formatta bir obje eklemek yeterlidir; kod tarafında herhangi bir değişiklik gerekmez.

## ⚙️ Teknik Notlar

- **State yönetimi:** `app.js` içindeki `state` nesnesi her mod (words/verbs) için ayrı `allItems`, `pool`, `score`, `roundNum` vb. tutar — iki mod birbirinden tamamen izole çalışır.
- **DOM erişimi:** Her state alanı, ilgili DOM elemanına `document.getElementById` ile erişen fonksiyonlar (`leftCol()`, `scoreEl()` vb.) içerir; bu sayede modlar arası geçişte gereksiz referans tutulmaz.
- **Eşzamanlılık koruması:** `locked` bayrağı ve `currentMode` kontrolleri, kullanıcı mod değiştirdiğinde bekleyen `setTimeout` callback'lerinin yanlış moda müdahale etmesini engeller.
- **Bağımlılık yok:** Harici kütüphane veya build adımı gerektirmez; doğrudan bir tarayıcıda veya basit bir statik sunucuda çalıştırılabilir.

## ▶️ Çalıştırma

```bash
# Proje klasöründe basit bir statik sunucu başlatmak yeterli
npx serve .
# veya
python3 -m http.server 8000
```

Ardından tarayıcıda `index.html`'i (veya sunucu adresini) açmanız yeterlidir.

## 📄 Lisans

Open source, ücretsiz ve süresiz kullanım için tasarlanmıştır.
