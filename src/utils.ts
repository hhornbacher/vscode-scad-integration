import * as tmp from 'tmp';
import * as fs from 'fs';
import * as promisify from 'pify';

declare const tmp: {
    file: (options: { [key: string]: string }, cb: (err, path) => void) => void
};

type TmpFileFunc = (options: { [key: string]: string }) => Promise<string>;
export const tmpFile: TmpFileFunc = promisify(tmp.file);

export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const write = promisify(fs.write);
export const open = promisify(fs.open);