
oInProgress = {

setGamepadHandler: function () {
    //GamePad Examples:
    // https://developer.mozilla.org/en-US/docs/Games/Techniques/Controls_Gamepad_API
    //https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API

    const gamepadAPI = {
      controller: {},
      turbo: false,
      connect(evt) {
        gamepadAPI.controller = evt.gamepad;
        gamepadAPI.turbo = true;
        console.log("Gamepad connected.");
      },
      disconnect(evt) {
        gamepadAPI.turbo = false;
        delete gamepadAPI.controller;
        console.log("Gamepad disconnected.");
      },
      update() {
        // clear the buttons cache
        gamepadAPI.buttonsCache = [];
        // move the buttons status from the previous frame to the cache
        for (var k = 0; k < gamepadAPI.buttonsStatus.length; k++) {
          gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
        }
        // clear the buttons status
        gamepadAPI.buttonsStatus = [];
        // get the gamepad object
        var c = gamepadAPI.controller || {};

        // loop through buttons and push the pressed ones to the array
        var pressed = [];
        if (c.buttons) {
          for (var b = 0, t = c.buttons.length; b < t; b++) {
            if (c.buttons[b].pressed) {
              pressed.push(gamepadAPI.buttons[b]);
            }
          }
        }
        // loop through axes and push their values to the array
        var axes = [];
        if (c.axes) {
          for (var a = 0, x = c.axes.length; a < x; a++) {
            axes.push(c.axes[a].toFixed(2));
          }
        }
        // assign received values
        gamepadAPI.axesStatus = axes;
        gamepadAPI.buttonsStatus = pressed;
        // return buttons for debugging purposes
        return pressed;
      },
      buttonPressed(button, hold) {
        var newPress = false;
        // loop through pressed buttons
        for (var i = 0, s = gamepadAPI.buttonsStatus.length; i < s; i++) {
          // if we found the button we're looking for…
          if (gamepadAPI.buttonsStatus[i] == button) {
            // set the boolean variable to true
            newPress = true;
            // if we want to check the single press
            if (!hold) {
              // loop through the cached states from the previous frame
              for (var j = 0, p = gamepadAPI.buttonsCache.length; j < p; j++) {
                // if the button was already pressed, ignore new press
                if (gamepadAPI.buttonsCache[j] == button) {
                  newPress = false;
                }
              }
            }
          }
        }
        return newPress;
      },
      buttons: [
        "DPad-Up",
        "DPad-Down",
        "DPad-Left",
        "DPad-Right",
        "Start",
        "Back",
        "Axis-Left",
        "Axis-Right",
        "LB",
        "RB",
        "Power",
        "A",
        "B",
        "X",
        "Y",
      ],
      buttonsCache: [],
      buttonsStatus: [],
      axesStatus: [],
    };

    this.gamepadAPI = gamepadAPI;

    // window.addEventListener("gamepadconnected", gamepadAPI.connect);
    // window.addEventListener("gamepaddisconnected", gamepadAPI.disconnect);

    Matter.Events.on(this.engine, "afterUpdate", (event) => {
      var aButtonPressed = this.gamepadAPI.update();
      if (aButtonPressed.length > 0) {
        message.log("buttonRecognized" + aButtonPressed[1]);
        // switch (aButtonPressed[1]) {
        //   case "DPad-Up":
        //     this.applyRocketForce(0, Math.PI, false);
        // }
      }

      // const keyHandlers = {
      //   DPad-Up: () => {

      //   },
      //   RB: () => {
      //       this.applyRocketForce(0, Math.PI, true);
      //   },
      //   KeyS: () => {
      //     this.applyRocketForce(Math.PI, 0, false);
      //   },
      //   KeyD: () => {
      //     this.applyRocketForce(Math.PI / 2, (3 / 2) * Math.PI, false);
      //   },
      //   KeyA: () => {
      //     this.applyRocketForce((3 / 2) * Math.PI, Math.PI / 2, false);
      //   },
      //   KeyQ: () => {
      //     this.Body.rotate(this.rocket, -Math.PI * this.rotationSpeed);
      //   },
      //   KeyE: () => {
      //     this.Body.rotate(this.rocket, Math.PI * this.rotationSpeed);
      //   },
      //   KeySpace: () => {},
      //   KeyF: () => {},
      // };
    }).bind(this);
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

  movementPlanets: function() {
    this.Events.on(
      this.runner,
      "beforeTick",
      function () {
        //Rotation
        // this.Body.rotate(this.homePlanet, (Math.PI * this.delta ) / 10000);
      }.bind(this)
    );

  },

  obitPlanet: function (oPlanet,iX ,iY ,iR ,sOrbitSpeed ,OrbitOffset ) {
    // oPlanet.position.x  = iX + iR;
    // oPlanent.position.y = iY;
    // let xVelocity = Math.cos( sOrbitSpeed * Math.PI * 2 ) * sOrbitSpeed;
    // let yVelocity = Math.sin( sOrbitSpeed * Math.PI * 2 ) * sOrbitSpeed;
    // Body.setVelocity( oPlanet, {x: xVelocity, y: yVelocity});
  },


}