/**
 * 
 *  Open index.html
 *  ASDW controls small box
 *  zoom with +/- 
 *  view resizes with window size
 *  
 */

 $(document).ready(function () {
    // Matterjs objects
    this.World  = Matter.World;
    this.Body   = Matter.Body;
    this.Bodies = Matter.Bodies;
    this.Engine = Matter.Engine;
    this.Events = Matter.Events;
    this.Render = Matter.Render;
    this.Query  = Matter.Query;
    this.Bounds = Matter.Bounds;
    this.Vector = Matter.Vector;
    this.Mouse  = Matter.Mouse;
    this.MouseConstraint = Matter.MouseConstraint;

    // dynamic based on window size
    //this.client_width   = 800; 
    //this.client_height  = 600;
    
    this.world_bound_X  = 3000;
    this.world_bound_Y  = 3000;
    this.zoom           = 1;
    this.bounds_scale_target = {};

    // create an engine
    this.engine = this.Engine.create();
    this.world = this.engine.world;

    var canvas_id = 'canvas';
    this.canvas_element = document.getElementById(canvas_id);    
    // create a renderer
    this.render = this.Render.create({
        canvas: this.canvas_element,
        engine: this.engine,
        options: { 
                    width: window.innerWidth, 
                    height: window.innerHeight,
                    wireframes: false,
                    showVelocity: true,
                    showCollisions: true,
                    hasBounds: true
                }
    });

    // create two boxes and a ground
    var bodies = [];
    bodies.push(this.Bodies.rectangle(this.world_bound_X/2, this.world_bound_Y-300, 80, 80));
    bodies.push(this.Bodies.rectangle(this.world_bound_X/2, this.world_bound_Y-400, 80, 80));
    bodies.push(this.Bodies.rectangle(this.world_bound_X/2, this.world_bound_Y-100, 2000, 60, { isStatic: true }));
    var player = this.Bodies.rectangle(this.world_bound_X/2,this.world_bound_Y-600,50,50, { airFriction: 0.001 });
    bodies.push(player);


    // add all of the bodies to the world
    this.World.add(this.engine.world, bodies);

    // run the engine
    this.Engine.run(this.engine);

    // run the renderer
    this.Render.run(this.render);

    // make the world bounds a little bigger than the render bounds
    this.world_padding = 300;
    this.engine.world.bounds.min.x = 0 - this.world_padding;
    this.engine.world.bounds.min.y = 0 - this.world_padding;
    this.engine.world.bounds.max.x = this.world_bound_X + this.world_padding;
    this.engine.world.bounds.max.y = this.world_bound_Y;

    this.bounds_scale_target = 1;
    this.bounds_scale = { x: 1, y: 1 };

    this.Events.on(this.engine, 'beforeTick', function() {
        
        // apply zoom
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext("2d");
        ctx.translate(window.innerWidth/2, window.innerHeight/2);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-window.innerWidth/2, -window.innerHeight/2);  

        // center view at player 
        this.Bounds.shift(this.render.bounds,
        {
            x: player.position.x - window.innerWidth / 2,
            y: player.position.y - window.innerHeight / 2
        });

    }.bind(this));

    window.onresize = function() {
        this.render.canvas.width = window.innerWidth;
        this.render.canvas.height = window.innerHeight;

    }.bind(this);

    $(document).keydown(function( event ) {
        // move the small box
        console.log(event.key);
        if (event.key == 'a') {
            this.Body.setVelocity(player, {x:-10,y:player.velocity.y});
        }
        if (event.key == 'd') {
            this.Body.setVelocity(player, {x:10, y:player.velocity.y});
        }
        if (event.key == 'w') {
            this.Body.setVelocity(player, {x:player.velocity.x, y:-10});
        }
        if (event.key == 's') {
            this.Body.setVelocity(player, {x:player.velocity.x, y:10});
        }
        if (event.key == '-') {
            this.zoom *= 0.9;
        }
        if (event.key == '+') {
            this.zoom *= 1.1;
        }

    });

});

