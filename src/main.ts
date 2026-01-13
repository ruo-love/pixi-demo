import { Application, Assets } from 'pixi.js';
import '@esotericsoftware/spine-pixi-v8';

// Asynchronous IIFE
(async () => {
  // Create a PixiJS application.
  const app = new Application();

  // Intialize the application.
  await app.init({ background: '#1099bb', resizeTo: window });

  // Then adding the application's canvas to the DOM body.
  document.getElementById("pixi-container").appendChild(app.canvas);

  // Load the assets.
  await Assets.load([
    {
      alias: 'spineSkeleton',
    },
    {
      alias: 'spineAtlas',
    },
    {
      alias: 'sky',
    },
    {
      alias: 'background',
    },
    {
      alias: 'midground',
    },
    {
      alias: 'platform',
    },
  ]);
})();
