/**
 * Converts a JSON input to a serialized string. This is useful for debugging.
 *
 * @param json The JSON object that should be updated.
 * @return     The serialized string.
 */
export function json(json: Object | string): string {
    if (typeof json === 'string') {
        console.warn('Warning - Type is string, not object:', json)
        return json
    }
    return JSON.stringify(json)
}
