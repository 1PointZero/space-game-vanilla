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

var classGame = {
  init: function () {
    this.initMatterJsObjects();
    // this.createInitLevel();
    this.createMainObjects();
    this.initGameSettings();
    this.createWorldInit();
    this.createPlayer();
    this.setScreenSettings();
    // this.runGame();
    this.setKeyHandlers();
    // this.setCameraSettings();

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

  createMainObjects: function () {
    this.engine = this.Engine.create();

    this.render = this.Render.create({
      canvas: document.getElementById("canvas"),
      engine: this.engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: true,
        background: "#638dbd",
        wireframeBackground: "#394763",
        hasBounds: true
        // showCollisions: true,
        // showVelocity: true,
      },
    });

    this.Render.run(this.render); //this.render ?
    this.runner = this.Runner.create({
      delta: 1000/50,
      isFixed: true
    });
    this.Runner.run(this.runner, this.engine);

    //own Game loop, use Engine.update(engine, delta)
    //https://brm.io/matter-js/docs/classes/Runner.html
  },


  createPlayer() {
    // var player = this.Bodies.rectangle(this.world_bound_X/2,this.world_bound_Y-600,50,50, { airFriction: 0.001 });
    // this.World.add(this.engine.world, [player]);

  },

  setScreenSettings: function () {
    var canvas = document.createElement('canvas');
    this.ctx = canvas.getContext('2d');

    window.onresize = function () {
      this.render.canvas.width = window.innerWidth;
      this.render.canvas.height = window.innerHeight;
    }.bind(this);


    this.Events.on(this.runner, 'beforeUpdate', function() {
        
      // apply zoom
        // var canvas = document.getElementById('canvas');
        // var ctx = canvas.getContext("2d");
        // ctx.translate(window.innerWidth/2, window.innerHeight/2);
        // ctx.scale(this.zoom, this.zoom);
        // ctx.translate(-window.innerWidth/2, -window.innerHeight/2);  

      // center view at player 
      this.Bounds.shift(this.render.bounds,
      {
          x: this.boxA.position.x - window.innerWidth / 2,
          y: this.boxA.position.y - window.innerHeight / 2
      });

  }.bind(this));







    //https://stackoverflow.com/questions/34913835/how-can-i-move-camera-in-matter-js
// hero = bubbleBall

// // Follow Hero at X-axis

// engine.render.bounds.max.x = centerX + hero.bounds.min.x + initialEngineBoundsMaxX

// // Follow Hero at Y-axis
// engine.render.bounds.min.y = centerY + hero.bounds.min.y
// engine.render.bounds.max.y = centerY + hero.bounds.min.y + initialEngineBoundsMaxY

// // Update Mouse
// Mouse.setOffset(mouseConstraint.mouse, engine.render.bounds.min);

// Render.lookAt(render, player, {
//   x: 1080,
//   y: 1920
// });

   //Working Example Translation
    // let translate = {x : -100, y : -100}
    // this.Bounds.translate(this.render.bounds, translate)



  },


  initGameSettings: function () {
    //Body(Player) Data
    this.speed = 0.002;

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

  runGame: function () {

  },

  createWorldInit: function () {
    //create World

    var bodies = [];

    this.boxA = this.Bodies.rectangle(400, 200, 80, 80, {
      inertia: Infinity,
      friction: 0.1,
    });
    bodies.push(this.boxA);

    this.boxB = this.Bodies.rectangle(600, 560, 80, 80, {
      isStatic: true,
    });
    bodies.push(this.boxB);

    this.ground = this.Bodies.rectangle(435, 630, 810, 60, {
      isStatic: true,
    });
    bodies.push(this.ground);

    this.leftWall = this.Bodies.rectangle(0, 200, 60, 800, {
      isStatic: true,
    });
    bodies.push(this.leftWall);

    // this.Composite.add(
    //   this.engine.world, bodies
    // );

    this.World.add(this.engine.world, bodies);
  },

  setKeyHandlers: function () {
    const keyHandlers = {
      KeyW: () => {
        this.Body.applyForce(
          this.boxA,
          {
            x: this.boxA.position.x,
            y: this.boxA.position.y,
          },
          { x: 0, y: -4 * this.speed }
        );
      },
      KeyS: () => {
        this.Body.applyForce(
          this.boxA,
          {
            x: this.boxA.position.x,
            y: this.boxA.position.y,
          },
          { x: 0, y: 2 * this.speed }
        );
      },
      KeyD: () => {
        this.Body.applyForce(
          this.boxA,
          {
            x: this.boxA.position.x,
            y: this.boxA.position.y,
          },
          { x: 1 * this.speed, y: 0 }
        );
      },
      KeyA: () => {
        this.Body.applyForce(
          this.boxA,
          {
            x: this.boxA.position.x,
            y: this.boxA.position.y,
          },
          { x: -1 * this.speed, y: 0 }
        );
      },
    };

    const keysDown = new Set();
    document.addEventListener("keydown", (event) => {
      keysDown.add(event.code);
    });
    document.addEventListener("keyup", (event) => {
      keysDown.delete(event.code);
    });

    Matter.Events.on(this.engine, "beforeUpdate", (event) => {
      [...keysDown].forEach((k) => {
        keyHandlers[k]?.();
      });
    });
  },
};

classGame.init();

// (function cycle() { //render loop
//   ctx.save(); //move camera
//   ctx.translate(window.innerWidth * 0.5, window.innerHeight * 0.5);
//   ctx.translate(this.boxA.position.x, this.boxA.position.y);
//   window.requestAnimationFrame(cycle);
// }.bind(this));
