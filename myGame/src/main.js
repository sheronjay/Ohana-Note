import kaplay from "kaplay";
import "kaplay/global";
import { loadMessage } from "./message.js";
import { createMessageOverlay, removeMessageOverlay } from "./messageOverlay.js";

// Message will be loaded after kaplay initializes
let message = "Loading message...";

const FLOOR_HEIGHT = 600;
const JUMP_FORCE = 930;
const SPEED = 480;
const GRAVITY = 1500;
const LENGTH = 5500;
const GAME_WIDTH = 1536;
const GAME_HEIGHT = 900;
const MIN_DIST_OBSTACLE = 400;
let STITCH_AT_CENTER = 0;
let LENGTH_COMPLETED = false;
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
const platformWidth = 2000;
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
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    letterbox: true,
    stretch: false,
    debug: true  // Enable debug mode to see collision boxes
});

// Load message after kaplay initializes
onLoad(() => {
    console.log("Kaplay loaded, now loading message...");
    loadMessage().then(msg => {
        message = msg;
        console.log("Message loaded successfully:", message);
    }).catch(err => {
        console.error("Failed to load message:", err);
        message = "Message not found. Please check your link.";
    });
});

// load assets
loadSprite("bean", "sprites/bean.png");
loadSprite("floor", "sprites/floor.png");
loadSprite("background", "sprites/background.png");
loadSprite("sky", "sprites/sky.jpeg");
loadSprite("cloud", "sprites/cloud1.png");
loadSprite("popup", "sprites/popup.png");
loadSprite("letter", "sprites/letter.png");
loadSprite("startButton", "sprites/startButton.png");
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
        idle: { from: 0, to: 3, speed: 3, loop: true },
        run: { from: 6, to: 11, speed: 8, loop: true },
        jump: { from: 12, to: 14, speed: 6, loop: true },
        happy: { from: 18, to: 20, speed: 6, loop: true },
        fall: { from: 24, to: 25, speed: 6, loop: true },
        still: { from: 0, to: 0, speed: 6, loop: true },
        lose: { from: 24, to: 24, speed: 6, loop: true },
    }
});
// Lilo
loadSprite("lilo", "sprites/lilo.png", {
    sliceX: 5,
    sliceY: 4,
    anims: {
        idle: { from: 12, to: 12, speed: 6, loop: true },
        run: { from: 0, to: 11, speed: 8, loop: true },
        happy: { from: 13, to: 18, speed: 6, loop: true },
    }
});

