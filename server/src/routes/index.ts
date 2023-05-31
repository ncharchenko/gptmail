import express from 'express';
import submitPrompt from "./submitPrompt";

const routes = express.Router();

routes.use("/submitPrompt", submitPrompt);

export default routes;