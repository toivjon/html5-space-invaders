/** A namespace for the Space Invaders game. */
var SpaceInvaders = SpaceInvaders || {};

/** *************************************************************************
 * A helper utility to create a four digit string from the given score.
 *
 * Four digit string is ensured by prepending additional zeroes to the given
 * value when necessary. For example value 12 is transformed to "0012" string.
 *
 * @param {number} score The score to be converted into a string.
 */
SpaceInvaders.toScoreString = function (score) {
  var result = "NaN";
  if (typeof score == 'number') {
    result = score.toString();
    var difference = (4 - result.length);
    if (difference >= 0) {
      result = "0000" + result;
    }
    result = result.substring(result.length - 4);
  }
  return result;
}

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

  /** A constant for the number one keycode. */
  this.KEY_1 = 49;
  /** A constant for the number two keycode. */
  this.KEY_2 = 50;

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

  /** The score of the 1st player. */
  var player1Score = 0;
  /** The score of the 2nd player. */
  var player2Score = 0;
  /** The hi-score of the current game instace. */
  var hiScore = 0;

  /** The amount of players. */
  var playerCount = 2;

  /** The sprite sheet containing all image assets for the game. */
  var spriteSheet = undefined;

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

    // TODO make this a synchronous load to avoid invalid references?
    // load the source sprite sheet as an image.
    spriteSheet = new Image();
    spriteSheet.src = "space_invaders_spritesheet.png";

    // initialize the only scene used within the application.
    scene = new SpaceInvaders.Scene(this);

    // construct and assign the initial welcoming state.
    scene.setState(new SpaceInvaders.WelcomeState(this));

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

  this.getPlayer1Score  = function () { return player1Score;  }
  this.getPlayer2Score  = function () { return player2Score;  }
  this.getHiScore       = function () { return hiScore;       }
  this.getSpriteSheet   = function () { return spriteSheet;   }
  this.getPlayerCount   = function () { return playerCount;   }

  this.setPlayer1Score  = function (newScore) { player1Score = newScore;  }
  this.setPlayer2Score  = function (newScore) { player2Score = newScore;  }
  this.setHiScore       = function (newScore) { hiScore = newScore;       }
  this.setPlayerCount   = function (newCount) { playerCount = newCount;   }
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
 * A sprite entity for image sprites for the Space Invaders game.
 *
 * This entity presents a drawable sprite entity that is drawn from an external
 * image file provided with the #setImage function. Note that it is typically
 * a good idea to put all sprites in a single sprite sheet so the same image is
 * being loaded only once and can be therefore used with all sprites.
 *
 * @param {SpaceInvaders.Game} game A reference to the root game instance.
 */
