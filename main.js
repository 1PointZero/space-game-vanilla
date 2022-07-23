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

  createWorldInit: function () {
    //create World
    this.planets = [];
    this.createWalls();
    this.createHomePlanet();
    this.createPlayerRocket();
    this.createHomePlanet();
    this.createColdMoon();
    this.createHotMoon();
    this.createGasPlanet();
    this.createSun();

    this.createSpaceStation();
    this.createSmallerObjects();
    this.createObservatory();
    this.createBlackHole();
    this.createWhiteHole();
    this.createRustyPlanet();
  },

  initGameSettings: function () {
    //General
    this.delta = 1000 / 50;
    this.gameSize = 6000;
    this.gameTimer = 0;

    //Rocket
    this.rocketSpeed = 2 * 1e-5;
    this.fuel = 800;
    this.fuelInit = 1000;
    this.rocket;
    this.rotationSpeed = 0.008;
    this.boostMultiplier = 3;
    this.fuelMultiplier = 1;
    this.fuelBoostMultiplier = 6;
    this.rocketHeight = 120;
    this.rocketWidth = 50;
    this.solarTimeStamp= 0;
    this.breakTimeStamp= 0;
    this.fuelTimeStamp= 0;

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
        background: "#07071A",
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
    this.rocket = this.Bodies.rectangle(-3000, 2000, 50, 120, {
      inertia: Infinity,
      friction: 0.1,
      frictionStatic: 1,
      frictionAir: 0,
      mass: 1,
      isStatic: false,
      restitution: 0.3, //bounce 1 = 100% elastic
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
    this.homePlanet = this.Bodies.circle(-3000, 3000, 1000, {
      // frictionStatic: 1,
      // friction: 1,
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
    this.World.add(this.engine.world, [this.homePlanet], {});
  },

  createRustyPlanet: function () {
    let bodies = [];
    this.rustyPlanet = this.Bodies.circle(3000, -3300, 1550, {
      // frictionStatic: 1,
      // friction: 1,
      isStatic: true,
      mass: 200,
      render: {
        // fillStyle: "#97641C",
        // strokeStyle: "green",
        // lineWidth: 20,
        sprite: {
          texture: "./assets/rustyPlanet.png",
          xScale: 0.9,
          yScale: 0.9,
        },
      },
    });

    // this.Body.setDensity( this.homePlanet, density);
    // this.Body.setMass( this.homePlanet, 100)

    this.planets.push(this.rustyPlanet);
    this.World.add(this.engine.world, [this.rustyPlanet], {});
  },
  
  createColdMoon: function () {
    // this.coldMoon = this.Bodies.circle(-3500, 3000, 490, {
    this.coldMoon = this.Bodies.circle(-4000, 0, 490, {
      isStatic: true,
      frictionStatic: 5,
      // friction: 1,
      mass: 25, //test
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
      mass: 30,
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
    this.gasPlanet = this.Bodies.circle(2500, 0, 320, {
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

  createBlackHole: function () {
    this.blackHole = this.Bodies.circle(-3800, -3800, 20, {
      isStatic: true,
      mass: 250,
      render: {
        // fillStyle: "#97641C",
        // strokeStyle: "green",
        // lineWidth: 20,
        sprite: {
          texture: "./assets/blackHole.png",
          xScale: 0.3,
          yScale: 0.3,
        },
      },
    });
    this.planets.push(this.blackHole);
    this.World.add(this.engine.world, [this.blackHole], {});
  },

  createWhiteHole: function () {
    this.whiteHole = this.Bodies.circle(3500, 500, 20, {
      isStatic: true,
      mass: 0,
      render: {
        // fillStyle: "#97641C",
        // strokeStyle: "green",
        // lineWidth: 20,
        sprite: {
          texture: "./assets/whiteHole.png",
          xScale: 0.15,
          yScale: 0.15,
        },
      },
    });
    this.planets.push(this.whiteHole);
    this.World.add(this.engine.world, [this.whiteHole], {});
  },

  createSpaceStation: function () {
    var vertices = [
      { x: 0, y: 0 },
      { x: 0, y: 300 },
      { x: 70, y: 300 },
      { x: 70, y: 175 },
      { x: 250, y: 175 },
      { x: 250, y: 125 },
      { x: 70, y: 125 },
      { x: 70, y: 0 },
      { x: 0, y: 0 },
    ];
    this.placeHolderSpaceStation = this.Bodies.rectangle(
      -3000 + 55,
      1500 - 21,
      1,
      1,
      {
        isStatic: true,
        // strokeStyle: "green",
        // lineWidth: 20,
        render: {
          sprite: {
            texture: "./assets/spaceStation.png",
            xScale: 0.23,
            yScale: 0.23,
          },
        },
      }
    );

    this.spaceStation = this.Bodies.fromVertices(-3000, 1500, vertices, {
      isStatic: true,
      mass: 5,
      render: {
        opacity: 0,
      },
    });

    this.planets.push(this.spaceStation);
    // this.planets.push(this.placeHolderSpaceStation);
    this.World.add(
      this.engine.world,
      [this.placeHolderSpaceStation, this.spaceStation],
      {}
    );
  },

  createObservatory: function () {
    // const bodies = [
    //   ...[...document.querySelectorAll("svg > #svgAstroidSmall")].map((path) => {
    //     // ...[...document.querySelectorAll("svg > path")].map((path) => {
    //     const body = Matter.Bodies.fromVertices(
    //       -2800,
    //       1800,
    //       Matter.Svg.pathToVertices(path),
    //       {
    //         isStatic: true,
    //         mass: 5,
    //         render: {
    //           fillStyle: "#97641C",
    //           strokeStyle: "green",
    //           // lineWidth: 20,
    //           // sprite: {
    //           //   texture: "./assets/sun.png",
    //           //   xScale: 1,
    //           //   yScale: 1,
    //           // },
    //         },
    //       },
    //       true
    //     );
    //     Matter.Body.scale(body, 1, 1);
    //     return body;
    //   }),
    // ];
    // this.observatory = bodies[1];
    // this.World.add(this.engine.world, bodies, {});
  },

  createSmallerObjects: function () {
    // this.placeHolderAstroidSmall= this.Bodies.rectangle(-3000 + 55, 1500 - 21, 1, 1, {
    //   isStatic: true,
    //   // strokeStyle: "green",
    //   // lineWidth: 20,
    //   render: {
    //     sprite: {
    //       texture: "./assets/spaceStation.png",
    //       xScale: 0.23,
    //       yScale: 0.23,
    //     },
    //   },
    // });
    // const bodies = [
    //   ...[...document.querySelectorAll("svg > #svgAstroidSmall")].map((path) => {
    //     // ...[...document.querySelectorAll("svg > path")].map((path) => {
    //     const body = Matter.Bodies.fromVertices(
    //       -2800,
    //       1800,
    //       Matter.Svg.pathToVertices(path),
    //       {
    //         isStatic: true,
    //         mass: 5,
    //         render: {
    //           fillStyle: "#97641C",
    //           strokeStyle: "green",
    //           // lineWidth: 20,
    //           // sprite: {
    //           //   texture: "./assets/sun.png",
    //           //   xScale: 1,
    //           //   yScale: 1,
    //           // },
    //         },
    //       },
    //       true
    //     );
    //     Matter.Body.scale(body, 1, 1);
    //     return body;
    //   }),
    // ];
    // this.astroidSmall = bodies[1];
    // this.planets.push(this.AstroidSmall);
    // // this.planets.push(this.placeHolderAstroidSmall);
    // this.World.add(this.engine.world, bodies, {});
  },

  setKeyHandlers: function () {
    //key Events explained:
    //https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event

    const keyHandlers = {
      KeyW: () => {
        this.applyRocketForce(0, Math.PI, this.modifier);
        this.setThrustAnimation();
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
      KeySpace: () => {
        // this.rocketBreak();
      },
      KeyF: () => {
        this.rocketSolar();
      },
      KeyT: () => {
        this.rocketFuel();
      },
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
        this.applyGravityPlanets(this.blackHole);
        this.applyGravityPlanets(this.rustyPlanet);

        // this.warpEvents();
      }.bind(this)
    );
  },

  rocketSolar: function () {
    if (!this.solarTimeStamp || ( this.gameTimer/ this.delta - this.solarTimeStamp > 3 ) ) {
      if (this.solar) {
        this.solar = false;
        this.rocket.render.sprite.texture = './assets/rocketSolar.png';
      } else {
        this.solar = true;   
        this.rocket.render.sprite.texture = './assets/rocketDefault.png';
      }
      this.solarTimeStamp =  this.gameTimer/ this.delta;
    }

  },

  // rocketBreak: function () {
  //   if (!this.breakTimeStamp || ( this.gameTimer/ this.delta - this.breakTimeStamp > 5 ) ) {
  //     if (this.break) {
  //       this.break = false;
  //       this.rocket.render.sprite.texture = './assets/rocketBreak.png';
  //     } else if ( !this.solar) {
  //       this.break = true;   
  //       this.rocket.render.sprite.texture = './assets/rocketDefault.png';
  //     } else {
  //       this.break = true;   
  //       this.rocket.render.sprite.texture = './assets/rocketDefault.png';
  //     }
  //     this.breakTimeStamp =  this.gameTimer/ this.delta;
  //   }

  // },

  rocketFuel: function () {
    if (!this.fuelTimeStamp || ( this.gameTimer/ this.delta - this.fuelTimeStamp > 3 ) ) {
      if (this.fuelMode) {
        this.fuelMode = false;
        this.rocket.render.sprite.texture = './assets/rocketFuel.png';
      } else {
        this.fuelMode = true;   
        this.rocket.render.sprite.texture = './assets/rocketDefault.png';
      }
      this.fuelTimeStamp =  this.gameTimer/ this.delta;
    }

  },

  warpEvents: function () {
    //   let deltaX = this.blackHole.position.x - this.rocket.position.x;
    //   let deltaY = this.blackHole.position.y - this.rocket.position.y;
    //   if ( (Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))) < 150 ) {
    //     // this.rocket.position.x = this.whiteHole.position.x;
    //     // this.rocket.position.y = this.whiteHole.position.y;
    //     this.rocket.velocity.x = 0;
    //     this.rocket.velocity.y = 0;
    //     this.rocket.position.x = 0;
    //     this.rocket.position.y = 0;
    //     // this.rocket.velocity.x = this.rocket.velocity.x/10;
    //       // this.Bounds.shift(this.render.bounds, {
    //       //   x: this.rocket.position.x - window.innerWidth / 2,
    //       //   y: this.rocket.position.y - window.innerHeight / 2,
    //       // });
    //   }
  },

  applyGravityPlanets: function (oPlanet) {
    let deltaX = oPlanet.position.x - this.rocket.position.x;
    let deltaY = oPlanet.position.y - this.rocket.position.y;

    let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

    if (distance < 3000) {
      let force =
        (this.gravityConstant * 2000 * this.rocket.mass * oPlanet.mass) /
        (distance * distance);

      //modified fake Force
      // let force =
      //   (this.gravityConstant * this.rocket.mass * oPlanet.mass) / distance;

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
    }
  },

  setMovements: function () {
    // Forces
    this.Events.on(
      this.runner,
      "afterTick",
      function () {
        this.movePlanet(
          this.spaceStation,
          1800,
          0.01,
          0.8 * Math.PI,
          -3000,
          3000
        );
        this.movePlanet(
          this.placeHolderSpaceStation,
          1800,
          0.01,
          0.8 * Math.PI,
          -3000,
          3000
        );
      }.bind(this)
    );
  },

  movePlanet: function (
    iBody,
    iRadius,
    iFrequency,
    iOffset,
    xPosition,
    yPosition
  ) {
    this.gameTimer++;
    let argument = (this.gameTimer / this.delta) * iFrequency;
    let xPosNew = iRadius * Math.sin(argument + iOffset) + xPosition;
    let yPosNew = iRadius * Math.cos(argument + iOffset) + yPosition;
    Matter.Body.setPosition(iBody, { x: xPosNew, y: yPosNew });
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
    let xOffset = window.innerWidth - 25;
    let yOffset = 25;

    this.ctx.globalAlpha = 0.4;
    this.ctx.fillStyle = "#5E42A9";
    this.ctx.fillRect(xOffset, yOffset, -hudWidth, hudHeight);
    this.ctx.globalAlpha = 1.0;

    var scale = hudWidth / (this.gameSize * 2);

    //draw dot for masses
    this.ctx.fillStyle = "#ffff00";
    for (var i = 1; i < this.planets.length; i++) {
      this.ctx.fillRect(
        xOffset - hudWidth / 2 + this.planets[i].position.x * scale,
        yOffset + this.planets[i].position.y * scale + hudHeight / 2,
        10,
        10
      );
    }
    //draw player's dot
    this.ctx.fillStyle = "#ffff00";
    this.ctx.fillRect(
      xOffset - hudWidth / 2 + this.rocket.position.x * scale,
      yOffset + this.rocket.position.y * scale + hudHeight / 2,
      5,
      5
    );
  },

  setThrustAnimation: function () {
    let thrustWidth = 60;
    let thrustHeight = 15;

    if (this.modifier) {
      thrustHeight = 50;
    }

    //create new random array

    if (
      !this.randomArray ||
      this.randomArray.length == 0 ||
      (this.gameTimer / this.delta) % 1 == 0
    ) {
      this.randomArray = this.getRandomArbitrary(0.7, 1.3);
    }

    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight / 2;

    let startingPointX = centerX - this.rocketWidth / 2 - 5;
    let startingPointY = centerY + this.rocketHeight / 2 + 10;

    //Translate Thrust
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(this.rocket.angle);
    this.ctx.translate(-centerX, -centerY);

    //Create Gradient
    var gradient = this.ctx.createLinearGradient(
      startingPointX - 10 + thrustWidth / 2,
      startingPointY,
      startingPointX - 10 + thrustWidth / 2,
      startingPointY + thrustHeight
    );
    gradient.addColorStop(0, "rgb(237, 58, 39, 0.9)");
    gradient.addColorStop(0.7, "rgb(246, 198, 39, 0.7)");
    gradient.addColorStop(1, "rgb(246, 198, 39, 0)");

    //Draw Thrust
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.moveTo(startingPointX + 10, startingPointY);
    this.ctx.lineTo(
      startingPointX - 5 * this.randomArray[1],
      startingPointY + thrustHeight * this.randomArray[2]
    );
    this.ctx.lineTo(
      startingPointX + thrustWidth + 5 * this.randomArray[3],
      startingPointY + thrustHeight * this.randomArray[4]
    );
    this.ctx.lineTo(
      startingPointX + thrustWidth - 10,
      startingPointY + 5 - 5 * this.randomArray[5]
    );
    this.ctx.lineTo(startingPointX + 10, startingPointY);
    // this.ctx.stroke(); //line
    this.ctx.save();
    this.ctx.fill();
  },

  getRandomArbitrary: function (min, max) {
    var array = [];
    for (var i = 0; i < 10; i++) {
      array.push(Math.random() * (max - min) + min);
    }
    return array;
  },
};

oGame.init();
oGame.setForceHandler();
oGame.setMovements();
