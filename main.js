import "./style.css";
import javascriptLogo from "./javascript.svg";
import { setupCounter } from "./counter.js";
import Matter from "https://cdn.skypack.dev/matter-js";

// import { transformWithEsbuild } from "vite";
// import "./src/controls.js";
// import { init } from "./src/basicExample.js";
// export {default as init} from './src/basicExample.js'

//boilerplate vite vanilla js coding

// document.querySelector('#app').innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="/vite.svg" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//       <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
//     </a>
//     <h1>Hello Vite!</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite logo to learn more
//     </p>
//   </div>
// `
// setupCounter(document.querySelector('#counter'))

//https://stackoverflow.com/questions/68416755/keyboard-movement-is-jerky-in-matter-js/68425122#68425122

var oGame = {
  init: function () {
    this.initMatterJsObjects();
    this.initGameSettings();
    this.initCanvas();

    this.createMainObjects();
    this.createWorldInit();
    this.setScreenSettings();
    this.setKeyHandlers();

    // this.setHudMain();
    // this.setHudControls();
    this.setMiniMap();

    // this.drawStars(); //unused
    // this.setGamepadHandler(); ununsed
    // this.movementPlanets(); //unused
  },

  initMatterJsObjects: function () {
    this.World = Matter.World;
    this.Body = Matter.Body;
    this.Bodies = Matter.Bodies;
    this.Engine = Matter.Engine;
    this.Events = Matter.Events;
    this.Render = Matter.Render;
    this.Runner = Matter.Runner;
    this.Query = Matter.Query;
    this.Bounds = Matter.Bounds;
    this.Vector = Matter.Vector;
    this.Mouse = Matter.Mouse;
    this.Composite = Matter.Composite;
    this.MouseConstraint = Matter.MouseConstraint;
  },

  initGameSettings: function () {
    //General
    this.delta = 1000 / 50;
    this.gameSize = 6000;

    //Rocket
    this.rocketSpeed = 2 * 1e-5;
    this.fuel = 800;
    this.fuelInit = 1000;
    this.rocket;
    this.rotationSpeed = 0.008;
    this.boostMultiplier = 3;
    this.fuelMultiplier = 1;
    this.fuelBoostMultiplier = 6;

    //Gravity and Interaction
    this.gravityConstant = 0.0005 * 0.5;

    //Camera and Bounding
    this.world_bound_X = 3000;
    this.world_bound_Y = 3000;
    this.zoom = 1;
    this.bounds_scale_target = {};
  },

  initCanvas: function () {
    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d");

    var imageControls = new Image();
    imageControls.src = "./assets/controlsTemplate.png";
    imageControls.onload = function () {
      this.imageControls = imageControls;
    }.bind(this);

    var imageRocket = new Image();
    imageRocket.src = "./assets/rocketDefault.png";
    imageRocket.onload = function () {
      this.rocketDefault = imageRocket;
    }.bind(this);
  },

  _createMainObjects: function () {
    this.engine = this.Engine.create();

    this.render = this.Render.create({
      canvas: document.getElementById("canvas"),
      engine: this.engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        // background: "#071847",
        // wireframeBackground: "#394763",
        hasBounds: true,
        showCollisions: true,
        showVelocity: true,
      },
    });

    this.Render.run(this.render); //this.render ?
    this.runner = this.Runner.create({
      delta: this.delta,
      isFixed: true,
    });
    this.Runner.run(this.runner, this.engine);
    //own Game loop, use Engine.update(engine, delta)
    //https://brm.io/matter-js/docs/classes/Runner.html
    this.engine.gravity.x = 0;
    this.engine.gravity.y = 0.0;
    // this.engine.gravity.isPoint = true;
    // this.engine.gravity.scale = 10;
    this.Events.on(
      this.render,
      "afterRender",
      function () {
        // this.drawStars();
        this.setHudMain();
        this.setHudControls();
        this.setMiniMap();
      }.bind(this)
    );
  },
  get createMainObjects() {
    return this._createMainObjects;
  },
  set createMainObjects(value) {
    this._createMainObjects = value;
  },

  setScreenSettings: function () {
    //https://stackoverflow.com/questions/34913835/how-can-i-move-camera-in-matter-js
    //Examples for Camera Movement and Zoom

    // var canvas = document.getElementById("canvas");
    // this.ctx = canvas.getContext("2d");

    window.onresize = function () {
      this.render.canvas.width = window.innerWidth;
      this.render.canvas.height = window.innerHeight;
    }.bind(this);

    this.Events.on(
      this.runner,
      "beforeUpdate",
      function () {
        // apply zoom
        // var canvas = document.getElementById('canvas');
        // var ctx = canvas.getContext("2d");
        // ctx.translate(window.innerWidth/2, window.innerHeight/2);
        // ctx.scale(this.zoom, this.zoom);
        // ctx.translate(-window.innerWidth/2, -window.innerHeight/2);

        // center view at player
        this.Bounds.shift(this.render.bounds, {
          x: this.rocket.position.x - window.innerWidth / 2,
          y: this.rocket.position.y - window.innerHeight / 2,
        });
      }.bind(this)
    );
  },

  createWorldInit: function () {
    //create World
    this.planets = [];
    this.createHomePlanet(), this.createWalls();
    this.createPlayerRocket();
    this.createHomePlanet();
    this.createColdMoon();
    this.createHotMoon();
    this.createGasPlanet();
    this.createSun();
  },

  createWalls: function () {
    let bodies = [];
    let gameworldSize = this.gameSize;
    bodies.push(
      this.Bodies.rectangle(-gameworldSize, 0, 50, gameworldSize * 2, {
        friction: 0.1,
        frictionStatic: 0,
        frictionAir: 0,
        isStatic: true,
        render: {
          fillStyle: "grey",
          lineWidth: 3,
        },
      })
    );
    bodies.push(
      this.Bodies.rectangle(gameworldSize, 0, 50, gameworldSize * 2, {
        friction: 0.1,
        frictionStatic: 0,
        frictionAir: 0,
        isStatic: true,
        render: {
          fillStyle: "grey",
          lineWidth: 3,
        },
      })
    );
    bodies.push(
      this.Bodies.rectangle(0, gameworldSize, gameworldSize * 2, 50, {
        friction: 0.1,
        frictionStatic: 0,
        frictionAir: 0,
        isStatic: true,
        render: {
          fillStyle: "grey",
          lineWidth: 3,
        },
      })
    );
    bodies.push(
      this.Bodies.rectangle(0, -gameworldSize, gameworldSize * 2, 50, {
        friction: 0.1,
        frictionStatic: 0,
        frictionAir: 0,
        isStatic: true,
        render: {
          fillStyle: "grey",
          lineWidth: 3,
        },
      })
    );
    this.World.add(this.engine.world, bodies, {});
  },

  createPlayerRocket: function () {
    let bodies = [];
    this.rocket = this.Bodies.rectangle(0, 0, 50, 120, {
      inertia: Infinity,
      friction: 0.05,
      frictionStatic: 0,
      frictionAir: 0,
      mass: 1,
      // isStatic: false,
      restitution: 0.2, //bounce 1 = 100% elastic
      render: {
        fillStyle: "#f55a3c",
        // fillStyle: 'transparent',
        lineWidth: 3,
        sprite: {
          texture: "./assets/rocketDefault.png",
          xScale: 0.1,
          yScale: 0.1,
        },
      },
    });
    this.rocket.render.fillStyle = "grey";
    bodies.push(this.rocket);
    this.World.add(this.engine.world, bodies, {});
  },

  createHomePlanet: function () {
    let bodies = [];
    this.homePlanet = this.Bodies.circle(0, 1200, 1000, {
      frictionStatic: 1,
      friction: 1,
      isStatic: true,
      mass: 100,
      render: {
        // fillStyle: "#97641C",
        // strokeStyle: "green",
        // lineWidth: 20,
        sprite: {
          texture: "./assets/homePlanet.png",
          xScale: 0.9,
          yScale: 0.9,
        },
      },
    });

    // this.Body.setDensity( this.homePlanet, density);
    // this.Body.setMass( this.homePlanet, 100)

    this.planets.push(this.homePlanet);
    this.World.add(this.engine.world, [this.homePlanet], {
      // friction: 1,
      // frictionStatic: 5,
      // frictionAir: 0,
      // restitution: 0,
      // isStatic: true,
    });
  },

  createColdMoon: function () {
    this.coldMoon = this.Bodies.circle(-3500, 3000, 490, {
      isStatic: true,
      mass: 15, //test
      render: {
        // fillStyle: "#97641C",
        // strokeStyle: "green",
        // lineWidth: 20,
        sprite: {
          texture: "./assets/coldMoon.png",
        },
      },
    });
    this.planets.push(this.coldMoon);
    this.World.add(this.engine.world, [this.coldMoon], {});
  },

  createHotMoon: function () {
    this.hotMoon = this.Bodies.circle(-2000, -1500, 360, {
      isStatic: true,
      mass: 50,
      render: {
        // fillStyle: "#97641C",
        // strokeStyle: "green",
        // lineWidth: 20,
        sprite: {
          texture: "./assets/hotMoon.png",
          xScale: 0.8,
          yScale: 0.8,
        },
      },
    });
    this.planets.push(this.hotMoon);
    this.World.add(this.engine.world, [this.hotMoon], {});
  },

  createGasPlanet: function () {
    this.gasPlanet = this.Bodies.circle(2500, -2500, 320, {
      isStatic: true,
      mass: 50,
      render: {
        // fillStyle: "#97641C",
        // strokeStyle: "green",
        // lineWidth: 20,
        sprite: {
          texture: "./assets/gasPlanet.png",
          xScale: 1,
          yScale: 1,
        },
      },
    });
    this.planets.push(this.gasPlanet);
    this.World.add(this.engine.world, [this.gasPlanet], {});
  },

  createSun: function () {
    this.sun = this.Bodies.circle(4000, 4000, 800, {
      isStatic: true,
      mass: 250,
      render: {
        // fillStyle: "#97641C",
        // strokeStyle: "green",
        // lineWidth: 20,
        sprite: {
          texture: "./assets/sun.png",
          xScale: 1.1,
          yScale: 1.1,
        },
      },
    });
    this.planets.push(this.sun);
    this.World.add(this.engine.world, [this.sun], {});
  },

  setKeyHandlers: function () {
    //key Events explained:
    //https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event

    const keyHandlers = {
      KeyW: () => {
        this.applyRocketForce(0, Math.PI, this.modifier);
      },
      KeyS: () => {
        this.applyRocketForce(Math.PI, 0, false);
      },
      KeyD: () => {
        this.applyRocketForce(Math.PI / 2, (3 / 2) * Math.PI, false);
      },
      KeyA: () => {
        this.applyRocketForce((3 / 2) * Math.PI, Math.PI / 2, false);
      },
      KeyQ: () => {
        this.Body.rotate(this.rocket, -Math.PI * this.rotationSpeed);
      },
      KeyE: () => {
        this.Body.rotate(this.rocket, Math.PI * this.rotationSpeed);
      },
      KeySpace: () => {},
      KeyF: () => {},
    };

    const keysDown = new Set();
    document.addEventListener("keydown", (event) => {
      keysDown.add(event.code);
      this.modifier = event.shiftKey;
    });
    document.addEventListener("keyup", (event) => {
      keysDown.delete(event.code);
    });

    Matter.Events.on(this.engine, "beforeUpdate", (event) => {
      [...keysDown].forEach((k) => {
        // if (event.getModifierState("Shift")) {
        //   var test = "test";
        // } else {
        //   keyHandlers[k]?.();
        // }
        keyHandlers[k]?.();
      });
    }).bind(this);
  },

  applyRocketForce: function (iOffsetX, iOffsetY, bBoostModifier) {
    // if (this.fuel > 0) {
    let xForce = this.rocketSpeed * Math.sin(this.rocket.angle + iOffsetX);
    let yForce = this.rocketSpeed * Math.cos(this.rocket.angle + iOffsetY);

    if (bBoostModifier) {
      xForce = xForce * this.boostMultiplier;
      yForce = yForce * this.boostMultiplier;
      this.fuel =
        this.fuel -
        (this.fuelMultiplier * this.fuelBoostMultiplier) / this.delta;
    } else {
      xForce = xForce;
      yForce = yForce;
      this.fuel = this.fuel - this.fuelMultiplier / this.delta;
    }

    this.Body.applyForce(
      this.rocket,
      {
        x: this.rocket.position.x,
        y: this.rocket.position.y,
      },
      {
        x: xForce,
        y: yForce,
      }
    );

    // }
  },

  setForceHandler: function () {
    // Forces
    this.Events.on(
      this.runner,
      "beforeTick",
      function () {
        this.applyGravityPlanets(this.homePlanet);
        this.applyGravityPlanets(this.hotMoon);
        this.applyGravityPlanets(this.coldMoon);
        this.applyGravityPlanets(this.gasPlanet);
        this.applyGravityPlanets(this.sun);
      }.bind(this)
    );
  },

  applyGravityPlanets: function (oPlanet) {
    let deltaX = oPlanet.position.x - this.rocket.position.x;
    let deltaY = oPlanet.position.y - this.rocket.position.y;

    let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

    // if ( distance < 3000 ) {
    // let force =
    //   (this.gravityConstant *100* this.rocket.mass * oPlanet.mass) /
    //   (distance * distance);

    //modified fake Force
    let force =
      (this.gravityConstant * this.rocket.mass * oPlanet.mass) / distance;

    let xForce = force * Math.cos(-deltaX / distance + (Math.PI * 1) / 2);
    let yForce = force * Math.sin(deltaY / distance + Math.PI * 0);

    this.Body.applyForce(
      this.rocket,
      {
        x: this.rocket.position.x,
        y: this.rocket.position.y,
      },
      {
        x: xForce,
        y: yForce,
      }
    );

    // }
  },

  setHudMain: function () {
    let hudWidth = 400;
    let hudHeight = 40;

    this.ctx.globalAlpha = 0.6;
    this.ctx.fillStyle = "#18347E";
    this.ctx.fillRect(
      window.innerWidth / 2 - hudWidth / 2,
      window.innerHeight - hudHeight,
      hudWidth,
      -hudHeight
    );
    this.ctx.globalAlpha = 1.0;

    // let hudWidth = 400;
    // let hudHeight = 40;
    // // this.ctx.clearRect();

    if (this.fuel > 0) {
      this.ctx.fillStyle = "#5E42A9";
      this.ctx.fillRect(
        window.innerWidth / 2 - hudWidth / 2,
        window.innerHeight - hudHeight,
        (hudWidth * this.fuel) / this.fuelInit,
        -hudHeight
      );
    }
  },

  setHudControls: function () {
    // let hudWidth = 200;
    // let hudHeight = 200;
    if (this.imageControls) {
      this.ctx.drawImage(
        this.imageControls,
        window.innerWidth,
        window.innerHeight,
        -300,
        (-300 * 1208) / 725
      );
    }

    // this.ctx.fillStyle = "#5E42A9";
    // this.ctx.fillRect(window.innerWidth, window.innerHeight, -200, -200);
  },

  setMiniMap: function () {
    let hudWidth = 350;
    let hudHeight = 350;
    let xOffset = window.innerWidth;


    this.ctx.globalAlpha = 0.4;
    this.ctx.fillStyle = "#5E42A9";
    this.ctx.fillRect(xOffset, 0, -hudWidth, hudHeight);
    this.ctx.globalAlpha = 1.0;

    var scale = (hudWidth /(this.gameSize * 2) );

    //draw dot for masses
;    this.ctx.fillStyle = "#ffff00";
    for (var i = 1; i < this.planets.length; i++) {
      this.ctx.fillRect(
        xOffset - hudWidth/2 + this.planets[i].position.x * scale ,
        this.planets[i].position.y * scale + hudHeight/2,
        10,
        10
      );
    }
    //draw player's dot
    this.ctx.fillStyle = "#ffff00";
    this.ctx.fillRect(
      xOffset - hudWidth/2 + this.rocket.position.x * scale ,
      this.rocket.position.y * scale + hudHeight/2,
      5,
      5
    );
  },
};

oGame.init();
oGame.setForceHandler();

//Image
// var img = new Image();
// img.onload = function() {
//     handleLoadedTexture(img);
// };
// img.src = "image.png";

// function handleLoadedTexture(img) {
//     //call loop etc that uses image
// };
