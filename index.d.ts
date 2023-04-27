declare module 'vue' {  // Vue 3
  export interface GlobalComponents {
    Portal: typeof import('portal-vue')['Portal']
    PortalTarget: typeof import('portal-vue')['PortalTarget']
  }
}

export {}
