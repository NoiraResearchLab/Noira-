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
    shutdown: () => console.log("[Perception] terminated."),
  },
  cognition: {
    id: "cognition",
    label: "Cognitive Engine",
    active: false,
    priority: 2,
    init: () => console.log("[Cognition] boot sequence started."),
    shutdown: () => console.log("[Cognition] shutdown complete."),
  },
  recall: {
    id: "recall",
    label: "Vault Recall System",
    active: false,
    priority: 3,
    init: () => console.log("[Recall] memory links connected."),
    shutdown: () => console.log("[Recall] dismounted."),
  },
}

/**
 * Activate a module by ID
 */
export function activateModule(id: string): void {
  const mod = coreModuleMap[id]
  if (!mod) {
    console.warn(`[!] Module "${id}" not found.`)
    return
  }

  if (mod.active) {
    console.info(`[~] Module "${id}" is already active.`)
    return
  }

  mod.active = true
  mod.init()
  console.log(`[+] Module "${id}" activated.`)
}

/**
 * Deactivate a module by ID
 */
export function deactivateModule(id: string): void {
  const mod = coreModuleMap[id]
  if (!mod) {
    console.warn(`[!] Module "${id}" not found.`)
    return
  }

  if (!mod.active) {
    console.info(`[~] Module "${id}" is already inactive.`)
    return
  }

  mod.active = false
  mod.shutdown()
  console.log(`[-] Module "${id}" deactivated.`)
}

/**
 * Toggle activation state
 */
export function toggleModule(id: string): void {
  const mod = coreModuleMap[id]
  if (!mod) {
    console.warn(`[!] Module "${id}" not found.`)
    return
  }

  mod.active ? deactivateModule(id) : activateModule(id)
}

/**
 * Get currently active modules sorted by priority
 */
export function getActiveModules(): NeuroModule[] {
  return Object.values(coreModuleMap)
    .filter(m => m.active)
    .sort((a, b) => a.priority - b.priority)
}

/**
 * Get all registered modules (sorted)
 */
export function listAllModules(): NeuroModule[] {
  return Object.values(coreModuleMap).sort((a, b) => a.priority - b.priority)
}
