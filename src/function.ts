import archiver from "archiver";
import csvParser from "csv-parser";
import { PassThrough, Readable } from "stream";

async function parseCSV<Row>(buffer: Buffer) {
  const results: Row[] = [];

  return new Promise<Row[]>((resolve, reject) => {
    Readable.from(buffer)
      .pipe(csvParser())
      .on("data", (data: Row) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

export async function createZip<T>(jsonData: T[]): Promise<Buffer> {
  return new Promise((resolve) => {
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const bufferStream = new PassThrough();
    const chunks: Buffer[] = [];

    bufferStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    archive.on("error", (err) => {
      throw err;
    });

    bufferStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    archive.pipe(bufferStream);

    jsonData.forEach((row, index) => {
      archive.append(JSON.stringify(row, null, 2), {
        name: `row${index + 1}.json`,
      });
    });

    archive.finalize();
  });
}

const apiEndpoint = async (csv: Buffer) => {
  const parsedCSV = await parseCSV(csv);
  const zip = await createZip(parsedCSV);
  return zip;
};

export default apiEndpoint;
