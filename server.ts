import { app } from "./app";
import { env } from "./src/config/env";

app.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port}`);
});
