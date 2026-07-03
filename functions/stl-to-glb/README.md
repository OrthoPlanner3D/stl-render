# stl-to-glb — Cloud Function (Node 22, JavaScript)

Recibe uno o varios `.stl` por `multipart/form-data`, los convierte a `.glb`
comprimido con Draco (mismo formato que los assets de `src/assets/files-glb/`) y
los sube a Supabase Storage **bajo el `storage_prefix` del caso** (`<patientId>/<uuid>/`).
Tras subir, registra el caso en la tabla `op3dcloud.patient_models` (upsert idempotente
por `storage_prefix`) para vincular los GLB al paciente.

JavaScript plano (CommonJS), sin build step. La conversión usa un **parser STL
propio** (`src/stl.js`, binario + ASCII) y **gltf-transform** para armar el GLB y
aplicar `KHR_draco_mesh_compression` (encoder `draco3dgltf`). No usa three.js.

```
POST /  (multipart/form-data)
  header: x-api-key: <STL_API_KEY>
  field:  files          = uno o varios .stl
  field:  storage_prefix = "<patientId>/<uuid>/"   (obligatorio, termina en "/")
  field:  patientId      = <bigint>                (obligatorio)
→ 200 { "files": [ { "originalName": "1Maxillary.stl",
                     "storedPath": "123/uuid/1Maxillary.glb",
                     "size": 8204 } ] }
  207 si hubo fallos parciales (cada item trae "error" en vez de storedPath/size)
  401 x-api-key inválida · 405 método ≠ POST
  400 sin archivos / sin storage_prefix / patientId inválido
```

El front (`stl-render`) genera un `storage_prefix` único por caso y manda **un
archivo por request** (Cloud Run rechaza requests > ~32MB), todos con el mismo
prefijo. El upsert a `patient_models` es idempotente, así que las N requests del
caso crean **una sola fila**.

## Correr local

```bash
cd functions/stl-to-glb
npm install
cp .env.example .env   # y completar STL_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

npm run start   # functions-framework --target=stlToGlb (carga .env vía dotenv)
```

En otra terminal:

```bash
curl -X POST http://localhost:8080 \
  -H "x-api-key: <STL_API_KEY del .env>" \
  -F "files=@/ruta/a/1Maxillary.stl" \
  -F "patientId=123" \
  -F "storage_prefix=123/00000000-0000-0000-0000-000000000000/"
```

## Carga masiva (muchos .stl)

Cloud Run rechaza requests de más de **~32 MB** (no configurable en Gen2), así que
**no se pueden mandar muchos `.stl` en una sola request** (ej. 50 archivos ≈ 257MB
falla). El script `bulk-upload.mjs` sube **un archivo por request**, en paralelo:

```bash
node bulk-upload.mjs <carpeta-con-stls>              # contra el endpoint deployado
node bulk-upload.mjs <carpeta-con-stls> --local      # contra el server local (npm run start)
node bulk-upload.mjs <carpeta> --concurrency=8       # más requests en paralelo (default 5)
# o:  npm run upload -- <carpeta>
```

Lee `STL_API_KEY` del `.env`. Imprime progreso por archivo y un resumen final
(`N subidos, M fallidos`); sale con código ≠ 0 si alguno falló. Sin dependencias
(usa `fetch`/`FormData` nativos de Node 22).

## Verificar Draco (sin Supabase)

`convert.js` es puro y se puede testear aislado:

```bash
node -e "const {convertStlToCompressedGlb}=require('./src/convert.js'); const fs=require('fs'); \
  convertStlToCompressedGlb(fs.readFileSync('FIXTURE.stl')).then(b=>fs.writeFileSync('out.glb',b))"
node -e "const fs=require('fs');const f=fs.readFileSync('out.glb');const l=f.readUInt32LE(12); \
  const j=JSON.parse(f.slice(20,20+l));console.log(j.extensionsRequired, j.meshes[0].primitives[0].extensions)"
# esperar: ['KHR_draco_mesh_compression'] y el primitive con su bloque KHR_draco_mesh_compression
```

## Bucket de Storage y tabla

Bucket **`patient-models`** **privado** (Dashboard → Storage → New bucket, sin
marcar "Public bucket"). Los GLB se guardan bajo `<patientId>/<uuid>/`.

Tabla **`op3dcloud.patient_models`** (una fila por caso: `patient_id`, `storage_prefix`,
`created_at`). Requiere un **UNIQUE constraint sobre `storage_prefix`** para que el
upsert `on conflict do nothing` de la function sea idempotente:

```sql
alter table op3dcloud.patient_models
  add constraint patient_models_storage_prefix_key unique (storage_prefix);
```

**No requiere políticas de Storage/RLS.** La function se autentica con
`SUPABASE_SERVICE_ROLE_KEY`, que saltea RLS por completo. El front lee los GLB con
signed URLs generadas del lado cliente.

## Secrets (Secret Manager)

```bash
printf '%s' "https://<proyecto>.supabase.co" | gcloud secrets create supabase-url --data-file=-
printf '%s' "<service-role-key>"             | gcloud secrets create supabase-service-key --data-file=-
printf '%s' "<api-key-fuerte>"               | gcloud secrets create stl-api-key --data-file=-
```

## Deploy

JavaScript plano, sin build step: GCF corre `src/index.js` directo (campo `main`
del package.json). El `.env` no se deploya (está en `.gcloudignore`); las
variables van por `--set-secrets` / `--set-env-vars`.

> **Runtime `nodejs22` (no `nodejs20`):** `@supabase/supabase-js` requiere
> WebSocket nativo, que Node 20 no trae (tira "Node.js 20 detected without native
> WebSocket support"). Node 22 lo incluye.

```bash
gcloud functions deploy stl-to-glb \
  --gen2 \
  --runtime=nodejs22 \
  --region=us-east1 \
  --source=functions/stl-to-glb \
  --entry-point=stlToGlb \
  --trigger-http \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --timeout=300s \
  --set-secrets=SUPABASE_URL=supabase-url:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-service-key:latest,STL_API_KEY=stl-api-key:latest \
  --set-env-vars=SUPABASE_BUCKET=patient-models,SUPABASE_SCHEMA=op3dcloud
```

La región concreta se confirma al momento de deployar.

## Variables de entorno

| Variable | Para qué | Origen |
|---|---|---|
| `STL_API_KEY` | Autenticar requests del front (header `x-api-key`) | secret |
| `SUPABASE_URL` | URL del proyecto Supabase | secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (backend, sin RLS) | secret |
| `SUPABASE_BUCKET` | Bucket destino (default `patient-models`) | env var |
| `SUPABASE_SCHEMA` | Schema de `patient_models` (default `op3dcloud`) | env var |
