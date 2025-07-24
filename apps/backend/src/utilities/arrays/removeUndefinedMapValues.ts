export function removeUndefinedMapValues<TKey, TValue>(map: Map<TKey, TValue|undefined>):Map<TKey, TValue> {
    for (const [key, value] of map) {
        if (value === undefined) {
            map.delete(key);
        }
    }
    return map as Map<TKey, TValue>
}