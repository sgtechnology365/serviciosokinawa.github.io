# Servicios Okinawa Uno — Guía de uso

## Archivos del proyecto

| Archivo | Qué es |
|---|---|
| `index.html` | El catálogo público (lo que ven todos) |
| `registro.html` | Formulario para que prestadores se registren |

---

## Tarjetas patrocinadas (monetización)

En tu Google Sheets, agrega dos columnas más al final: **"patrocinado"** y **"vence"**.

- **patrocinado**: escribe `TRUE` para el negocio que pagó por destacarse
- **vence**: fecha en formato `AAAA-MM-DD` (ej: `2026-11-20`) hasta cuándo pagó. Al pasar esa fecha, el sistema lo baja automáticamente del lugar destacado — no tienes que acordarte de quitarlo a mano
- **Límite: 2 patrocinados por categoría.** Si por error marcas `TRUE` a un tercer negocio de la misma categoría, el sistema solo respeta a los dos primeros de la hoja y el resto queda como servicio normal
- Los servicios patrocinados aparecen **primero** en su categoría (su orden entre ellos también rota al azar en cada visita), con borde dorado y la etiqueta "★ Patrocinado" (siempre visible, para mantener la confianza de los usuarios)

**Modelo de cobro sugerido:** suscripción mensual fija (no por clic ni por contacto — imposible de medir a esta escala, y así es predecible para ti y el negocio). Cobras por transferencia/QR y activas manualmente en Sheets, con la fecha de "vence" según lo que pagó.

Orden de columnas esperado en la hoja:
`Timestamp | Nombre | Categoría | Descripción | WhatsApp | Dirección | Propietario | aprobado | patrocinado | vence`

---

## Cómo agregar servicios manualmente

Abre `index.html` con cualquier editor de texto y busca el bloque `const SERVICIOS = [`.

Copia este bloque y complétalo:

```js
{
  nombre: "Nombre del negocio",
  categoria: "salud",          // ver categorías abajo
  emoji: "🩺",                 // emoji representativo
  descripcion: "Descripción breve del servicio y horarios.",
  direccion: "Av. Principal Nº 45",
  whatsapp: "59170000000",     // con código de país 591
  aprobado: true               // false = no aparece en el catálogo
},
```

### Categorías disponibles
`salud` · `alimentos` · `mecanica` · `tecnologia` · `educacion` · `belleza` · `construccion` · `transporte` · `comercio` · `otros`

---

## Cómo recibir registros por WhatsApp (modo actual)

Cuando alguien llena el formulario en `registro.html`, te llega un mensaje de WhatsApp con todos los datos. Luego tú decides si lo agregas al catálogo editando `index.html`.

El número que recibe los registros está en `registro.html`, línea:
```js
const numAdmin = "59177612322";
```

---

## Publicar en GitHub Pages

1. Sube los archivos `index.html` y `registro.html` a tu repositorio de GitHub
2. Ve a **Settings → Pages**
3. En "Source" selecciona **Deploy from a branch → main → / (root)**
4. Guarda y espera 1-2 minutos
5. Tu catálogo estará en: `https://TU-USUARIO.github.io/NOMBRE-REPO/`

---

## Mejora futura: conectar Google Forms

Para que los registros se guarden automáticamente en una hoja de cálculo:

1. Crea un **Google Form** con estos campos:
   - Nombre del servicio
   - Categoría
   - Descripción
   - WhatsApp
   - Dirección
   - Tu nombre

2. Copia la URL de envío del form (termina en `/formResponse`)

3. En `registro.html`, reemplaza:
   ```js
   const GOOGLE_FORM_URL = ""; // pega aquí la URL
   ```

4. Actualiza también los `entry.XXXXXXX` con los IDs reales de tu form

---

*Directorio comunitario de Okinawa Uno · Santa Cruz, Bolivia*
