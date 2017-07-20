/** A namespace for the Space Invaders game. */
var SpaceInvaders = SpaceInvaders || {};

/** ***************************************************************************
 * The root game structure for the Space Invaders game.
 *
 * This object module contains the necessary structure to glue the game objects
 * as a working game. It acts as the main entry point for the application which
 * is used to start the game and to provide a support for the scene system.
 *
 * The application can be created and started with the following way:
 *
 * var game = new SpaceInvaders();
 * game.start();
 *
 * After being constructed and called with the previously mentioned way, the
 * application starts running and will run until the browser window is being
 * closed or whether an application execption is raised.
 */
SpaceInvaders.Game = function () {
  /** A constant id of the canvas to be used as the rendering target. */
  var CANVAS_ID = "game-canvas";
  /** A constant definition for the game framerate. */
  var FPS = (1000.0 / 60.0);

  /** A definition whether the game is initialized or not. */
  var initialized = false;
  /** A reference to the HTML5 canvas used as the rendering target. */
  var canvas = undefined;
  /** A reference to the 2D drawing context from the HTML5 canvas. */
  var ctx = undefined;
  /** A reference to the currently active scene. */
  var scene = undefined;
  /** A definition of the time when the game was previously updated. */
  var previousTickTime = 0;
  /** A delta accumulator that collects the exceeding update time delta. */
  var deltaAccumulator = 0;

  /** ***********************************************************************
    * Get the definition whether the game is initialized.
    *
    * This function provides a simple way to externally check whether the game
    * has been inited successfully and is ready to run (or already running).
    *
    * @return {boolean} A definition whether the game is inited.
    */
  this.isInitialized = function () {
    return initialized;
  };

  /** ***********************************************************************
   * Get a reference to the currently active scene.
   *
   * This function returns a reference to currently active scene. If there is
   * currently no active scene, then this function returns the default value
   * (undefined) as a result.
   *
   * @return {SpaceInvaders.Scene} The currently active scene or undefined.
   */
  this.getScene = function () {
    return scene;
  }

  /** ***********************************************************************
   * Initialize the game.
   *
   * Initialization will ensure that the game will get a reference to the 2D
   * drawing context from the game canvas element. It also provides a way to
   * define a game wide initializations for game scenes etc.
   *
   * @return {boolean} A definition whether the initialization succeeded.
   */
  this.init = function () {
    // a sanity check to prevent re-initialization.
    if (initialized == true) {
      console.error("Unable to re-initialize the game.")
      return false;
    }

    // get a reference to the target <canvas> element.
    if (!(canvas = document.getElementById(CANVAS_ID))) {
      console.error("Unable to find the required canvas element.");
      return false;
    }

    // get a reference to the 2D drawing context.
    if (!(ctx = canvas.getContext("2d"))) {
      console.error("Unable to get a reference to 2D draw context.");
      return false;
    }

    // initialize the only scene used within the application.
    scene = new SpaceInvaders.Scene(this);

    // when the code reaches this point, the initialization succeeded.
    initialized = true;
    return true;
  };

  /** ***********************************************************************
   * Run the game.
   *
   * Running the game means that the game will execute an infinite loop that
   * runs the game logic updates and draw operations until the user closes
   * the browser tab or the JavaScript catches and exception from the code.
   *
   * It's quite important to note that the requestAnimationFrame provides the
   * tickTime automatically when it uses the function as a callback.
   *
   * @param {double} tickTime A timestamp when the function is called.
   */
  this.run = function (tickTime) {
    // calculate a delta time and store the current tick time.
    var dt = (tickTime - previousTickTime);
    previousTickTime = tickTime;

    // update and draw the scene only when we have reasonable delta.
    if (dt < 100) {
      deltaAccumulator += dt;
      while (deltaAccumulator >= FPS) {
        scene.update(FPS);
        deltaAccumulator -= FPS;
      }

      // swipe old contents from the draw buffer and draw the scene.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      scene.render(ctx);
    }

    // perform a main loop iteration.
    requestAnimationFrame(this.run.bind(this));
  };

  /** ***********************************************************************
   * Start the game.
   *
   * Game will be first initialized and the started. Game will be using an
   * infinite loop (via requestAnimationFrame) as the main loop, so the game
   * will not stop running until the user closes the browser tab or if an
   * error is detected by the browser JavaScript engine.
   */
  this.start = function () {
    if (this.init()) {
      this.run(0);
    }
  };
};

/** ***************************************************************************
 * An entity abstraction for all game objects within the Space Invaders game.
 *
 * This class acts as the root of all entities within the game scene. It does
 * contain all the shared definitions that must be present within all entities
 * that are created into the game scene. This also includes the root game and
 * scene instances as well as the 2d-coordinates of the entity.
 *
 * @param {SpaceInvaders.Game} game A reference to the target game instance.
 */
SpaceInvaders.Entity = function (game) {
  /** A reference to the root game instance. */
  this.game = game;
  /** A reference to the used scene instance. */
  this.scene = game.getScene();

  /** A constant default value for the y-position. */
  this.DEFAULT_X = 0;
  /** A constant default value for the x-position. */
  this.DEFAULT_Y = 0;

  /** The x-coordinate position of the entity. */
  var x = this.DEFAULT_X;
  /** The y-coordinate position of the entity. */
  var y = this.DEFAULT_Y;

  this.getX = function () { return x; }
  this.getY = function () { return y; }

  this.setX = function (newX) { x = newX; }
  this.setY = function (newY) { y = newY; }
};

