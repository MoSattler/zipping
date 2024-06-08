import fs from "fs";
import path from "path";
import apiEndpoint from "./function";
import { Readable } from "stream";

const PATH_EXAMPLE_CSV = "../example.csv";
const ZIP_OUTPUT_PATH = "../output.zip";

function readCSV(filePath: string): fs.ReadStream {
  return fs.createReadStream(filePath);
}

async function writeZip(outputStream: Readable, outputPath: string) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(outputPath);
    outputStream.pipe(writeStream);

    writeStream.on("finish", () => {
      console.log("File written successfully");
      resolve(null);
    });

    writeStream.on("error", (err) => {
      console.error("Error writing file:", err);
      reject(err);
    });
  });
}

const main = async () => {
  const zipFilePath = path.join(__dirname, ZIP_OUTPUT_PATH);

  try {
    const csvStream = readCSV(path.join(__dirname, PATH_EXAMPLE_CSV));
    const zipStream = apiEndpoint(csvStream);
    await writeZip(zipStream, zipFilePath);
    console.log(`Zip file has been created at ${zipFilePath}`);
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
