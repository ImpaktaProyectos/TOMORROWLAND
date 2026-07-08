# People of Tomorrow 2026

Directorio interactivo para los viajeros españoles a Tomorrowland Belgium Weekend 1 (2026).  
Lee un Excel con las respuestas del formulario del grupo y genera una web donde filtrar por localidad, aeropuerto de salida, fecha, hora y zona DreamVille/Hotel.

## Stack

Next.js 14 · TypeScript · Tailwind CSS · Fuse.js (búsqueda) · SheetJS (importar Excel) · Lucide icons

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env.local`:

| Variable | Qué hace |
|---|---|
| `ADMIN_PASSWORD` | Contraseña para el panel `/admin` |
| `PUBLIC_CONTACT_ENABLED` | `true` para activar el botón de WhatsApp, `false` para desactivarlo |
| `NEXT_PUBLIC_APP_NAME` | Nombre mostrado en la cabecera (por defecto "People of Tomorrow 2026") |

## Importar datos nuevos

```bash
npm run import-excel -- ./ruta-al-excel.xlsx
```

Genera `data/travelers.server.json` y los informes en `reports/`.  
Sube a GitHub y Vercel redespliega automáticamente.

## Ejecutar en local

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Tests

```bash
npm test
```

## Desplegar en Vercel

1. Sube el proyecto a un repo de GitHub.
2. Importa en Vercel (Framework: Next.js, detecta automáticamente).
3. Configura las variables de entorno en Vercel.
4. Deploy.

## Qué incluye

- **Directorio interactivo** con búsqueda por nombre y filtros combinables (localidad, provincia, salida, fecha, hora ±margen, zona DreamVille/Hotel).
- **Ficha individual** por persona con datos del viaje y personas relacionadas.
- **WhatsApp** redirección servidor-a-servidor (el número nunca llega al navegador).
- **Panel admin** protegido con contraseña: estadísticas de importación, teléfonos inválidos, posibles duplicados, mapeo de columnas, descarga de informes.
- **265 personas** importadas del Excel original, con normalización de teléfonos, fechas corruptas, localidades y zonas DreamVille.

## Datos y privacidad

El teléfono solo se usa para la redirección de WhatsApp y nunca se envía al navegador.  
El Excel no se expone. Los datos se procesan en tiempo de build y se sirven como JSON solo del lado servidor.

## Notas

- Las fuentes (Cormorant Garamond + Inter) se cargan desde Google Fonts en runtime. En Vercel funciona sin problemas.
- Next.js 14.2.x tiene un advisory de seguridad (GHSA 2025-12-11) que aplica a todas las versiones 14.2. Se recomienda actualizar a 15.x cuando sea viable.
