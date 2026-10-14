# GUÍA DE GUÍAS Y CONFIGURACIÓN DE PRODUCCIÓN, HTTPS Y CABECERAS
## Sistema Estudiantil, Cultural y Deportivo (SGA-CD) — Visión 0.1

Esta guía detalla las configuraciones necesarias para el despliegue seguro en producción del SGA-CD.

---

### 1. CONFIGURACIÓN DE SERVIDOR PROXY INVERSO (NGINX / TRAEFIK)

#### Configuración de Nginx (`/etc/nginx/sites-available/sga-cd.conf`)
```nginx
server {
    listen 80;
    server_name sga-cd.org www.sga-cd.org api.sga-cd.org;

    # Redirección obligatoria HTTP -> HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sga-cd.org www.sga-cd.org;

    ssl_certificate /etc/letsencrypt/live/sga-cd.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sga-cd.org/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Cabeceras HSTS y Seguridad en Nginx
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        root /var/www/sga-cd-web;
        index index.html;
        try_files $uri $uri/ /404.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### 2. RENOVACIÓN AUTOMÁTICA DE CERTIFICADOS SSL/TLS (CERTBOT)
```bash
sudo certbot --nginx -d sga-cd.org -d www.sga-cd.org -d api.sga-cd.org
sudo certbot renew --dry-run
```

---

### 3. ESTRATEGIA DE RESPALDO Y RECUPERACIÓN DE BASE DE DATOS (BACKUPS)
- **Respaldo diario comprimido (CRON):**
```bash
0 2 * * * sqlite3 /app/SGA-CD-DB.git/sga_cd_main.db ".backup /backups/sga_cd_backup_$(date +\%Y\%m\%d).db"
```
- **Integridad de backups:**
```bash
sqlite3 /backups/sga_cd_backup_YYYYMMDD.db "PRAGMA integrity_check;"
```

---

### 4. VARIABLES DE ENTORNO EN PRODUCCIÓN
Asegurarse de definir en `.env` de producción:
```env
ENVIRONMENT=production
TESTING=False
SECRET_KEY=<CLAVE_ALEATORIA_CRIPTOGRAFICAMENTE_SEGURA_64_CHARS>
DATABASE_URL=sqlite:////app/SGA-CD-DB.git/sga_cd_main.db
```
