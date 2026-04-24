export function parseSeqId(v: string): number | null {
    const n = parseInt(v, 10);
    return Number.isInteger(n) && n > 0 && String(n) === v ? n : null;
}
