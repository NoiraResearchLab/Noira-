export interface NeuroModule {
  id: string
  label: string
  active: boolean
  priority: number
  init(): void
  shutdown(): void
}

export const coreModuleMap: Record<string, NeuroModule> = {
  perception: {
    id: "perception",
    label: "Perception Matrix",
    active: true,
    priority: 1,
    init: () => console.log("[Perception] initialized."),
    shutdown: () => console.log("[Perception] terminated.")
  },
  cognition: {
    id: "cognition",
    label: "Cognitive Engine",
    active: false,
    priority: 2,
    init: () => console.log("[Cognition] boot sequence started."),
    shutdown: () => console.log("[Cognition] shutdown complete.")
  },
  recall: {
    id: "recall",
    label: "Vault Recall System",
    active: false,
    priority: 3,
    init: () => console.log("[Recall] memory links connected."),
    shutdown: () => console.log("[Recall] dismounted.")
  }
}

export function activateModule(id: string): void {
  const mod = coreModuleMap[id]
  if (mod && !mod.active) {
    mod.active = true
    mod.init()
  }
}
