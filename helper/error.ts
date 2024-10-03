import path from 'path';

const exclude: string[] = ['status', 'message', 'stack', 'cause'];

interface ErrorObject {
    message: string;
    reason?: string;
    name?: string;
    status?: number;
    stack?: string;
    cause?: ErrorObject;
    [key: string]: any;
}

interface SerializedError {
    message: string;
    reason?: string;
    className?: string;
    stackTrace?: StackTrace[];
    [key: string]: any;
}

interface StackTrace {
    fileName: string;
    className: string;
    methodName: string;
    lineNumber: number;
}

function createError(e: ErrorObject, debug: boolean): SerializedError {
    const json: SerializedError = serializeError(e, debug);
    json.status = e.status || 500;
    return json;
}

function serializeError(e: ErrorObject, debug: boolean): SerializedError {
    const json: SerializedError = {
        message: e.message
    };

    if (e.reason) {
        json.reason = e.reason;
    }

    if (debug) {
        json.className = e.name;
        json.stackTrace = serializeStackTrace(e.stack);

        if (e.cause) {
            json.cause = serializeError(e.cause,true);
        }
    }

    for (const name in e) {
        if (e.hasOwnProperty(name) && exclude.indexOf(name) === -1) {
            json[name] = e[name];
        }
    }

    return json;
}

function serializeStackTrace(stack?: string): StackTrace[] {
    const trace: StackTrace[] = [];
    const lines: string[] = stack ? stack.split('\n') : [];
    const linePattern = /at ([^(]*) \((.*, )?(.+):(\d+):\d+\)/;

    let i = 1;

    for (const line of lines) {
        const parts = linePattern.exec(line);
        if (!parts) {
            continue;
        }
        const methodName: string = parts[1];
        const lineNumber: number = Number(parts[4]);
        let fileName: string = path.basename(parts[3]);
        const className: string = path.basename(fileName, path.extname(fileName));

        if (parts[3].indexOf('/code/') === 0) {
            fileName = parts[3];
        }

        trace.push({
            fileName: fileName,
            className: className,
            methodName: methodName,
            lineNumber: lineNumber
        });
    }
    return trace;
}

export default createError;