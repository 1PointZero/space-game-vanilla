import "./style.css";
import javascriptLogo from "./javascript.svg";
import { setupCounter } from "./counter.js";
import Matter from "https://cdn.skypack.dev/matter-js";
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
    // this.createInitLevel();
    this.createMainObjects();
    this.createWorldInit();
    this.createPlayer();
    this.setScreenSettings();
    // this.runGame();
    this.setKeyHandlers();
    // this.setCameraSettings();
    // this.drawStars();

    this.setHudMain();
    this.setHudControls();

    // this.ctx.save();
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
    //Body(Player) Data
    this.speed = 0.0001;
    this.delta = 1000 / 50;
    this.fuel = 800;
    this.fuelInit = 1000;
    this.rocket;

    this.world_bound_X = 3000;
    this.world_bound_Y = 3000;
    this.zoom = 1;
    this.bounds_scale_target = {};

    // this.world.gravity = 1;
    // make the world bounds a little bigger than the render bounds
    // this.world_padding = 300;
    // this.engine.world.bounds.min.x = 0 - this.world_padding;
    // this.engine.world.bounds.min.y = 0 - this.world_padding;
    // this.engine.world.bounds.max.x = this.world_bound_X + this.world_padding;
    // this.engine.world.bounds.max.y = this.world_bound_Y;
  },

  initCanvas: function () {
    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d");

    var base_image = new Image();
    base_image.src = "./assets/controlsTemplate.png";
    base_image.onload = function () {
      this.base_image = base_image;
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
      }.bind(this)
    );
  },
  get createMainObjects() {
    return this._createMainObjects;
  },
  set createMainObjects(value) {
    this._createMainObjects = value;
  },

  createPlayer() {
    // var player = this.Bodies.rectangle(this.world_bound_X/2,this.world_bound_Y-600,50,50, { airFriction: 0.001 });
    // this.World.add(this.engine.world, [player]);
  },

  setScreenSettings: function () {
    //https://stackoverflow.com/questions/34913835/how-can-i-move-camera-in-matter-js
    //Examples for Camera Movement and Zoom

    // var canvas = document.getElementById("canvas");
    // this.ctx = canvas.getContext("2d");

    window.onresize = function () {
      this.render.canvas.width = window.innerWidth;
      this.render.canvas.height = window.innerHeight;
      this.setGameWorldColors();
      // this.starsMoveRandom();
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

  runGame: function () {},

  createWorldInit: function () {
    //create World

    this.createHomePlanet();

    let bodies = [];

    this.rocket = this.Bodies.rectangle(0, 0, 50, 120, {
      inertia: Infinity,
      friction: 0.1,
      frictionStatic: 0,
      frictionAir: 0,
      restitution: 0.2, //bounce 1 = 100% elastic
      render: {
        fillStyle: "#f55a3c",
        // fillStyle: 'transparent',
        lineWidth: 3,
      },
    });
    this.rocket.render.fillStyle = "grey";
    bodies.push(this.rocket);

    // this.boxB = this.Bodies.rectangle(600, 560, 80, 80, {
    //   isStatic: true,
    // });

    // bodies.push(this.boxB);

    // this.ground = this.Bodies.rectangle(435, 630, 810, 60, {
    //   isStatic: true,
    // });
    // bodies.push(this.ground);

    // this.leftWall = this.Bodies.rectangle(0, 200, 60, 800, {
    //   isStatic: true,
    // });
    // bodies.push(this.leftWall);

    this.World.add(this.engine.world, bodies, {
      // friction: 0,
      // frictionStatic: 0,
      // frictionAir: 0,
      // restitution: 0,
      // isStatic: true,
    });
  },

  createHomePlanet: function () {
    let bodies = [];

    this.homePlanet = this.Bodies.circle(0, 1200, 1105, {
      isStatic: true,
      render: {
        // fillStyle: "#97641C",
        // strokeStyle: "green",
        // lineWidth: 20,
        sprite: {
          texture: "./assets/homePlanet.png",
        },
      },
    });
    bodies.push(this.homePlanet);

    this.World.add(this.engine.world, bodies, {});

    //Add Image
    //Image
    // var img = new Image();
    // img.onload = function() {
    //     handleLoadedTexture(img);
    // };
    // img.src = "image.png";
    // function handleLoadedTexture(img) {
    //call loop etc that uses image
    // };
  },

  setKeyHandlers: function () {
    //key Events explained:
    //https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event

    const keyHandlers = {
      KeyW: () => {
        if (this.modifier) {
          this.Body.applyForce(
            this.rocket,
            {
              x: this.rocket.position.x,
              y: this.rocket.position.y,
            },
            { x: 0, y: -3 * this.speed }
          );
          this.fuel = this.fuel - 10 / this.delta;
        } else {
          this.Body.applyForce(
            this.rocket,
            {
              x: this.rocket.position.x,
              y: this.rocket.position.y,
            },
            { x: 0, y: -1 * this.speed }
          );
          this.fuel = this.fuel - 3 / this.delta;
        }
      },
      KeyS: () => {
        this.Body.applyForce(
          this.rocket,
          {
            x: this.rocket.position.x,
            y: this.rocket.position.y,
          },
          { x: 0, y: 1 * this.speed }
        );
        this.fuel = this.fuel - 3 / this.delta;
      },
      KeyD: () => {
        this.Body.applyForce(
          this.rocket,
          {
            x: this.rocket.position.x,
            y: this.rocket.position.y,
          },
          { x: 1 * this.speed, y: 0 }
        );
        this.fuel = this.fuel - 3 / this.delta;
      },
      KeyA: () => {
        this.Body.applyForce(
          this.rocket,
          {
            x: this.rocket.position.x,
            y: this.rocket.position.y,
          },
          { x: -1 * this.speed, y: 0 }
        );
      },
      KeyQ: () => {
        this.Body.rotate(this.rocket, Math.PI * this.speed * 40);
        this.fuel = this.fuel - 3 / this.delta;
      },
      KeyE: () => {
        this.Body.rotate(this.rocket, -Math.PI * this.speed * 40);
        this.fuel = this.fuel - 3 / this.delta;
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

  applyRocketForce: function (iX, iY, bBoostModifier) {
    if (bBoostModifier) {
      var fuelMultiplier = 3;
      var fuelMultiplierBoost = 10;

      this.Body.applyForce(
        this.rocket,
        {
          x: this.rocket.position.x,
          y: this.rocket.position.y,
        },
        {
          x: this.speed * Math.cos(this.rocket.angle + Math.PI * 0.5),
          y: this.speed * Math.cos(this.rocket.angle + Math.PI * 0.5),
        }
      );
      this.fuel = this.fuel - fuelMultiplierBoost / this.delta;
    } else {
      this.Body.applyForce(
        this.rocket,
        {
          x: this.rocket.position.x,
          y: this.rocket.position.y,
        },
        { x: 0, y: -1 * this.speed }
      );
      this.fuel = this.fuel - fuelMultiplier / this.delta;
    }
  },

  drawStars: function () {
    // var star = [];
    // this.star = star;
    // this.totalStars = 100;
    // for (var i = 0; i < this.totalStars; i++) {
    //   star.push({
    //     x: Math.random() * window.innerWidth,
    //     y: Math.random() * window.innerHeight,
    //   });
    // }
    // this.ctx.fillStyle = "#ffffff"; //'darkgrey'; //'rgba(255, 255, 255, 0.5)'
    // // var parallax = 1;
    // var Vx = this.rocket.velocity.x;
    // var Vy = this.rocket.velocity.y;
    // var width = window.innerWidth;
    // var height = window.innerHeight;
    // for (var i = 0; i < this.totalStars; i++) {
    //   star[i].x -= Vx;
    //   star[i].y -= Vy;
    //   this.ctx.fillRect(star[i].x, star[i].y, 2, 2);
    //   if (star[i].x < 0) {
    //     star[i].x = width;
    //     star[i].y = Math.random() * height;
    //   }
    //   if (star[i].x > width) {
    //     star[i].x = 0;
    //     star[i].y = Math.random() * height;
    //   }
    //   if (star[i].y < 0) {
    //     star[i].y = height;
    //     star[i].x = Math.random() * width;
    //   }
    //   if (star[i].y > height) {
    //     star[i].y = 0;
    //     star[i].x = Math.random() * width;
    //   }
    // }
  },

  starsMoveRandom: function () {
    for (var i = 0; i < this.totalStars; i++) {
      this.star[i].x = Math.random() * window.innerWidth;
      this.star[i].y = Math.random() * window.innerHeight;
    }
  },

  setForceHandler: function () {
    // Forces
    this.Events.on(
      this.runner,
      "beforeTick",
      function () {
        //Rotation
        this.Body.rotate(this.homePlanet, (Math.PI * this.delta * 1) / 100000);
      }.bind(this)
    );
  },

  setGameWorldColors: function () {
    // this.drawStars();
    //Hud
  },

  setHudMain: function () {
    let hudWidth = 400;
    let hudHeight = 40;
    // // this.ctx.clearRect();
    this.ctx.globalAlpha = 0.5;
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
    this.ctx.fillStyle = "#5E42A9";
    this.ctx.fillRect(
      window.innerWidth / 2 - hudWidth / 2,
      window.innerHeight - hudHeight,
      (hudWidth * this.fuel) / this.fuelInit,
      -hudHeight
    );
  },

  setHudControls: function () {
    // let hudWidth = 200;
    // let hudHeight = 200;
    if (this.base_image) {
      this.ctx.drawImage(
        this.base_image,
        window.innerWidth,
        window.innerHeight,
        -300,
        (-300 * 1208) / 725
      );
    }

    // this.ctx.fillStyle = "#5E42A9";
    // this.ctx.fillRect(window.innerWidth, window.innerHeight, -200, -200);
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
