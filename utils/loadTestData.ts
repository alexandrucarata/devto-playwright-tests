import { readFileSync } from 'fs';
import { resolve } from 'path';

export function loadTestData(filename: string) {
    const filePath = resolve(__dirname, '../test-data', filename);
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}
