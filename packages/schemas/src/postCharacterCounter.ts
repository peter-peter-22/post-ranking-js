import { urlRegex } from "./regex"

const urlLength = 20

export const maxPostTextLength=500

// Get the length of a string that is used by the post editor.
export function getEffectiveLength(value: string) {
    // Replace urls with a fixed X character long placeholder text.
    value = value.replace(urlRegex, "*".repeat(urlLength))
    return value.length
}