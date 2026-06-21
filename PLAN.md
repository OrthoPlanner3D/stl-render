# OP3DViewer — Pipeline STL→GLB y estado pre-producción

> Estado vivo del pipeline de modelos (subida + conversión + visualización).
> Última actualización: 2026-06-21.

## Qué está hecho y funcionando

### Backend — Cloud Function `stl-to-glb`
- **JavaScript plano (CommonJS), Node 22**, Cloud Functions Gen2. Sin build step.
- Deployada y `ACTIVE`: `https://us-central1-orthoplanner.cloudfunctions.net/stl-to-glb` (proyecto `orthoplanner`, región `us-central1`).
- Archivos: `functions/stl-to-glb/src/{index,convert,supabase,stl}.js`.
  - `stl.js` — parser STL propio (binario + ASCII). No usa three.
  - `convert.js` — STL → GLB+Draco con **gltf-transform** (`weld()` + `draco({ quantizePosition: 11 })`, ~0.03mm, ~130KB por arcada).
  - `supabase.js` — upload (service_role) + `listSignedGlbUrls()` (firma server-side).
  - `index.js` — handler HTTP con CORS, auth por `x-api-key`:
    - `POST` multipart → convierte y sube. `207` ante fallo parcial.
    - `GET` → lista el bucket con **signed URLs** (TTL 6h) para que el viewer lea.
- Secrets en Secret Manager: `supabase-url`, `supabase-service-key`, `stl-api-key`.
- Bucket **`glb-models`** privado, con los 69 GLB cargados.

### Frontend
- **Subida** (`src/pages/UploadPage.tsx` + `src/lib/uploadStl.ts`): sube **un archivo por request** con concurrencia (esquiva el límite ~32MB de Cloud Run), progreso por archivo y resultados.
- **Viewer** (`src/data/stlAssets.ts` `fetchArches()` + `src/hooks/useStlArches.ts`): pide el listado firmado al `GET` y carga los GLB **desde el bucket** (ya no bundleados). `ViewerPage` con estado de carga; `BottomBar` recibe los arcos por props.
- Modelos estáticos `src/assets/files-glb/` **borrados** (el bundle ya no los incluye).
- Variables: `.env` / `.env.example` en la raíz (`VITE_STL_ENDPOINT`, `VITE_STL_API_KEY`) y en `functions/stl-to-glb/`. Ambos `.env` gitignored.

### Herramienta de carga masiva
- `functions/stl-to-glb/bulk-upload.mjs` — sube una carpeta entera de `.stl` (uno por request, concurrencia). Probado con los 69 modelos.

---

## 🔴 Bloqueantes antes de producción

### 1. Autenticación (la api-key está expuesta)
Hoy `VITE_STL_API_KEY` viaja en el **bundle del browser** → cualquiera la extrae y puede **subir modelos y listar/descargar TODO el bucket**. Es aceptable solo para demo/desarrollo.
- **A definir con la clienta:** si hay login o no.
  - Con login → validar **JWT de Supabase** en la function (en `POST` y `GET`), sacar la api-key del front.
  - Sin login → protección alternativa (reCAPTCHA / App Check, rate-limiting). La api-key sola no alcanza para un endpoint público de escritura.
- Afecta `functions/stl-to-glb/src/index.js` (validación) y `src/lib/uploadStl.ts` + `src/data/stlAssets.ts` (cómo manda credenciales el front).

### 2. Multi-paciente / base de datos
El bucket es un **namespace plano** y el viewer **lista TODO el bucket** agrupando por nombre (`*Maxillary*` / `*Mandibular*`). Sirve para un caso/demo, NO para varios pacientes:
- **Colisiones de nombre:** se guarda como `<stem>.glb` con `upsert` → dos pacientes con `1Maxillary.stl` se pisan. Necesita **prefijo por paciente/caso** (ej. `<patientId>/1Maxillary.glb`).
- **Scoping:** el `GET` firma el bucket entero para cualquiera con la key → debe devolver **solo los modelos del paciente/usuario** que corresponde.
- **DB:** falta una tabla que vincule paciente → modelos (guardar el `storedPath` que devuelve el `POST`). El viewer debe pedir el set de **un** paciente, no todo.
- Afecta: schema en Supabase, `index.js` (naming + listado scopeado), `UploadPage`/viewer (contexto de paciente).

### 3. CORS restringido
La function responde `Access-Control-Allow-Origin: *`. En producción **restringir al dominio real** del front (`functions/stl-to-glb/src/index.js`).

---

## 🟡 Importantes antes de producción

- **Deploy del frontend:** definir dónde se hostea y cómo se inyectan las `VITE_*` en el build. Una vez que haya auth, que la api-key **no quede en el bundle**.
- **Datos de paciente hardcodeados:** `PatientInfo` muestra "John Wick" fijo → reemplazar por datos reales (ligado a la DB del punto 2).
- **TTL de signed URLs (6h):** si una sesión dura más, las cargas fallan. Evaluar refresco/relisten o subir el TTL. (`SIGNED_URL_TTL` en `index.js`.)
- **`Tooth_*` (31 archivos):** están en el bucket pero el viewer no los usa (es secuencia Maxilar/Mandibular). Decidir si son un feature futuro o se limpian.

---

## 🟢 Opcionales / mejoras

- **Bundle > 500KB:** el JS de la app (three.js) supera el warning de Vite. Code-splitting / dynamic import si se quiere optimizar carga inicial.
- **Limpieza:** `scripts/convert_stl_to_glb.py` y `src/assets/files-v2/` quedaron de la etapa local; revisar si se borran.
- **Commit:** todo el trabajo de esta etapa está **sin commitear** (los `.env` quedan fuera por `.gitignore`).

---

## Pendiente funcional (V2, no bloqueante)

- Persistir `storedPath` en DB al subir (parte del punto 2).
- Que el `UploadPage`, tras subir, asocie los modelos a un paciente y redirija a su viewer.
