import kaplay from "kaplay";
import "kaplay/global"; // comment if you want to use the k. prefix

const FLOOR_HEIGHT = 600;
const JUMP_FORCE = 800;
const SPEED = 480;

// initialize context
kaplay({ background: [0, 0, 0] });

// load assets
loadSprite("bean", "sprites/bean.png");
loadSprite("floor", "sprites/floor.png");
loadSprite("background", "sprites/background.png");
loadSprite("sky", "sprites/sky.jpeg");
loadSprite("cloud", "sprites/cloud1.png");

scene("game", () => {
    // define gravity
    setGravity(2000);

    let gameSpeed = 100;
    loop(1, () => {
        gameSpeed += 0;
    });

    // Speeds
    const backgroundSpeed = 50;
    const cloudSpeed = 40;
    const platformSpeed = 100;

    // Sky
    add([sprite("sky"), pos(0, -550), opacity(0.5), scale(1.6)]);

    // Background
    const bgPieceWidth = 765;
    const yPositionBackground = -18;
    const bgPieces = [
        add([sprite("background"), pos(0, yPositionBackground), opacity(1), scale(2.5)]),
        add([sprite("background"), pos(bgPieceWidth, yPositionBackground), opacity(0.8), scale(2.5)])
    ];

    // clouds
    const cloudWidth = 500;
    const yPositionCloud = 150;
    const yPositionCloud2 = 100;
    const clouds = [
        add([sprite("cloud"), pos(40, yPositionCloud), scale(2)]),
        add([sprite("cloud"), pos(1000, yPositionCloud2), scale(2)]),
        add([sprite("cloud"), pos(1800, yPositionCloud2), scale(2)]),
        add([sprite("cloud"), pos(1500, yPositionCloud2 + 100), scale(1.5)]),
        add([sprite("cloud"), pos(cloudWidth, yPositionCloud2), scale(0.6)])
    ];

    // Platform
    const platformWidth = 1172;
    const yPositionPlatform = 435;
    const platformScale = 1.2;
    const platforms = [
        add([sprite("floor"), pos(0, yPositionPlatform), scale(platformScale)]),
        add([sprite("floor"), pos(2560, yPositionPlatform), scale(platformScale)]),
    ];

    onUpdate(() => {
        // Background
        if (bgPieces[1].pos.x < 0) {
            bgPieces[0].moveTo(bgPieces[1].pos.x + bgPieceWidth * 2, yPositionBackground);
            const frontBgPiece = bgPieces.shift();
            // so typescript shuts up
            if (frontBgPiece) bgPieces.push(frontBgPiece);
        }

        bgPieces[0].move(-backgroundSpeed, 0);
        bgPieces[1].moveTo(bgPieces[0].pos.x + bgPieceWidth * 2, yPositionBackground);

        // Clouds - move all clouds
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