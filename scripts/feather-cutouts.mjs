/**
 * Soften jagged alpha edges on building cutout PNGs.
 * Blurs the alpha channel only — building pixels stay sharp.
 *
 * Usage:
 *   node scripts/feather-cutouts.mjs [--sigma=0.8] [--dry-run]
 *   npm run feather-cutouts
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const CUTOUTS_DIR = path.join(ROOT, "public", "building-cutouts");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const sigmaArg = args.find((a) => a.startsWith("--sigma="));
const sigma = sigmaArg ? Number(sigmaArg.split("=")[1]) : 0.9;

if (!Number.isFinite(sigma) || sigma <= 0) {
  console.error("Invalid --sigma value");
  process.exit(1);
}

async function featherPng(filePath) {
  const alphaBlurred = await sharp(filePath)
    .ensureAlpha()
    .extractChannel("alpha")
    .blur(sigma)
    .toBuffer();

  const tmp = `${filePath}.feather.tmp`;
  await sharp(filePath)
    .removeAlpha()
    .joinChannel(alphaBlurred)
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(tmp);

  fs.renameSync(tmp, filePath);
}

async function main() {
  if (!fs.existsSync(CUTOUTS_DIR)) {
    console.error(`Cutouts folder not found: ${CUTOUTS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(CUTOUTS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .sort();

  if (files.length === 0) {
    console.log("No PNG files found.");
    return;
  }

  console.log(
    `${dryRun ? "[dry-run] " : ""}Feathering ${files.length} cutout(s) (sigma=${sigma})…`,
  );

  for (const file of files) {
    const filePath = path.join(CUTOUTS_DIR, file);
    if (dryRun) {
      console.log(`  would process: ${file}`);
      continue;
    }
    await featherPng(filePath);
    console.log(`  feathered: ${file}`);
  }

  if (!dryRun) {
    console.log(`Done. Re-run "npm run seed" to push updated cutouts to Sanity.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
