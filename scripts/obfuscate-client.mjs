import { access, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import JavaScriptObfuscator from "javascript-obfuscator";

const appMarkers = ["/assets/prenup/", "Mayumi Vergara", "A map of"];

const chunkDirectoryCandidates = [
  path.join(process.cwd(), ".next", "static", "chunks"),
  path.join(process.cwd(), ".vercel", "output", "static", "_next", "static", "chunks"),
  path.join(process.cwd(), "out", "_next", "static", "chunks"),
  path.join(process.cwd(), ".vinext", "static", "chunks"),
];

async function locateChunksDirectory() {
  for (const candidate of chunkDirectoryCandidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Build adapters can relocate client assets before this post-build step.
    }
  }
  return null;
}

async function findJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? findJavaScriptFiles(target) : target.endsWith(".js") ? [target] : [];
  }));
  return files.flat();
}

const chunksDirectory = await locateChunksDirectory();

if (!chunksDirectory) {
  console.warn("[obfuscate] Client chunks were already relocated by the deployment adapter; skipping post-build obfuscation safely.");
  process.exit(0);
}

const files = await findJavaScriptFiles(chunksDirectory);
let protectedChunks = 0;

for (const file of files) {
  const source = await readFile(file, "utf8");
  if (!appMarkers.some((marker) => source.includes(marker))) continue;

  const result = JavaScriptObfuscator.obfuscate(source, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    identifierNamesGenerator: "hexadecimal",
    numbersToExpressions: false,
    renameGlobals: false,
    renameProperties: false,
    selfDefending: false,
    simplify: true,
    splitStrings: false,
    stringArray: true,
    stringArrayCallsTransform: false,
    stringArrayEncoding: ["base64"],
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayThreshold: 0.55,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
  });

  await writeFile(file, result.getObfuscatedCode(), "utf8");
  protectedChunks += 1;
}

if (protectedChunks === 0) console.warn("[obfuscate] No matching application chunk was found; build output was left unchanged.");

const bytes = (await Promise.all(files.map((file) => stat(file)))).reduce((total, item) => total + item.size, 0);
console.log(`[obfuscate] Protected ${protectedChunks} application chunk(s); ${bytes} client bytes emitted.`);
