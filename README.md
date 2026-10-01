# 🌌 AstroCHIA — Sitio Web Oficial

> **Colombianas Haciendo Investigación en Astrociencias**  
> *"No te puedes convertir en lo que no ves"*

Sitio web oficial, moderno, interactivo y optimizado para ser publicado **100% gratis** en **GitHub Pages**.

---

## ✨ Características del Sitio

- **Diseño Cósmico Moderno**: Fondo interactivo con estrellas en movimiento y estrellas fugaces en HTML5 Canvas.
- **Junta Directiva Oficial**: Presentación de las investigadoras líderes con fotos oficiales, perfiles y enlaces académicos.
- **Página de Directorio de Científicas (`directorio.html`)**:
  - Búsqueda en tiempo real por **Nombre, Institución o Campo de Investigación**.
  - Tarjetas sencillas con título, profesión, institución, áreas y redes/contacto.
  - Foto opcional (si no se sube, se genera un avatar con iniciales automáticamente).
  - Formulario integrado para que las científicas agreguen su información.
  - **Exportación a Excel / CSV** en un clic con codificación UTF-8 para administrar la base de datos en GitHub.
- **Métricas de Impacto**: Contadores animados (+85 científicas, +15 países, creada en 2018).
- **Formularios Integrados**:
  - Registro para investigadoras y estudiantes de pregrado/posgrado.
  - Formulario de contacto para charlas, prensa y alianzas institucionales.
- **100% Responsivo**: Adaptado perfectamente para celulares, tablets y computadores de escritorio.
- **Rendimiento Ultrarrápido**: Sin dependencias pesadas, carga instantánea y optimizado para SEO y redes sociales.

---

## 🚀 Cómo Publicar la Página en GitHub Pages (Paso a Paso)

GitHub Pages te permite alojar esta página de forma completamente gratuita, segura con HTTPS y sin límite de tiempo.

### Paso 1: Crear un nuevo repositorio en GitHub
1. Inicia sesión en tu cuenta de [GitHub](https://github.com/).
2. Haz clic en el botón verde **"New"** (Nuevo repositorio).
3. Nómbralo por ejemplo `chia` o `astrochia`.
4. Selecciónalo como **Público** (Public) y no marques "Add a README" (ya tenemos uno listo).
5. Haz clic en **Create repository**.

### Paso 2: Subir los archivos al repositorio
Abre tu terminal en la carpeta del proyecto (`/Users/laurenflor/Proyectos/chia`) y ejecuta:

```bash
git init
git add .
git commit -m "Lanzamiento oficial sitio web AstroCHIA"
git branch -M main
git remote add origin https://github.com/TU-USUARIO-GITHUB/chia.git
git push -u origin main
```
*(Reemplaza `TU-USUARIO-GITHUB` por tu usuario de GitHub)*.

### Paso 3: Activar GitHub Pages
1. En tu repositorio en GitHub, entra a la pestaña **Settings** (Configuración).
2. En el menú de la izquierda, haz clic en **Pages**.
3. En la sección **Build and deployment**:
   - **Source**: Selecciona `Deploy from a branch`.
   - **Branch**: Selecciona `main` y la carpeta `/(root)`.
4. Haz clic en **Save** (Guardar).
5. ¡Listo! En 1 a 2 minutos, GitHub te dará tu enlace gratuito:
   👉 **`https://TU-USUARIO-GITHUB.github.io/chia/`**

---

## 🌐 Cómo Conectar un Dominio Propio (ej. `astrochias.com`)

Si tienes o adquieres el dominio (como `astrochias.com` o `astrochia.org`):
1. En la misma sección **Settings > Pages** de tu repositorio.
2. En el campo **Custom domain**, escribe tu dominio: `astrochias.com`.
3. Haz clic en **Save** y marca la casilla **Enforce HTTPS** (certificado de seguridad gratuito).
4. En tu proveedor de dominio (GoDaddy, Namecheap, Google Domains, etc.), añade los registros DNS que GitHub te indique (4 registros tipo `A` que apuntan a GitHub Pages y un `CNAME` para `www`).

---

## 💻 Vista Previa Local

Para ver y probar la página inmediatamente en tu computador:
- Solo haz doble clic en el archivo `index.html` para abrirlo en tu navegador favorito (Chrome, Safari, Firefox).
