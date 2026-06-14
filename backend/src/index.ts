import path from "node:path";

import { createApp } from "./app.js";
import { createDatabase } from "./database/database.js";

const databasePath =
  process.env.DATABASE_PATH ?? path.resolve("data/task-manager.db");
const database = createDatabase(databasePath);
const app = createApp(database);
const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
