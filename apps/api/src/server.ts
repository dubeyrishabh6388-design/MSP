import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[Serviqa API Server] Running on http://localhost:${config.port}`);
  console.log(`[Serviqa API Server] Environment: ${config.nodeEnv}`);
});
