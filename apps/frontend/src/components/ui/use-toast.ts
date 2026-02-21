// Simple mock implementation of use-toast for MVP
import { useState, useCallback } from "react"

export type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(({ title, description, variant = "default" }: ToastProps) => {
    // In a real app this would render an actual UI toast
    // For MVP console log fallback or trigger basic DOM API
    console.log(`[TOAST] ${variant.toUpperCase()}: ${title} - ${description}`)
    setToasts((prev) => [...prev, { title, description, variant }])
    
    // Quick DOM creation for fallback MVP toast
    try {
      if (typeof window !== "undefined") {
        const div = document.createElement("div")
        const id = "toast-" + Math.random().toString(36).substr(2, 9)
        div.id = id
        div.className = `fixed bottom-4 right-4 z-50 p-4 rounded-md shadow-lg border transition-all duration-300 transform translate-y-0 opacity-100 ${
          variant === "destructive" 
            ? "bg-red-950 border-red-900 text-red-400" 
            : "bg-emerald-950 border-emerald-900 text-emerald-400"
        }`
        div.innerHTML = `
          <h4 class="font-bold mb-1">${title || "Notification"}</h4>
          <p class="text-sm opacity-90">${description || ""}</p>
        `
        document.body.appendChild(div)
        
        // Remove after 3 seconds
        setTimeout(() => {
          const el = document.getElementById(id)
          if (el) {
            el.className = el.className.replace("translate-y-0 opacity-100", "translate-y-2 opacity-0")
            setTimeout(() => el.remove(), 300)
          }
        }, 3000)
      }
    } catch(e) {}
  }, [])

  return { toast, toasts }
}
