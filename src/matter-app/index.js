import { Application, Assets, Container,Sprite } from 'pixi.js';
import * as Matter from 'matter-js';
import manifest from "../manifest.json";
(async () => {
    // 1. 初始化 PixiJS Application
    const app = new Application();
    await app.init({ background: '#1099bb', resizeTo: window });
    const root = document.getElementById("pixi-container");
    root.appendChild(app.canvas);

    // 2. 初始化资源
    await Assets.init({ manifest, basePath: "assets" });
    await Assets.loadBundle(["spineboy"]);

    // 3. 初始化 Matter.js 引擎
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite;

    const engine = Engine.create();
    const runner = Runner.create();
    Runner.run(runner, engine);
    // 创建 Matter 自带的线框渲染器
    const debugRender = Render.create({
        element:  document.getElementById("matter-container"), // 将调试画布添加到 body
        engine: engine,
        options: {
            width: app.screen.width,
            height: app.screen.height,
            wireframes: true,      // 关键：激活线框模式
            background: 'transparent' // 背景透明，这样能看到底下的 Pixi 画面
        }
    });

    const debugCanvas = debugRender.canvas;
    debugCanvas.style.position = "absolute";
    debugCanvas.style.top = "0";
    debugCanvas.style.left = "0";
    debugCanvas.style.zIndex = "0"; // 置于底层
    debugCanvas.style.pointerEvents = "none"; // 彻底禁用鼠标事件拦截

    // 确保 Pixi 的 Canvas 在上面
    app.canvas.style.position = "relative";
    app.canvas.style.zIndex = "0";

    Render.run(debugRender);
    const world = new Container()
    app.stage.addChild(world);
    const boxWidth = 100;
    const boxHeight = 100;
    const dSize = 30
    const box = new Container()
    world.addChild(box)
  const radius = 200; // 球体房间的半径
const wallCount = 164; // 用多少块墙组成圆（越多越圆）
const wallThickness = 100; // 墙壁物理厚度，防止高速穿透
const wallLength = (2 * Math.PI * radius) / wallCount + 2; // 每块墙的长度

const parts = [];
for (let i = 0; i < wallCount; i++) {
    const angle = (i / wallCount) * Math.PI * 2;
    
    // 计算每块墙的中心点位置
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const wall = Bodies.rectangle(x, y, wallThickness, wallLength, {
        isStatic: true,
        angle: angle // 让墙块指向圆心
    });
    parts.push(wall);
}

const boxBody = Matter.Body.create({
    parts: parts,
    isStatic: true,
    restitution: 0.8 // 增加弹性，让球在圆环里滚得更顺滑
});

    Matter.Body.setPosition(boxBody, { x: app.screen.width/2, y:
        app.screen.height/2-boxHeight/2,  });
    const dArr = [];
    for (let i = 1; i <= 14; i++) {
        const d = Sprite.from(`d${Math.min(i,4)}`);
        d.width = dSize;
        d.height = dSize;
        d.anchor.set(0.5);
        box.addChild(d); // 依然加到 box 容器里
        // 初始位置随机分布在盒子内部
        const dBody = Bodies.circle(
            boxBody.position.x + (Math.random() - 0.5) * 50,
            boxBody.position.y + (Math.random() - 0.5) * 50,
            dSize / 2, // 使用圆体更符合“球”的物理特性
            { restitution: 0.5, friction: 0.1 }
        );
        d.interactive = true
        d.eventMode = 'static';
        d.cursor = 'pointer';
        d.on('pointerdown',()=>{
            // app.canvas.style.zIndex = "0";
           
            // setTimeout(() => {
            //     app.canvas.style.zIndex = "1";
            // }, 1000);
        })
        dArr.push({ sprite: d, body: dBody });
    }
    
    // 6. 创建一个静态地面
    const ground = Bodies.rectangle(
        app.screen.width/2, 
        app.screen.height/2, 
        app.screen.width/2, 
        10, 
        { isStatic: true }
    );

    // 将物理对象加入世界
    const dBodys = dArr.map(e => e.body);
    Composite.add(engine.world, [boxBody, ...dBodys]);
    // 7. 核心逻辑：同步物理数据到 Pixi 渲染层
    app.ticker.add(() => {
        // 同步盒子容器
        box.x = boxBody.position.x;
        box.y = boxBody.position.y;
        box.rotation = boxBody.angle; // 盒子旋转同步

        // 同步每一个小球
        dArr.forEach(({ sprite, body }) => {
            // 注意：因为 sprite 是 box 的子对象，
            // 我们需要把物理世界的全局坐标转为相对于 box 的局部坐标
            // 或者简单点：直接把 d 加到 world 里而非 box 里
            sprite.x = body.position.x - box.x; 
            sprite.y = body.position.y - box.y;
            sprite.rotation = body.angle;
        });
       
    });

    // 可选：添加点击事件，给角色一个向上的力（跳跃）
    window.addEventListener('mousedown', () => {
       setInterval(()=>{
         dArr.forEach(({body }) => {
            Matter.Body.applyForce(body, body.position, { x: 0.004, y: -0.04 });
        });
       },2000)
    });

})();