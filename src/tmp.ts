import * as _tmp from 'tmp';

declare var _tmp: {
    file: (options: { [key: string]: string }, cb: (err, path) => void) => void
};

const tmpFile = (options: { [key: string]: string }) => {
    return new Promise((resolve, reject) => {
        _tmp.file(options, (err, path) => {
            if (err)
                return reject(err);
                resolve(path);
        });
    });
};

export default tmpFile;