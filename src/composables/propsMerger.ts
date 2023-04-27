import { computed, mergeProps } from 'vue'

export default function usePropsMerger () {
  function merge (ctx: any, ...props: any[]) {
    const toReturn: any[] = []
    
    props.forEach(prop => {
      if (!prop) {
        return
      }
      
      const cloneProp = { ...prop }
      const keys = Object.keys(prop)
      
      keys.forEach(key => {
        if (prop[key] instanceof Function) {
          cloneProp[key] = prop[key](ctx)
          return
        }
      })
      
      return toReturn.push(cloneProp)
    })
    
    return mergeProps(...toReturn)
  }
  
  return {
    merge
  }
}
