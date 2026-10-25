import { copyFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { generateCloudflareRedirectsFile } from "./generateCloudflarePagesRouting";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(scriptDir, "..", "..");
const publicDir = join(repoRoot, "public");
const buildDir = join(repoRoot, "build");

const phase = process.argv[2];

function writeRedirects(): void {
	const redirectsPath = join(publicDir, "_redirects");
	const content = generateCloudflareRedirectsFile();
	writeFileSync(redirectsPath, content, "utf8");
	console.log(`Wrote ${redirectsPath}`);
}

function write404HtmlFromBuild(): void {
	const indexPath = join(buildDir, "index.html");
	const notFoundPath = join(buildDir, "404.html");
	copyFileSync(indexPath, notFoundPath);
	console.log(`Wrote ${notFoundPath} (copy of index.html for Cloudflare Pages 404 handling)`);
}

switch (phase) {
	case "prebuild":
		writeRedirects();
		break;
	case "postbuild":
		write404HtmlFromBuild();
		break;
	default:
		console.error(
			"Usage: tsx src/routing/runGenerateCloudflarePagesRouting.ts <prebuild|postbuild>",
		);
		process.exit(1);
}
