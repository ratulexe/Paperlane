import { createApiServer } from "./server.js";

const { server, config } = await createApiServer();

server.listen(config.apiPort, () => {
  console.log(JSON.stringify({ level: "info", service: "paperlane-api", port: config.apiPort }));
});
