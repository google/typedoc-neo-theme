/**
 * Removes any double-quotes from the input string
 *
 * @param str  The string that should be updated.
 * @return     The original string, omitting double quotes (`"`).
 */
export function removeQuotes(str: string): string {
    return str.replace(/"/g, '')
}
