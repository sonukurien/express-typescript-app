class Abort extends Error {
    message: string;
    data: any;
    status: number;
    name: string;

    constructor(message?: string, data?: any) {
        super(message || 'Aborted by script.');
        Error.captureStackTrace(this, this.constructor);
        this.message = message || 'Aborted by script.';
        this.data = data;
        this.status = 475;
        this.name = 'Abort';
    }
}

export default Abort;