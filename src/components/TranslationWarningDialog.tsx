import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const TRANSLATION_WARNING_GIF_SRC = '/assets/videos/no-translate.gif'

export const TRANSLATION_WARNING_STORAGE_KEY = 'op3d-translation-warning-dismissed'

export function isTranslationWarningDismissed(): boolean {
  try {
    return localStorage.getItem(TRANSLATION_WARNING_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function dismissTranslationWarningPermanently(): void {
  try {
    localStorage.setItem(TRANSLATION_WARNING_STORAGE_KEY, '1')
  } catch {
    // Storage bloqueado (modo privado, iframe, etc.)
  }
}

interface TranslationWarningDialogProps {
  open: boolean
  onDismiss: () => void
  onDismissPermanently: () => void
}

export default function TranslationWarningDialog({
  open,
  onDismiss,
  onDismissPermanently,
}: TranslationWarningDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onDismiss()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="dark gap-4 border-white/10 bg-[rgba(8,8,8,0.98)] text-white sm:max-w-lg"
      >
        <DialogHeader className="items-center text-center sm:items-start sm:text-left">
          <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
            <Languages className="size-6" />
          </div>
          <DialogTitle className="text-lg text-white">
            No traduzca esta plataforma
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Plugins como Google Translate o la traducción automática del navegador
            pueden alterar la interfaz y provocar fallos en el OP3DViewer. Desactívelos
            o use la plataforma en su idioma original para una experiencia correcta.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <img
            src={TRANSLATION_WARNING_GIF_SRC}
            alt="Cómo desactivar la traducción automática del navegador"
            className="w-full overflow-hidden rounded-2xl border border-white/10 bg-black"
          />
        ) : null}
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:items-stretch">
          <Button className="w-full" onClick={onDismiss}>
            Entendido
          </Button>
          <Button variant="ghost" className="w-full text-white/60" onClick={onDismissPermanently}>
            No volver a mostrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
