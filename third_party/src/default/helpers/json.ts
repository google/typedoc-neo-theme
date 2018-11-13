/**
 * Converts a JSON input to a serialized string. This is useful for debugging.
 *
 * @param json The JSON object that should be updated.
 * @return     The serialized string.
 */
export function json(json: Object): string {
    return JSON.stringify(json)
}
