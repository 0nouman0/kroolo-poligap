declare module 'node-latex' {
  import { Readable } from 'stream';
  function latex(input: Readable, options?: { inputs?: string[] }): NodeJS.ReadableStream;
  export default latex;
}
