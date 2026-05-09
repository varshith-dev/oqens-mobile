import { useRef } from 'react'
import { ToastRef, ToastType } from '../components/shared/Toast'

// Global ref set by ToastProvider
export let globalToastRef: React.RefObject<ToastRef> | null = null

export function setGlobalToastRef(ref: React.RefObject<ToastRef>) {
  globalToastRef = ref
}

export function useToast() {
  return {
    show: (message: string, type: ToastType = 'info', duration = 3000) => {
      globalToastRef?.current?.show(message, type, duration)
    },
  }
}
