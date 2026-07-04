import { Toaster as Sonner } from 'sonner'

/** Toasts do produto (feedback de ações). Estilo alinhado ao design. */
export function Toaster() {
  return (
    <Sonner
      position="top-right"
      gap={12}
      toastOptions={{
        style: {
          borderRadius: '12px',
          border: '1px solid #E4E7EC',
          boxShadow: '0 6px 18px rgba(16,24,40,.08)',
          fontFamily: 'inherit',
          color: '#1A2433',
        },
      }}
    />
  )
}

export { toast } from 'sonner'
