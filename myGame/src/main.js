import kaplay from "kaplay";
import "kaplay/global";

const FLOOR_HEIGHT = 600;
const JUMP_FORCE = 1000;
const SPEED = 480;
const GRAVITY = 1500;
const LENGTH = 4500;
const MIN_DIST_OBSTACLE = 400;
// Speeds
const backgroundSpeed = 50;
const cloudSpeed = 40;
const platformSpeed = 320;
// Assets positioning
// Background
const bgPieceWidth = 765;
const yPositionBackground = -18;
// clouds
const cloudWidth = 500;
const yPositionCloud = 150;
const yPositionCloud2 = 100;
// Platform
const platformWidth = 1172;
const yPositionPlatform = 435;
const platformScale = 1.2;
// Collider - platform
const colliderH = 30;
const yPositionCollider = 810;
// Stitch
const stitchStartX = 200;
const stitchStartY = 300;

const Obstacles = ["alien", "box", "fire", "mine", "tree", "warning"];

// initialize context
kaplay({ 
    background: [0, 0, 0],
    debug: true  // Enable debug mode to see collision boxes
});

// load assets
loadSprite("bean", "sprites/bean.png");
loadSprite("floor", "sprites/floor.png");
loadSprite("background", "sprites/background.png");
loadSprite("sky", "sprites/sky.jpeg");
loadSprite("cloud", "sprites/cloud1.png");
// Obstacles
loadSprite("alien", "sprites/alien.png");
loadSprite("box", "sprites/box.png");
loadSprite("fire", "sprites/fire.png");
loadSprite("mine", "sprites/mine.png");
loadSprite("tree", "sprites/tree.png");
loadSprite("warning", "sprites/warning.png");
// Stitch
loadSprite("stitch", "sprites/stitch.png", {
    sliceX: 6,
    sliceY: 5,
    anims: {
        idle: { from: 0, to: 3, speed: 6, loop: true },
        run: { from: 6, to: 11, speed: 8, loop: true },
        jump: { from: 12, to: 14, speed: 6, loop: true },
        happy: { from: 18, to: 20, speed: 6, loop: true },
        fall: { from: 24, to: 25, speed: 6, loop: true }
    }
});

