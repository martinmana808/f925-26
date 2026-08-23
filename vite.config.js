import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { imagetools } from "vite-imagetools";

// Serve the chat function during `npm run dev`.
//
// In production /api/chat is a Vercel function (or a Netlify one via the
// redirect in _redirects). The plain Vite dev server knows nothing about
// either, so Gary was previously untestable locally without `vercel dev`.
// This mounts the same handler as dev middleware — same code path, same
// guards, so what you test locally is what ships.
function garyDevApi(mode) {
	return {
		name: "gary-dev-api",
		apply: "serve",
		configureServer(server) {
			// Vite only exposes VITE_-prefixed vars to the client and nothing to
			// process.env, but the handler reads the provider keys the same way
			// it does in production. Fill in anything not already set.
			const fileEnv = loadEnv(mode, process.cwd(), "");
			for (const [key, value] of Object.entries(fileEnv)) {
				if (process.env[key] === undefined) process.env[key] = value;
			}

			server.middlewares.use("/api/chat", async (req, res) => {
				try {
					const chunks = [];
					for await (const chunk of req) chunks.push(chunk);
					req.body = chunks.length ? Buffer.concat(chunks).toString() : "";

					// Vite reloads the module graph on edit, so pick the handler
					// up per request rather than caching it at startup.
					const mod = await server.ssrLoadModule("/api/chat.js");

					res.status = (code) => {
						res.statusCode = code;
						return res;
					};
					res.json = (payload) => {
						res.setHeader("Content-Type", "application/json");
						res.end(JSON.stringify(payload));
						return res;
					};
					res.send = (payload) => {
						res.end(typeof payload === "string" ? payload : JSON.stringify(payload));
						return res;
					};

					await mod.default(req, res);
				} catch (error) {
					console.error("gary-dev-api:", error);
					res.statusCode = 500;
					res.end(JSON.stringify({ error: "Dev handler failed" }));
				}
			});
		},
	};
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [imagetools(), svelte(), garyDevApi(mode)],
}));