scene("start", () => {
    // Sky
    add([sprite("sky"), pos(0, -550), opacity(0.5), scale(1.6)]);

    // Background
    add([sprite("background"), pos(0, yPositionBackground), opacity(1), scale(2.5)]);

    // Clouds
    add([sprite("cloud"), pos(40, yPositionCloud), scale(2)]);
    add([sprite("cloud"), pos(1000, yPositionCloud2), scale(2)]);

    // Platform
    add([sprite("floor"), pos(0, yPositionPlatform), scale(platformScale)]);

    // Start button
    const startButton = add([
        sprite("startButton"),
        pos(center()),
        anchor("center"),
        area(),
        scale(0.5),
        z(0.5)
    ]);

    // Make button clickable
    startButton.onClick(() => {
        // Load message when starting the game
        console.log("Start button clicked, loading message...");
        loadMessage().then(msg => {
            message = msg;
            console.log("Message loaded on button click:", message);
        }).catch(err => {
            console.error("Failed to load message on button click:", err);
            message = "Message not found. Please check your link.";
        });
        
        go("game");
    });

    // Heartbeat effect
    startButton.onUpdate(() => {
        const scaleBase = 0.5;
        const scaleVar = 0.003;
        const scaleVal = scaleBase + Math.sin(time() * 3) * scaleVar;
        startButton.scale = vec2(scaleVal);
    });
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
        z(5),
        { runningToMiddle: false, atCenter: false }
    ]);
    stitch.play("run");

    // Lilo - starts off screen
    const lilo = add([
        sprite("lilo"),
        pos(width() + 100, 800), // Start off screen to the right
        anchor("bot"),
        area({
            shape: new Rect(vec2(10, 0), 60, 200)
        }),
        scale(1),
        z(5),
        { runningToMiddle: false, atCenter: false },
    ]);

    // Spawn obstacles based on distance
    function spawnObstacle() {
        const initialScale = 1.3; // Set your desired base scale here
        const obstacle = add([
            sprite(choose(Obstacles)),
            pos(width(), 790),
            anchor("bot"),
            area(),
            body({ isStatic: true }),
            move(LEFT, platformSpeed),
            "obstacle",
            z(4),
            scale(initialScale)
        ]);

        // Heartbeat effect for obstacles
        obstacle.onUpdate(() => {
            // Remove obstacle when it goes off screen
            if (obstacle.pos.x < -100) {
                destroy(obstacle);
            } else {
                // Heartbeat scaling effect - uses the initial scale as base
                const scaleBase = initialScale;
                const scaleVar = 0.1;
                const scaleVal = scaleBase + Math.sin(time() * 3) * scaleVar;
                obstacle.scale = vec2(scaleVal);
            }
        });
    }

    // Collision detection
    stitch.onCollide("obstacle", () => {
        go("lose", Math.floor(distanceTraveled));
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

    // Score label
    const scoreLabel = add([
        text("Score: 0m"),
        pos(width() - 20, 20),
        anchor("topright"),
        scale(1),
        z(100)
    ]);

    // UI logic
    onUpdate(() => {
        // Track distance traveled (only if game is still running)
        if (!(stitch.atCenter && lilo.atCenter)) {
            distanceTraveled += platformSpeed * dt();
        }

        // Update score label
        scoreLabel.text = `Score: ${Math.floor(distanceTraveled)}m`;

        // Check if LENGTH completed
        if (distanceTraveled >= LENGTH) {
            if (!LENGTH_COMPLETED) {
                LENGTH_COMPLETED = true;
                lilo.runningToMiddle = true;
                stitch.runningToMiddle = true;
                lilo.play("run");
            }
        }

        if (stitch.atCenter && lilo.atCenter && get("endPopup").length === 0) {
            const popup = add([sprite("popup"), pos(550, 250), area(), scale(0.5), "endPopup"]);

            // Heartbeat effect
            popup.onUpdate(() => {
                const scaleBase = 0.5;
                const scaleVar = 0.003;
                const scaleVal = scaleBase + Math.sin(time() * 3) * scaleVar;
                popup.scale = vec2(scaleVal);
            });

            popup.onClick(() => {

                const letterGlow1 = add([
                    sprite("letter"),
                    pos(center()),
                    anchor("center"),
                    scale(0.95),
                    opacity(0.2),
                    z(199)
                ]);

                const letterGlow2 = add([
                    sprite("letter"),
                    pos(center()),
                    anchor("center"),
                    scale(1.0),
                    opacity(0.12),
                    z(198)
                ]);

                const letterGlow3 = add([
                    sprite("letter"),
                    pos(center()),
                    anchor("center"),
                    scale(1.05),
                    opacity(0.08),
                    z(197)
                ]);

                const letter = add([
                    sprite("letter"),
                    pos(center()),
                    anchor("center"),
                    scale(0.9),
                    area(),
                    z(200)
                ]);

                // Create close handler that destroys all letter elements
                const closeHandler = () => {
                    destroy(letterGlow1);
                    destroy(letterGlow2);
                    destroy(letterGlow3);
                    destroy(letter);
                };

                // Create and display message overlay with close handler
                const messageOverlay = createMessageOverlay(message, closeHandler);
                document.body.appendChild(messageOverlay);

                // Clean up overlay when letter is destroyed
                letter.onDestroy(() => {
                    removeMessageOverlay(messageOverlay);
                });
            });


            wait(3, () => {
                stitch.play("happy");
                lilo.play("happy");
                wait(3, () => {
                    stitch.play("idle");
                    lilo.play("idle");
                });
            });
        }

        // Move Stitch to middle of screen
        if (stitch.runningToMiddle) {
            const targetX = 600;
            const stitchSpeed = 200;

            // Move right (increase X)
            stitch.pos.x += stitchSpeed * dt();

            // Check if reached target
            if (stitch.pos.x >= targetX) {
                stitch.pos.x = targetX;
                stitch.runningToMiddle = false;
                stitch.atCenter = true;
                stitch.play("still");
            }
        }

        // Move Lilo manually to Stitch
        if (lilo.runningToMiddle) {
            const targetX = 800; // Stay next to Stitch's current position
            const liloSpeed = 200; // pixels per second

            // Move left (decrease X)
            lilo.pos.x -= liloSpeed * dt();

            // Check if reached target
            if (lilo.pos.x <= targetX) {
                lilo.pos.x = targetX;
                lilo.runningToMiddle = false;
                lilo.atCenter = true;
                lilo.play("idle");

                // Show popup when both are at center

            }
        }

        // Spawn obstacle when reaching next spawn distance
        if (distanceTraveled >= nextObstacleDistance && distanceTraveled < LENGTH - 1200) {
            spawnObstacle();
            // Set next obstacle distance with minimum 300px gap + random extra
            nextObstacleDistance = distanceTraveled + MIN_DIST_OBSTACLE + rand(100, 300);
        }

        // Stitch at fixed x (only when not running to middle)
        if (!LENGTH_COMPLETED) {
            stitch.pos.x = stitchStartX;
        }

        // Change animation based on state
        if (!LENGTH_COMPLETED && !stitch.runningToMiddle) {
            if (stitch.isGrounded()) {
                if (stitch.curAnim() !== "run") stitch.play("run");
            }// } else if (stitch.vel.y > 0) {
            //     if (stitch.curAnim() !== "fall") stitch.play("fall");
            // }
        }

        // Background
        if (bgPieces[1].pos.x < 0 && !LENGTH_COMPLETED) {
            bgPieces[0].moveTo(bgPieces[1].pos.x + bgPieceWidth * 2, yPositionBackground);
            const frontBgPiece = bgPieces.shift();
            // so typescript shuts up
            if (frontBgPiece) bgPieces.push(frontBgPiece);
        }

        if (!LENGTH_COMPLETED) {
            bgPieces[0].move(-backgroundSpeed, 0);
            bgPieces[1].moveTo(bgPieces[0].pos.x + bgPieceWidth * 2, yPositionBackground);

            // Move all clouds
            if (!LENGTH_COMPLETED) {
                for (const cloud of clouds) {
                    cloud.move(-cloudSpeed, 0);
                }
            }

            // Wrap around when the first cloud goes off screen
            if (clouds[0].pos.x < -cloudWidth && !LENGTH_COMPLETED) {
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
            if (platforms[1].pos.x < 0 && !LENGTH_COMPLETED) {
                platforms[0].moveTo(
                    platforms[1].pos.x + platformWidth,
                    platforms[1].pos.y
                );
                const frontPlatform = platforms.shift();
                if (frontPlatform) platforms.push(frontPlatform);
            }
            if (!LENGTH_COMPLETED) {
                platforms[0].move(-platformSpeed, 0);
                platforms[1].moveTo(platforms[0].pos.x + platformWidth, platforms[0].pos.y);
            }
        }
    });
});

scene("win", (distance) => {
    // Sky
    add([sprite("sky"), pos(0, -550), opacity(0.5), scale(1.6)]);

    // Background
    add([sprite("background"), pos(0, yPositionBackground), opacity(1), scale(2.5)]);

    // Clouds
    add([sprite("cloud"), pos(40, yPositionCloud), scale(2)]);
    add([sprite("cloud"), pos(1000, yPositionCloud2), scale(2)]);

    // Platform
    add([sprite("floor"), pos(0, yPositionPlatform), scale(platformScale)]);

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
    // Sky
    add([sprite("sky"), pos(0, -550), opacity(0.5), scale(1.6)]);

    // Background
    add([sprite("background"), pos(0, yPositionBackground), opacity(1), scale(2.5)]);

    // Clouds
    add([sprite("cloud"), pos(40, yPositionCloud), scale(2)]);
    add([sprite("cloud"), pos(1000, yPositionCloud2), scale(2)]);

    // Platform
    add([sprite("floor"), pos(0, yPositionPlatform), scale(platformScale)]);

    add([text("Game Over"), pos(center()), anchor("center"), scale(2)]);

    // display score
    add([
        text(`Score: ${score}m`),
        pos(width() / 2, height() / 2 + 80),
        scale(1.5),
        anchor("center"),
    ]);

    // Retry instruction
    const retryText = add([
        text("Press SPACE or Click to Retry"),
        pos(width() / 2, height() / 2 + 150),
        scale(0.8),
        anchor("center"),
        opacity(1),
    ]);

    // Blinking effect for retry text
    retryText.onUpdate(() => {
        retryText.opacity = Math.abs(Math.sin(time() * 2));
    });

    // go back to game when space is pressed
    onKeyPress("space", () => go("game"));
    onMousePress(() => go("game"));
});

go("start");
