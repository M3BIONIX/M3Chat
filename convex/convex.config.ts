import { defineApp } from "convex/server";
import workpool from "@convex-dev/workpool/convex.config.js";

const app = defineApp();
app.use(workpool, { name: "fileEmbedding" });
app.use(workpool, { name: "messageEmbedding" });
export default app;