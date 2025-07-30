export const placeholderElement="default"

export function getPersistentSet(data:string[]){
    return data.filter(e=>e!==placeholderElement)
}

export function getPersistentSetLength(data:number){
    return {length:data-1,exists:data>0}
}

export function getPersistentSetUnionLength(data:number){
    return {length:data-1,exists:data>0}
}

export function createPersistentSet(data:string[]){
    return [...data,placeholderElement]
}