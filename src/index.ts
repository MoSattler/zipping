import fs from "fs";
import path from "path";
import apiEndpoint from "./function";

const PATH_EXAMPLE_CSV = "../example.csv";
const ZIP_OUTPUT_PATH = "../output.zip";

async function readCSV(filePath: string) {
  return fs.promises.readFile(filePath);
}

async function writeZip(file: Buffer, filePath: string) {
  try {
    await fs.promises.writeFile(filePath, file);
    console.log("File written successfully");
  } catch (err) {
    console.error("Error writing file:", err);
  }
}

const main = async () => {
  const zipFilePath = "output.zip"; // The path where the zip file will be saved

  try {
    const jsonData = await readCSV(path.join(__dirname, PATH_EXAMPLE_CSV));
    const zip = await apiEndpoint(jsonData);
    await writeZip(zip, path.join(__dirname, ZIP_OUTPUT_PATH))
    console.log(`Zip file has been created at ${zipFilePath}`);
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
