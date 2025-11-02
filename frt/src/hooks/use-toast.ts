import { toast as sonnerToast } from "sonner"

export interface ToastProps {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function toast(props: ToastProps) {
  sonnerToast(props.title, {
    description: props.description,
    action: props.action && {
      label: props.action.label,
      onClick: props.action.onClick,
    },
  })
}

export const useToast = () => {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    error: (message: string) => {
      sonnerToast.error(message)
    },
    success: (message: string) => {
      sonnerToast.success(message)
    },
  }
}