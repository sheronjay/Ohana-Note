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

scene("game", () => {
    // define gravity
    setGravity(2000);

    let gameSpeed = 100;
    loop(1, () => {
        gameSpeed += 0;
    });

    // Background
    const bgPieceWidth = 765;
    const yPositionBackground = 20;
    const bgPieces = [
        add([sprite("background"), pos(0, yPositionBackground), opacity(0.8), scale(2.5)]),
        add([sprite("background"), pos(bgPieceWidth, yPositionBackground), opacity(0.8), scale(2.5)])
    ];

    // Platform
    const platformWidth = 890;
    const yPositionPlatform = 450;
    const platformScale = 0.6;
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

        bgPieces[0].move(-100, 0);
        bgPieces[1].moveTo(bgPieces[0].pos.x + bgPieceWidth * 2, yPositionBackground);

        // Platform
        if (platforms[1].pos.x < 0) {
            platforms[0].moveTo(
            platforms[1].pos.x + platformWidth,
            platforms[1].pos.y
        );
            const frontPlatform = platforms.shift();
            if (frontPlatform) platforms.push(frontPlatform);
        }

        platforms[0].move(-gameSpeed, 0);
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