SpaceInvaders.SpriteEntity = function (game) {
  SpaceInvaders.Entity.call(this, game);

  /** A constant default for the sprite width. */
  this.DEFAULT_WIDTH = 0;
  /** A constant default for the sprite height. */
  this.DEFAULT_HEIGHT = 0;
  /** A constant default for the sprite clipping x-coordinate. */
  this.DEFAULT_CLIP_X = 0;
  /** A constant default for the sprite clipping y-coordinate. */
  this.DEFAULT_CLIP_Y = 0;
  /** A constant default for the sprite image. */
  this.DEFAULT_IMAGE = undefined;

  /** The width of the sprite. */
  var width = this.DEFAULT_WIDTH;
  /** The height of the sprite. */
  var height = this.DEFAULT_HEIGHT;
  /** The clipping x-coordinate of the image. */
  var clipX = this.DEFAULT_CLIP_X;
  /** The clipping y-coordinate of the image. */
  var clipY = this.DEFAULT_CLIP_Y;
  /** The source image to render sprite from. */
  var image = this.DEFAULT_IMAGE;

  this.render = function (ctx) {
    if (image) {
      ctx.drawImage(image,
        this.getClipX(),
        this.getClipY(),
        this.getWidth(),
        this.getHeight(),
        this.getX(),
        this.getY(),
        this.getWidth(),
        this.getHeight());
    }
  }

  this.getWidth   = function () { return width;   }
  this.getHeight  = function () { return height;  }
  this.getClipX   = function () { return clipX;   }
  this.getClipY   = function () { return clipY;   }
  this.getImage   = function () { return image;   }

  this.setWidth   = function (newWidth)   { width = newWidth;   }
  this.setHeight  = function (newHeight)  { height = newHeight; }
  this.setClipX   = function (newClip)    { clipX = newClip;    }
  this.setClipY   = function (newClip)    { clipY = newClip;    }
  this.setImage   = function (newImage)   { image = newImage;   }
}

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

  /** A constant default value for the text to be drawn. */
  this.DEFAULT_TEXT = "";
  /** A constant default fill style (i.e. color) for the text. */
  this.DEFAULT_FILL_STYLE = "white";
  /** A constant default font definition for the text. */
  this.DEFAULT_FONT = "24pt monospace";
  /** A constant default text alignment for the rendering. */
  this.DEFAULT_ALIGN = "start";
  /** A constant default visibility state for the text. */
  this.DEFAULT_VISIBLE = true;
  /** A constant amount of toggles to perform after #blink is called. */
  this.DEFAULT_BLINK_COUNT = 20;
  /** A constant amount of updates (i.e. interval) between the blinking. */
  this.DEFAULT_BLINK_FREQUENCY = 5;

  /** The text to be rendered. */
  var text = this.DEFAULT_TEXT;
  /** The fill style (i.e. color) used to draw the text. */
  var fillStyle = this.DEFAULT_FILL_STYLE;
  /** The target font description i.e. size, font family, etc. */
  var font = this.DEFAULT_FONT;
  /** The text align definition (start|end|center|left|right). */
  var align = this.DEFAULT_ALIGN;
  /** The definition whether the entity should be rendered. */
  var visible = this.DEFAULT_VISIBLE;
  /** The amount of remaining blinks (visible/invisible toggles). */
  var blinks = 0;
  /** The blink timer that will perform the blink frequency calculation. */
  var blinkTimer = 0;
  /** Amount of blinks to be perfomed after #blink is called (-1: infinite).*/
  var blinkCount = this.DEFAULT_BLINK_COUNT;
  /** The amount of updates (i.e. interval) between the blinks. */
  var blinkFrequency = this.DEFAULT_BLINK_FREQUENCY;

  /** *************************************************************************
   * Update (i.e. tick) the the logic within the entity.
   * @param {double} dt The delta time from the previous tick operation.
   */
  this.update = function (dt) {
    if (blinks > 0 || blinks == -1) {
      blinkTimer--;
      if (blinkTimer == 0) {
        this.setVisible(!this.isVisible());
        blinks--;
        blinks = Math.max(blinks, -1);
        if (blinks > 0 || blinks == -1) {
          blinkTimer = blinkFrequency;
        }
      }
    }
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

  /** *************************************************************************
   * Start blinking (i.e. toggling visible/invisible).
   *
   * After this function is called, the target entity will start to blink if it
   * is currently visible. If the entity is already blinking then the amount of
   * remaining blinks will be reset back to the amount of the this.BLINK_COUNT.
   */
  this.blink = function () {
    if (this.isVisible() || blinks > 0) {
      this.setVisible(true);
      blinks = blinkCount;
      blinkTimer = blinkFrequency;
    }
  }

  this.getText            = function () { return text;            }
  this.getFillStyle       = function () { return fillStyle;       }
  this.getFont            = function () { return font;            }
  this.getAlign           = function () { return align;           }
  this.isVisible          = function () { return visible;         }
  this.getBlinkCount      = function () { return blinkCount;      }
  this.getBlinkFrequency  = function () { return blinkFrequency;  }

  this.setText            = function (newText)    { text = newText;           }
  this.setFillStyle       = function (newStyle)   { fillStyle = newStyle;     }
  this.setFont            = function (newFont)    { font = newFont;           }
  this.setAlign           = function (newAlign)   { align = newAlign;         }
  this.setVisible         = function (newVisible) { visible = newVisible;     }
  this.setBlinkCount      = function (newCount)   { blinkCount = newCount;    }
  this.setBlinkFrequency  = function (newFreq)    { blinkFrequency = newFreq; }
}

/** ***************************************************************************
 * A welcome state for the Space Invaders game.
 *
 * This state contains the definitions required to show the welcoming message
 * to the user(s). It contains the game name along with the score instructions
 * and an instruction how to start the game. It does not however contain a
 * complex set of game logics as the actual game simulation is not required.
 *
 * @param {SpaceInvaders.Game} game A reference to the root game instance.
 */