scene("game", () => {

    // define gravity
    setGravity(GRAVITY);

    // Current game speed id zero
    let gameSpeed = 100;
    loop(1, () => {
        gameSpeed += 0;
    });

    // Track distance traveled
    let distanceTraveled = 0;
    let nextObstacleDistance = 0; 
    let gameComplete = false; 

    // Sky
    add([sprite("sky"), pos(0, -550), opacity(0.5), scale(1.6)]);

    // Background
    const bgPieces = [
        add([sprite("background"), pos(0, yPositionBackground), opacity(1), scale(2.5)]),
        add([sprite("background"), pos(bgPieceWidth, yPositionBackground), opacity(0.8), scale(2.5)])
    ];

    // Clouds
    const clouds = [
        add([sprite("cloud"), pos(40, yPositionCloud), scale(2)]),
        add([sprite("cloud"), pos(1000, yPositionCloud2), scale(2)]),
        add([sprite("cloud"), pos(1800, yPositionCloud2), scale(2)]),
        add([sprite("cloud"), pos(1500, yPositionCloud2 + 100), scale(1.5)]),
        add([sprite("cloud"), pos(cloudWidth, yPositionCloud2), scale(0.6)])
    ];

    // Platforms
    const platforms = [
        add([sprite("floor"), pos(0, yPositionPlatform), scale(platformScale)]),
        add([sprite("floor"), pos(2560, yPositionPlatform), scale(platformScale)]),
    ];
    const platformColliders = [
        add([rect(platformWidth, colliderH), pos(0, yPositionCollider), area(), body({ isStatic: true }), opacity(0)]),
        add([rect(platformWidth, colliderH), pos(platformWidth, yPositionCollider), area(), body({ isStatic: true }), opacity(0)])
    ];

    // Stitch
    const stitch = add([
        sprite("stitch"), 
        pos(stitchStartX, stitchStartY), 
        anchor("bot"), // Anchor at bottom so feet touch the ground
        area({
        shape: new Rect(vec2(10, 0), 60, 200)
        }),
        body(), 
        scale(1), 
        z(5)
    ]);
    stitch.play("run");

    // Spawn obstacles based on distance
    function spawnObstacle() {
        // win condition
        if (distanceTraveled >= LENGTH && !gameComplete) {
            gameComplete = true;
            stitch.play("happy");
            wait(2, () => go("win", Math.floor(distanceTraveled)));
            return;
        }

        const obstacle = add([
            sprite(choose(Obstacles)),
            pos(width(), 790),
            anchor("bot"),
            area(),
            body({ isStatic: true }),
            move(LEFT, platformSpeed),
            "obstacle",
            z(4)
        ]);

        // Remove obstacle when it goes off screen
        obstacle.onUpdate(() => {
            if (obstacle.pos.x < -100) {
                destroy(obstacle);
            }
        });
    }

    // Collision detection
    stitch.onCollide("obstacle", () => {
        go("lose", 0);
    });
    

    // Jump function
    function jump() {
        if (stitch.isGrounded()) {
            stitch.jump(JUMP_FORCE);
            stitch.play("jump");
        }
    }

    // Jump when user presses space or clicks
    onKeyPress("space", jump);
    onMousePress(jump);

    // UI logic
    onUpdate(() => {
        // Stop everything if game is complete
        if (gameComplete) {
            return;
        }

        // Track distance traveled
        distanceTraveled += platformSpeed * dt();

        // Check if LENGTH completed
        if (distanceTraveled >= LENGTH && !gameComplete) {
            gameComplete = true;
            stitch.play("happy");
            wait(2, () => go("win", Math.floor(distanceTraveled)));
            return;
        }

        // Spawn obstacle when reaching next spawn distance
        if (distanceTraveled >= nextObstacleDistance && distanceTraveled < LENGTH - 800) {
            spawnObstacle();
            // Set next obstacle distance with minimum 300px gap + random extra
            nextObstacleDistance = distanceTraveled + MIN_DIST_OBSTACLE + rand(100, 300);
        }

        // Stitch at fixed x
        stitch.pos.x = stitchStartX;

        // Change animation based on state
        if (stitch.isGrounded()) {
            if (stitch.curAnim() !== "run") {
                stitch.play("run");
            }
        } else if (stitch.vel.y > 0) {
            // Falling
            if (stitch.curAnim() !== "fall") {
                stitch.play("fall");
            }
        }

        // Background
        if (bgPieces[1].pos.x < 0) {
            bgPieces[0].moveTo(bgPieces[1].pos.x + bgPieceWidth * 2, yPositionBackground);
            const frontBgPiece = bgPieces.shift();
            // so typescript shuts up
            if (frontBgPiece) bgPieces.push(frontBgPiece);
        }

        bgPieces[0].move(-backgroundSpeed, 0);
        bgPieces[1].moveTo(bgPieces[0].pos.x + bgPieceWidth * 2, yPositionBackground);

        // Move all clouds
        for (const cloud of clouds) {
            cloud.move(-cloudSpeed, 0);
        }

        // Wrap around when the first cloud goes off screen
        if (clouds[0].pos.x < -cloudWidth) {
            const frontCloud = clouds.shift();
            if (frontCloud) {
                // Position at the end with random Y and scale
                const lastCloud = clouds[clouds.length - 1];
                frontCloud.moveTo(lastCloud.pos.x + rand(400, 600), rand(-100, 250));
                frontCloud.scaleTo(rand(0.5, 2));
                clouds.push(frontCloud);
            }
        }

        // Platform
        if (platforms[1].pos.x < 0) {
            platforms[0].moveTo(
            platforms[1].pos.x + platformWidth,
            platforms[1].pos.y
        );
            const frontPlatform = platforms.shift();
            if (frontPlatform) platforms.push(frontPlatform);
        }

        platforms[0].move(-platformSpeed, 0);
        platforms[1].moveTo(platforms[0].pos.x + platformWidth, platforms[0].pos.y);
    });

    // add a game object to screen
    // const player = add([
    //     // list of components
    //     sprite("bean"),
    //     pos(80, 40),
    //     area(),
    //     body(),
    // ]);

    // floor
    // const TILE = 1536;

    // for (let x = 0; x < width(); x += TILE) {
    //     add([
    //         sprite("floorTile"),
    //         pos(x, height() - FLOOR_HEIGHT),
    //         area(),
    //         body({ isStatic: true }),
    //     ]);
    // }

    // function jump() {
    //     if (player.isGrounded()) {
    //         player.jump(JUMP_FORCE);
    //     }
    // }

    // // jump when user press space
    // onKeyPress("space", jump);
    // onMousePress(jump);

    // function spawnTree() {
    //     // add tree obj
    //     add([
    //         rect(48, rand(32, 96)),
    //         area(),
    //         body({ isStatic: true }),
    //         outline(4),
    //         pos(width(), height() - FLOOR_HEIGHT),
    //         anchor("botleft"),
    //         color(255, 180, 255),
    //         move(LEFT, SPEED),
    //         "tree",
    //     ]);
    //     // wait a random amount of time to spawn next tree
    //     wait(rand(0.5, 1.5), spawnTree);
    // }

    // // start spawning trees
    // spawnTree();

    // // lose if player collides with any game obj with tag "tree"
    // player.onCollide("tree", () => {
    //     // go to "lose" scene and pass the score
    //     go("lose", score);
    //     burp();
    //     addKaboom(player.pos);
    // });

    // // keep track of score
    // let score = 0;

    // const scoreLabel = add([text(score), pos(24, 24)]);

    // // increment score every frame
    // onUpdate(() => {
    //     score++;
    //     scoreLabel.text = score;
    // });
});

scene("win", (distance) => {
    add([text("You Win!"), pos(center()), anchor("center"), color(0, 255, 0)]);

    // display distance
    add([
        text(`Distance: ${distance}px`),
        pos(width() / 2, height() / 2 + 80),
        scale(2),
        anchor("center"),
    ]);

    // go back to game when space is pressed
    onKeyPress("space", () => go("game"));
    onMousePress(() => go("game"));
});

scene("lose", (score) => {
    add([text("Game Over"), pos(center()), anchor("center")]);

    // display score
    add([
        text(score),
        pos(width() / 2, height() / 2 + 80),
        scale(2),
        anchor("center"),
    ]);

    // go back to game when space is pressed
    onKeyPress("space", () => go("game"));
    onMousePress(() => go("game"));
});

go("game");