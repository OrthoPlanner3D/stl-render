import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { LoaderUtils } from 'three'
import { fetchWithRetry } from '../lib/fetchWithRetry'

/**
 * GLTFLoader que descarga el GLB vía `fetchWithRetry` (con reintentos ante fallos
 * transitorios de red) en lugar del `FileLoader` interno de three. El parseo lo hace
 * el `parse` de la clase base, así que DRACO (seteado por `extendGLTFLoader`) sigue
 * funcionando: `RetryGLTFLoader` ES un `GLTFLoader`.
 *
 * Drop-in en los mismos call sites de `useLoader`/`useLoader.preload`. Usar SIEMPRE el
 * mismo constructor en preload y en render para compartir el cache de suspense de R3F.
 *
 * Las descargas salen en paralelo (igual que el FileLoader nativo): no se limita la
 * concurrencia a propósito, para que los modelos visibles carguen de inmediato y `Stage`
 * los encuadre dentro de su ventana de auto-cámara. El retry ya hace segura la ráfaga.
 */
export class RetryGLTFLoader extends GLTFLoader {
  override load(
    url: string,
    onLoad: (gltf: GLTF) => void,
    _onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ): void {
    const resourcePath = this.resourcePath || this.path || LoaderUtils.extractUrlBase(url)
    const fail = (err: unknown) => {
      if (onError) onError(err)
      else console.error(err)
      this.manager.itemError(url)
      this.manager.itemEnd(url)
    }

    // Igual que el GLTFLoader nativo: registrar el item en el LoadingManager para que
    // drei useProgress muestre el % de carga (por cantidad de items). itemEnd/itemError
    // se emiten al terminar o fallar.
    this.manager.itemStart(url)

    fetchWithRetry(url)
      .then(buffer => {
        try {
          // parse maneja el contenedor GLB (magic "glTF") y delega a DRACO si aplica.
          this.parse(buffer, resourcePath, gltf => {
            onLoad(gltf)
            this.manager.itemEnd(url)
          }, fail)
        } catch (err) {
          fail(err)
        }
      })
      .catch(fail)
  }
}