SpaceInvaders.WelcomeState = function (game) {
  /** A reference to the root game instance. */
  this.game = game;

  var playText;
  var nameText;
  var singlePlayerText;
  var multiPlayerText;
  var controlsText;
  var tableCaptionText;
  var tableRow1Sprite;
  var tableRow1Text;
  var tableRowS2prite;
  var tableRow2Text;
  var tableRow3Sprite;
  var tableRow3Text;
  var tableRow4Sprite;
  var tableRow4Text;

  // initialize the play game text.
  playText = new SpaceInvaders.TextEntity(game);
  playText.setText("PLAY");
  playText.setAlign("center");
  playText.setX(672 / 2);
  playText.setY(175);

  // initialize the game name text.
  nameText = new SpaceInvaders.TextEntity(game);
  nameText.setText("HTML5 SPACE INVADERS");
  nameText.setAlign("center");
  nameText.setFillStyle("#20ff20");
  nameText.setX(playText.getX());
  nameText.setY(playText.getY() + 75);

  // initialize the single player text.
  singlePlayerText = new SpaceInvaders.TextEntity(game);
  singlePlayerText.setText("PRESS [1] FOR A 1 PLAYER GAME");
  singlePlayerText.setAlign("center");
  singlePlayerText.setX(playText.getX());
  singlePlayerText.setY(nameText.getY() + 75);
  singlePlayerText.setBlinkCount(-1);
  singlePlayerText.setBlinkFrequency(25);
  singlePlayerText.blink();

  // initialize the multiplayer text.
  multiPlayerText = new SpaceInvaders.TextEntity(game);
  multiPlayerText.setText("PRESS [2] FOR A 2 PLAYER GAME");
  multiPlayerText.setAlign("center");
  multiPlayerText.setX(playText.getX());
  multiPlayerText.setY(singlePlayerText.getY() + 50);
  multiPlayerText.setBlinkCount(-1);
  multiPlayerText.setBlinkFrequency(25);
  multiPlayerText.blink();

  controlsText = new SpaceInvaders.TextEntity(game);
  controlsText.setText("USE ARROW KEYS AND SPACEBAR TO PLAY");
  controlsText.setAlign("center");
  controlsText.setX(playText.getX());
  controlsText.setY(multiPlayerText.getY() + 75);

  // initiailize the score advance table text.
  tableCaptionText = new SpaceInvaders.TextEntity(game);
  tableCaptionText.setText("-- SCORE ADVANCE TABLE --");
  tableCaptionText.setAlign("center");
  tableCaptionText.setX(playText.getX());
  tableCaptionText.setY(controlsText.getY() + 75);

  // initialize the 1st table row sprite image.
  tableRow1Sprite = new SpaceInvaders.SpriteEntity(game);
  tableRow1Sprite.setImage(game.getSpriteSheet());
  tableRow1Sprite.setX(playText.getX() - 130);
  tableRow1Sprite.setY(tableCaptionText.getY() + 25);
  tableRow1Sprite.setWidth(43);
  tableRow1Sprite.setHeight(19);
  tableRow1Sprite.setClipX(5);
  tableRow1Sprite.setClipY(92);

  // initialize the 1st table row text.
  tableRow1Text = new SpaceInvaders.TextEntity(game);
  tableRow1Text.setText("= ?  MYSTERY");
  tableRow1Text.setX(tableRow1Sprite.getX() + 10 + tableRow1Sprite.getWidth());
  tableRow1Text.setY(tableRow1Sprite.getY() + 20);

  // initialize the 2nd table row sprite image.
  tableRow2Sprite = new SpaceInvaders.SpriteEntity(game);
  tableRow2Sprite.setImage(game.getSpriteSheet());
  tableRow2Sprite.setX(playText.getX() - 120);
  tableRow2Sprite.setY(tableRow1Sprite.getY() + 35);
  tableRow2Sprite.setWidth(24);
  tableRow2Sprite.setHeight(24);
  tableRow2Sprite.setClipX(5);
  tableRow2Sprite.setClipY(63);

  // initialize the 2nd table row text.
  tableRow2Text = new SpaceInvaders.TextEntity(game);
  tableRow2Text.setText("= 30 POINTS");
  tableRow2Text.setX(tableRow1Text.getX());
  tableRow2Text.setY(tableRow2Sprite.getY() + 22);

  // initialize the 3rd table row sprite image.
  tableRow3Sprite = new SpaceInvaders.SpriteEntity(game);
  tableRow3Sprite.setImage(game.getSpriteSheet());
  tableRow3Sprite.setX(playText.getX() - 125);
  tableRow3Sprite.setY(tableRow2Sprite.getY() + 35);
  tableRow3Sprite.setWidth(33);
  tableRow3Sprite.setHeight(24);
  tableRow3Sprite.setClipX(5);
  tableRow3Sprite.setClipY(34);

  // initialize the 3rd table row text.
  tableRow3Text = new SpaceInvaders.TextEntity(game);
  tableRow3Text.setText("= 20 POINTS");
  tableRow3Text.setX(tableRow1Text.getX());
  tableRow3Text.setY(tableRow3Sprite.getY() + 22);

  // initialize the 4th table row sprite image.
  tableRow4Sprite = new SpaceInvaders.SpriteEntity(game);
  tableRow4Sprite.setImage(game.getSpriteSheet());
  tableRow4Sprite.setX(playText.getX() - 125);
  tableRow4Sprite.setY(tableRow3Sprite.getY() + 35);
  tableRow4Sprite.setWidth(36);
  tableRow4Sprite.setHeight(24);
  tableRow4Sprite.setClipX(5);
  tableRow4Sprite.setClipY(5);

  // initialize the 4th table row text.
  tableRow4Text = new SpaceInvaders.TextEntity(game);
  tableRow4Text.setText("= 10 POINTS");
  tableRow4Text.setX(tableRow1Text.getX());
  tableRow4Text.setY(tableRow4Sprite.getY() + 22);

  /** *************************************************************************
   * Update (i.e. tick) the the logic within the state.
   * @param {double} dt The delta time from the previous tick operation.
   */
  this.update = function (dt) {
    playText.update(dt);
    nameText.update(dt);
    singlePlayerText.update(dt);
    multiPlayerText.update(dt);
    controlsText.update(dt);
    tableCaptionText.update(dt);
  }

  /** *************************************************************************
   * Render (i.e. draw) the state on the screen.
   * @param {CanvasRenderingContext2D} ctx The drawing context to use.
   */
  this.render = function (ctx) {
    playText.render(ctx);
    nameText.render(ctx);
    singlePlayerText.render(ctx);
    multiPlayerText.render(ctx);
    controlsText.render(ctx);
    tableCaptionText.render(ctx);

    // render score advance table row sprites.
    tableRow1Sprite.render(ctx);
    tableRow2Sprite.render(ctx);
    tableRow3Sprite.render(ctx);
    tableRow4Sprite.render(ctx);

    // render score advance table row texts.
    tableRow1Text.render(ctx);
    tableRow2Text.render(ctx);
    tableRow3Text.render(ctx);
    tableRow4Text.render(ctx);
  }

  /** *************************************************************************
   * A function that is called when the state is being entered.
   *
   * This function is called before the state is being updated (i.e. ticked)
   * for a first time. This makes it an ideal place to put all listener logic.
   */
  this.enter = function () {
    document.addEventListener("keyup", this.keyUp);
  }

  /** *************************************************************************
   * A function that is called when the state is being exited.
   *
   * This function is called after the state is being updated (i.e. ticked)
   * for the last time. This makes it an ideal place to cleanup listeners etc.
   */
  this.exit = function () {
    document.removeEventListener("keyup", this.keyUp);
  }

  /** *************************************************************************
   * A key listener function called when the user releases a key press.
   * @param {KeyboardEvent} e The keyboard event received from the DOM.
   */
  this.keyUp = function (e) {
    var key = event.keyCode ? event.keyCode : event.which;
    switch (key) {
      case game.KEY_1:
        game.setPlayerCount(1);
        // TODO ...
        break;
      case game.KEY_2:
        game.setPlayerCount(2);
        // TODO ...
        break;
    }
  }
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

  var state;

  // initialize the static caption for the 1st player score.
  score1Caption = new SpaceInvaders.TextEntity(game);
  score1Caption.setText("SCORE<1>");
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
  score2Caption.setText("SCORE<2>");
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
   * Set and enter into the given state.
   *
   * The previous state (if any) will be first exited by calling the #exit so
   * it can perform any cleanup e.g. removing listeners from DOM objects etc.
   * When the new state is assigned, it will be entered with the #enter method.
   *
   * @param {SpaceInvaders.<*>State} newState A state to be assigned.
   */
  this.setState = function (newState) {
    // exit from the previous state.
    if (state) {
      state.exit();
    }

    // assign the new state.
    state = newState;

    // enter into the new state.
    if (state) {
      state.enter();
    }
  }

  /** *************************************************************************
   * Update (i.e. tick) the all the game logic within the scene.
   * @param {double} dt The delta time from the previous tick operation.
   */
  this.update = function (dt) {
    // ensure that all visible score-markers are up-to-date.
    score1Text.setText(SpaceInvaders.toScoreString(game.getPlayer1Score()));
    score2Text.setText(SpaceInvaders.toScoreString(game.getPlayer2Score()));
    hiScoreText.setText(SpaceInvaders.toScoreString(game.getHiScore()));

    // an ugly way to define whether the second player score should be visible.
    score2Text.setVisible(this.game.getPlayerCount() == 2);

    score1Caption.update(dt);
    hiScoreCaption.update(dt);
    score2Caption.update(dt);

    score1Text.update(dt);
    hiScoreText.update(dt);
    score2Text.update(dt);

    state.update(dt);
  }

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

    state.render(ctx);
  }

  this.getState = function () { return state; }
}
