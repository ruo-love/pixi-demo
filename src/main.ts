import '@pixi/layout';
import "@pixi/sound";
import { setEngine } from "./app/getEngine";
// import { LoadScreen } from "./app/screens/LoadScreen";
// import { MainScreen } from "./app/screens/main/MainScreen";
import { FirstPage } from "./app/screens/courses/firstPage";
import { SecondPage } from "./app/screens/courses/secondPage";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";
import { ThirdPage } from './app/screens/courses/thirdPage';


/**
 * Importing these modules will automatically register there plugins with the engine.
 */
// import "@esotericsoftware/spine-pixi-v8";

// Create a new creation engine instance
const engine = new CreationEngine();
setEngine(engine);

(async () => {
  // Initialize the creation engine instance
  await engine.init({
    background: "#1E1E1E",
    resizeOptions: { minWidth: 768, minHeight: 1024, letterbox: false },
  });
  // Initialize the user settings
  userSettings.init();
  await engine.navigation.showScreen(FirstPage);
  // Show the load screen

  // Show the main screen once the load screen is dismissed
  // await engine.navigation.showScreen(MainScreen);
})();