# Şule & Berkay · Düğün Geri Sayım Ekranı

Raspberry Pi 5 + CasaOS üzerinde tarayıcıda çalışan, tek ekranlık düğün geri sayım sayacı.
Zarf açılır, içinden çıkan kartı sürükleyip yukarı/aşağı oynatabilirsiniz; karta dokununca
kart zarftan ayrılıp tam ekran sayaç olarak ortalanır.

## CasaOS kurulumu (Raspberry Pi 5)

1. CasaOS > App Store > üstteki `...` > **Import / Docker Compose** yolunu izleyin.
2. Bu depodaki `docker-compose.yml` içeriğini yapıştırın (33465 portu ve ghcr imajı hazır).
3. Uygulama `http://<pi-ip>:33465` adresinde çalışır.

## İmaj

- `ghcr.io/muratcihanyandi/dugunekalanzaman:latest` — `main` dalına her push'ta
  GitHub Actions ile otomatik güncellenir.
- İlk kurulumdan sonra paketi herkese açık yapmak tek tık: GitHub > Profil >
  Packages > `dugunekalanzaman` > Package settings > **Change visibility** > Public.
  (Private kalırsa Pi'de `docker login ghcr.io` gerekir.)

## Yerel çalıştırma

Sadece statik dosyalar: `site/` klasörünü herhangi bir sunucuyla açmak yeterli.

```
python -m http.server 8080 --directory site
```

## Ayar

Düğün tarihi `site/assets/js/main.js` içindeki `CONFIG.dateISO` alanından değiştirilir.
