export const baqendUrl: string = process.argv[2] || 'tcp://localhost:8081'; // baqend protocol connection port, used in net.ts
export const host: string = process.argv[3] || 'http://localhost:8080/v1'; // baqend sdk connection url, used in code.ts
export const debug: boolean = !process.argv[2] || process.argv[4] === 'debug'; //enable node stack traces in responses