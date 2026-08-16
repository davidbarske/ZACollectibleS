import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const client = join(dist, "client");
const server = join(dist, "server");
const metadata = join(dist, ".openai");

await rm(dist, { recursive: true, force: true });
await Promise.all([
  mkdir(client, { recursive: true }),
  mkdir(server, { recursive: true }),
  mkdir(metadata, { recursive: true })
]);

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.name === "assets" && entry.isDirectory()) {
    await cp(join(root, entry.name), join(client, entry.name), { recursive: true });
    continue;
  }
  if (entry.isFile() && /\.(?:html|xml|txt)$/i.test(entry.name)) {
    await cp(join(root, entry.name), join(client, entry.name));
  }
}

const worker = `const worker = {
  async fetch(request, env) {
    if (!env?.ASSETS?.fetch) {
      return new Response("Static asset binding unavailable", { status: 503 });
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const url = new URL(request.url);
    if (url.pathname !== "/" && !url.pathname.split("/").pop().includes(".")) {
      url.pathname = url.pathname.replace(/\\\/$/, "") + ".html";
      return env.ASSETS.fetch(new Request(url, request));
    }

    return response;
  }
};

export default worker;
`;

await writeFile(join(server, "index.js"), worker, "utf8");
await writeFile(
  join(metadata, "hosting.json"),
  await readFile(join(root, ".openai", "hosting.json"), "utf8"),
  "utf8"
);