/** ***************************************************************************
 * A textual entity for all texts used in the Space Invaders game.
 *
 * This class presents a textual entity within the game scene. It does really
 * an encapsulation of the 2d drawing context textual presentation functions.
 *
 * @param {SpaceInvaders.Game} game A reference to the target game instance.
 */
SpaceInvaders.TextEntity = function (game) {
  SpaceInvaders.Entity.call(this, game);

  /** The text to be rendered. */
  var text = "";
  /** The fill style (i.e. color) used to draw the text. */
  var fillStyle = "white";
  /** The target font description i.e. size, font family, etc. */
  var font = "24pt monospace";
  /** The text align definition (start|end|center|left|right). */
  var align = "start";
  /** The definition whether the entity should be rendered. */
  var visible = true;

  this.update = function (dt) {
    // ...
  }

  /** *************************************************************************
   * Render (i.e. draw) the text on the screen.
   * @param {CanvasRenderingContext2D} ctx The drawing context to use.
   */
  this.render = function (ctx) {
    if (this.isVisible()) {
      ctx.fillStyle = this.getFillStyle();
      ctx.textAlign = this.getAlign();
      ctx.font = this.getFont();
      ctx.fillText(this.getText(), this.getX(), this.getY());
    }
  }

  this.getText      = function () { return text;      }
  this.getFillStyle = function () { return fillStyle; }
  this.getFont      = function () { return font;      }
  this.getAlign     = function () { return align;     }
  this.isVisible    = function () { return visible;   }

  this.setText      = function (newText)    { text = newText;       }
  this.setFillStyle = function (newStyle)   { fillStyle = newStyle; }
  this.setFont      = function (newFont)    { font = newFont;       }
  this.setAlign     = function (newAlign)   { align = newAlign;     }
  this.setVisible   = function (newVisible) { visible = newVisible; }
}

/** ***************************************************************************
 * The scene used within the Space Invaders game application.
 *
 * Space Invaders contains only one scene that is kept visible during the whole
 * application execution. This scene will always contain the 3 score at the top
 * of the scene (i.e. 1st and 2nd player scores and the high score).The center
 * contents of the screen will be changed dynamically based on the current state
 * of the game. The original version also contained the "Credit" section always
 * visible at the bottom-right corner of the scene, but we can leave that out.
 *
 * @param {SpaceInvaders.Game} game A reference to the target game instance.
 */
SpaceInvaders.Scene = function (game) {
  /** A reference to the root game instance. */
  this.game = game;

  var score1Caption;
  var hiScoreCaption;
  var score2Caption;

  var score1Text;
  var hiScoreText;
  var score2Text;

  // initialize the static caption for the 1st player score.
  score1Caption = new SpaceInvaders.TextEntity(game);
  score1Caption.setText("SCORE< 1 >");
  score1Caption.setAlign("center");
  score1Caption.setX(125);
  score1Caption.setY(40);

  // initialize the static caption for the high score.
  hiScoreCaption = new SpaceInvaders.TextEntity(game);
  hiScoreCaption.setText("HI-SCORE");
  hiScoreCaption.setAlign("center");
  hiScoreCaption.setX(672 / 2);
  hiScoreCaption.setY(score1Caption.getY());

  // initialize the static caption for the 1st player score.
  score2Caption = new SpaceInvaders.TextEntity(game);
  score2Caption.setText("SCORE< 2 >");
  score2Caption.setAlign("center");
  score2Caption.setX(672 - 130);
  score2Caption.setY(score1Caption.getY());

  // initialize the dynamic score value for the 1st player score.
  score1Text = new SpaceInvaders.TextEntity(game);
  score1Text.setText("0000");
  score1Text.setAlign("center");
  score1Text.setX(score1Caption.getX());
  score1Text.setY(score1Caption.getY() + 35);

  // initialize the dynamic score value for the high score.
  hiScoreText = new SpaceInvaders.TextEntity(game);
  hiScoreText.setText("0000");
  hiScoreText.setAlign("center");
  hiScoreText.setX(hiScoreCaption.getX());
  hiScoreText.setY(score1Text.getY());

  // initialize the dynamic score value for the 2nd player score.
  score2Text = new SpaceInvaders.TextEntity(game);
  score2Text.setText("0000");
  score2Text.setAlign("center");
  score2Text.setX(score2Caption.getX());
  score2Text.setY(score1Text.getY());

  /** *************************************************************************
   * Update (i.e. tick) the all the game logic within the scene.
   * @param {double} dt The delta time from the previous tick operation.
   */
  this.update = function (dt) {
    // ...
  };

  /** *************************************************************************
   * Render (i.e. draw) the all visible stuff.
   * @param {CanvasRenderingContext2D} ctx The drawing context to use.
   */
  this.render = function (ctx) {
    score1Caption.render(ctx);
    hiScoreCaption.render(ctx);
    score2Caption.render(ctx);

    score1Text.render(ctx);
    hiScoreText.render(ctx);
    score2Text.render(ctx);
  };
}
