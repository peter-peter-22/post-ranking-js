import { SearchReply } from "redis"

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
            return value === "1"
        case "json":
            return JSON.parse(value)
        case "date":
            return new Date(parseInt(value))
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
            return value ? "1" : "0"
        case "json":
            if (!(typeof value === "object")) throw new Error("Invalid json")
            return JSON.stringify(value)
        case "date":
            if (!(value instanceof Date)) throw new Error("Invalid date")
            // Serialize timestamp to make it sortable
            return value.getTime().toString()
        default:
            throw new Error(`Unknown field type ${fieldType}`)
    }
}

export type HSetValue = { [key: string]: any }
export type HSetSchema<TData extends HSetValue> = { [K in keyof TData]: FieldType }

export function typedHSet<TData extends HSetValue>(schema: HSetSchema<TData>) {
    const deserialize = (data: { [key: string]: string }): TData => {
        return Object.fromEntries(
            Object.entries(schema).map(
                ([key, fieldType]) => {
                    const value = data[key]
                    return [key, deserializeField(value, fieldType)]
                }
            )
        ) as TData
    }

    const serialize = (data: TData): Record<string, string> => {
        return serializePartial(data)
    }

    const serializePartial = (data: Partial<TData>): Record<string, string> => {
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

    const parseSearch = (searchResult: SearchReply): TData[] => {
        return searchResult.documents.map(({ value }) => deserialize(value as Record<string, string>))
    }


    return { serialize, deserialize, parseSearch, serializePartial }
}

export type TypedHSetHandler<TData extends HSetValue> = ReturnType<typeof typedHSet<TData>>