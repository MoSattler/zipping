import archiver from "archiver";
import csvParser from "csv-parser";
import { PassThrough, Readable } from "stream";

function parseCSV<Row>(inputStream: Readable) {
  const outputStream = new PassThrough();

  inputStream
    .pipe(csvParser())
    .on("data", (data: Row) => {
      outputStream.write(JSON.stringify(data) + "\n");
    })
    .on("end", () => {
      outputStream.end();
    })
    .on("error", (error) => {
      outputStream.destroy(error);
    });

  return outputStream;
}

function createZipFromStream(inputStream: Readable): Readable {
  const outputStream = new PassThrough();
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  archive.pipe(outputStream);

  let index = 0;
  inputStream.on("data", (data) => {
    archive.append(data, { name: `row${++index}.json` });
  });

  inputStream.on("end", () => {
    archive.finalize();
  });

  inputStream.on("error", (error) => {
    outputStream.destroy(error);
  });

  return outputStream;
}

const apiEndpoint = (csvStream: Readable) => {
  const parsedStream = parseCSV(csvStream);
  const zipStream = createZipFromStream(parsedStream);
  return zipStream;
};

export default apiEndpoint;
