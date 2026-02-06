import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "./common/infrastructure/http/server.js";
import { env } from "./config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

const app = createServer(publicDir);

app.listen(env.PORT, () => {
  console.log(`Servidor rodando na porta ${env.PORT}`);
});
