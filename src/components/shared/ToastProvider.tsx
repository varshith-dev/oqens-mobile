import React, { useRef } from 'react'
import { Toast, ToastRef } from './Toast'
import { setGlobalToastRef } from '../../hooks/useToast'

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<ToastRef>(null)
  setGlobalToastRef(ref)
  return (
    <>
      {children}
      <Toast ref={ref} />
    </>
  )
}
