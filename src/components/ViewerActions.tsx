import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { renderUrl } from '@/lib/renderUrl'

interface ViewerActionsProps {
  /** Prefijo del caso cargado; si es null no se puede compartir. */
  prefix: string | null
  isMobile: boolean
}

/**
 * Acciones flotantes del visor (arriba a la derecha): volver al listado y compartir el link
 * del render actual. Mismo lenguaje "glass" que el resto de overlays del visor.
 */
export default function ViewerActions({ prefix, isMobile }: ViewerActionsProps) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    if (!prefix) return
    try {
      await navigator.clipboard.writeText(renderUrl(prefix))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Sin clipboard (contexto no seguro o permiso denegado): no hacemos nada ruidoso.
    }
  }

  return (
    <div className={cn(
      'dark absolute z-20 flex gap-2 pointer-events-auto',
      isMobile ? 'top-3 right-3' : 'top-6 right-6',
    )}>
      <Button variant="secondary" size="sm" onClick={() => navigate('/patients')}>
        <ArrowLeft className="size-4 mr-1.5" />
        Volver
      </Button>
      <Button variant="secondary" size="sm" disabled={!prefix} onClick={handleShare}>
        {copied ? (
          <>
            <Check className="size-4 mr-1.5 text-green-500" />
            Copiado
          </>
        ) : (
          <>
            <Share2 className="size-4 mr-1.5" />
            Compartir
          </>
        )}
      </Button>
    </div>
  )
}
