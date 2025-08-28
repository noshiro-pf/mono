import { exec } from 'node:child_process';
import { Result } from 'ts-data-forge';

function $(command, options) {
    const { silent = false, ...restOptions } = options ?? {};
    if (!silent) {
        echo(`$ ${command}`);
    }
    return new Promise((resolve) => {
        // eslint-disable-next-line security/detect-child-process
        exec(command, 
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        restOptions, (error, stdout, stderr) => {
            if (!silent) {
                if (stdout !== '') {
                    echo(stdout);
                }
                if (stderr !== '') {
                    console.error(stderr);
                }
            }
            if (error !== null) {
                resolve(Result.err(error));
            }
            else {
                resolve(Result.ok({ stdout, stderr }));
            }
        });
    });
}

export { $ };
//# sourceMappingURL=exec-async.mjs.map
