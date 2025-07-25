type FieldType = "string" | "number" | "boolean" | "date" | "json"

const nullSerizalized = "__NULL__"

function deserializeField(value: string | undefined, fieldType: FieldType) {
    if (value === undefined) return undefined
    if (value === nullSerizalized) return null
    switch (fieldType) {
        case "string":
            return value
        case "number":
            return Number(value)
        case "boolean":
            return value === "true"
        case "json":
            return JSON.parse(value)
        case "date":
            return new Date(value)
        default:
            throw new Error(`Unknown field type ${fieldType}`)
    }
}

function serializeField(value: any, fieldType: FieldType): string | undefined {
    if (value === undefined) return undefined
    if (value === null) return nullSerizalized
    switch (fieldType) {
        case "string":
            if (!(typeof value === "string")) throw new Error("Invalid string")
            return value
        case "number":
            if (!(typeof value === "number")) throw new Error("Invalid number")
            return value.toString()
        case "boolean":
            if (!(typeof value === "boolean")) throw new Error("Invalid boolean")
            return value.toString()
        case "json":
            if (!(typeof value === "object")) throw new Error("Invalid json")
            return JSON.stringify(value)
        case "date":
            if (!(value instanceof Date)) throw new Error("Invalid date")
            return value.toISOString()
        default:
            throw new Error(`Unknown field type ${fieldType}`)
    }
}

export type HSetSchema = { [key: string]: FieldType }
export type HSetValue = { [key: string]: any }

export function typedHSet<T extends HSetValue>(schema: HSetSchema) {
    const deserialize = (data: { [key: string]: string }): T => {
        return Object.fromEntries(
            Object.entries(schema).map(
                ([key, fieldType]) => {
                    const value = data[key]
                    return [key, deserializeField(value, fieldType)]
                }
            )
        ) as T
    }

    const serialize = (data: T): Record<string, string> => {
        const result: Record<string, string> = {}
        Object.entries(schema).map(
            ([key, fieldType]) => {
                const value = data[key]
                const serialized = serializeField(value, fieldType)
                if (serialized)
                    result[key] = serialized
            }
        )
        return result
    }

    return { serialize, deserialize }
}

export type TypedHSetHandler<TData extends HSetValue>=ReturnType<typeof typedHSet<TData>>

