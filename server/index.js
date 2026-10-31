import app from './api.js';

const port = Number(process.env.API_PORT || 3001);
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Brightloop API listening on http://127.0.0.1:${port}`);
});

server.on('error', (error) => {
  console.error('Could not start the Brightloop API:', error);
  process.exitCode = 1;
});
