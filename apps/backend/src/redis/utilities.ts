export function toMap<TData>(rows: TData[], getKey: (row: TData) => string): Map<string, TData[]> {
    const map = new Map<string, TData[]>()
    for (const row of rows) {
        const userId = getKey(row)
        let userData = map.get(userId)
        if (userData === undefined) {
            userData = [] as TData[]
            map.set(userId, userData)
        }
        userData.push(row)
    }
    return map
}