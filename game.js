var spaceInvaders = (function () {

  return {
    /** ***********************************************************************
     * Initialize the game.
     *
     * Initialization will ensure that the game will get a reference to the 2D
     * drawing context from the game canvas element. It also provides a way to
     * define a game wide initializations for game scenes etc.
     */
    init: function () {
      // TODO ...
    },
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
    run: function (tickTime) {
      // TODO ...
    },
    /** ***********************************************************************
     * Start the game.
     *
     * Game will be first initialized and the started. Game will be using an
     * infinite loop (via requestAnimationFrame) as the main loop, so the game
     * will not stop running until the user closes the browser tab or if an
     * error is detected by the browser JavaScript engine.
     */
    start: function () {
      this.init();
      this.run(0);
    }
  };

})();

spaceInvaders.start();
