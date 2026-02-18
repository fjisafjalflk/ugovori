# 📄 Generator Ugovora - Triballi Consulting

Moderna web aplikacija za generisanje profesionalnih ugovora sa live preview-om.

**✅ FINALNA VERZIJA** - Pravni tekst odobren od advokata!

---

## 🚀 Brzo pokretanje

```bash
# 1. Instalacija
npm install

# 2. Pokretanje
npm start

# 3. Otvori browser
http://localhost:3000
```

**That's it!** Popuniš formu → Klikneš "Generiši Ugovor" → Dobiješ DOCX! 🎉

---

## ✨ Funkcionalnosti

- ✅ **Live Preview** - Vidi ugovor u realnom vremenu dok kucaš
- ✅ **Dual Language** - SR/EN automatski prevod
- ✅ **Instant Download** - Direktno preuzimanje DOCX-a
- ✅ **Auto-save** - Podatci se čuvaju lokalno
- ✅ **Kompletan pravni tekst** - 12 članova sa svim detaljima
- ✅ **Profesionalan format** - Tabele, formatiranje, potpisi

---

## 📋 Sadržaj ugovora

**Član 1** – Predmet ugovora  
**Član 2** – Opis usluga (detaljno)  
**Član 3** – Izveštavanje  
**Član 4** – Standard izvršenja  
**Član 5** – Saradnja Primaoca  
**Član 6** – Naknada  
**Član 6a** – Obaveza plaćanja i obustava rada  
**Član 7** – Period izvršenja kampanje  
**Član 8** – Rezultati kampanje i lista lidova  
**Član 9** – Poverljivost  
**Član 10** – Raskid ugovora  
**Član 11** – Viša sila (opširno)  
**Član 12** – Merodavno pravo, sporovi i završne odredbe  

---

## 🌐 Deploy na server

### PM2 (Production)

```bash
npm install -g pm2
pm2 start server.js --name ugovor
pm2 startup
pm2 save
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Nginx (reverse proxy)

```nginx
server {
    listen 80;
    server_name ugovori.triballi.rs;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

---

## 🔧 Troubleshooting

| Problem | Rešenje |
|---------|---------|
| Port 3000 zauzet | `PORT=3001 npm start` |
| Module nije pronađen | `npm install` |
| DOCX se ne generiše | Proveri konzolu (F12) |

---

**Made with ❤️ for Triballi Consulting**  
v2.0 - 18.02.2026
