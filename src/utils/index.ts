import { readFile } from "fs";

export const readFileAsync = (fp: string): Promise<Buffer> =>
  new Promise((resolve, reject) =>
    readFile(fp, (err, data) => (err ? reject(err) : resolve(data)))
  );

export const stripLeadingSlash = (s: string) =>
  s.indexOf("/") === 0 ? s.substring(1) : s;
