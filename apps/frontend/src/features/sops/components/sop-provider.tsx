import { createContext, useContext } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type SopDocument } from '../data/schema'

type SopDialogType = 'generate-exam'

interface SopContextType {
  open: SopDialogType | null
  setOpen: (type: SopDialogType | null) => void
  currentSop: SopDocument | null
  setCurrentSop: (sop: SopDocument | null) => void
}

const SopContext = createContext<SopContextType | undefined>(undefined)

export function SopProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<SopDialogType>()
  const [currentSop, setCurrentSop] = useDialogState<SopDocument>()

  return (
    <SopContext.Provider
      value={{ open, setOpen, currentSop: currentSop as SopDocument | null, setCurrentSop }}
    >
      {children}
    </SopContext.Provider>
  )
}

export function useSops() {
  const context = useContext(SopContext)
  if (!context) {
    throw new Error('useSops must be used within a SopProvider')
  }
  return context
}
