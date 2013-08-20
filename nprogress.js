(function(NProgress) {

  this.NProgress = NProgress;

})(function($) {
  var NProgress = {};

  var Settings = NProgress.settings = {
    minimum: 0.08,
    easing: 'ease',
    speed: 300,
    trickleSpeed: 0.008,
    template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner"><div class="spinner-icon"></div></div>'
  };

  /**
   * Updates configuration.
   *
   *     NProgress.configure({
   *       minimum: 0.1
   *     });
   */
  NProgress.configure = function(options) {
    $.extend(Settings, options);
    return this;
  };

  /**
   * Last number.
   */

  NProgress.status = null;

  /**
   * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
   *
   *     NProgress.set(0.4);
   *     NProgress.set(1.0);
   */

  NProgress.set = function(n) {
    n = clamp(n, Settings.minimum, 1);
    NProgress.status = (n === 1 ? null : n);

    var $progress = NProgress.render(),
        $bar      = $progress.find('[role~="bar"]'),
        speed     = Settings.speed,
        ease      = Settings.easing;

    setTimeout(function() {
      $progress.queue(function(next) {
        var perc = -1 + n; /* -1.0 ... 0.0 */

        $bar.css({
          transition: 'all '+speed+'ms '+ease,
          transform: 'translate3d('+(perc*100)+'%,0,0)'
        });

        if (n === 1) {
          $progress.css({ transition: 'none', opacity: 1 });

          setTimeout(function() {
            $progress.css({ transition: 'all '+speed+'ms linear', opacity: 0 });
            setTimeout(function() {
              $progress.remove();
              next();
            }, speed);
          }, speed);
        } else {
          setTimeout(next, speed);
        }
      });
    }, 0);

    return this;
  };

  /**
   * Shows the progress bar.
   * This is the same as setting the status to 0%, except that it doesn't go backwards.
   *
   *     NProgress.start();
   *
   */
  NProgress.start = function() {
    if (!NProgress.status) NProgress.set(0);

    var work = function() {
      setTimeout(function() {
        if (!NProgress.status) return;
        NProgress.trickle();
        work();
      }, Settings.speed * 4);
    };

    if (Settings.trickleSpeed) work();

    return this;
  };

  /**
   * Hides the progress bar.
   * This is the *sort of* the same as setting the status to 100%, with the
   * difference being `done()` makes some placebo effect of some realistic motion.
   *
   *     NProgress.done();
   *
   * If `true` is passed, it will show the progress bar even if its hidden.
   *
   *     NProgress.done(true);
   */

  NProgress.done = function(force) {
    if (!force && !NProgress.status) return this;

    return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
  };

  /**
   * Increments by a random amount.
   */

  NProgress.inc = function(amount) {
    var n = NProgress.status;

    if (!n) {
      return NProgress.start();
    } else {
      if (typeof amount !== 'number') {
        amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
      }

      n = clamp(n + amount, 0, 0.994);
      return NProgress.set(n);
    }
  };

  NProgress.trickle = function() {
    return NProgress.inc(Math.random() * Settings.trickleSpeed);
  };

  /**
   * (Internal) renders the progress bar markup based on the `template`
   * setting.
   */

  NProgress.render = function() {
    if (NProgress.isRendered()) return $("#nprogress");

    var $el = $("<div id='nprogress'>")
      .html(Settings.template)
      .appendTo(document.body);

    $el.find('[role~="bar"]').css({
      transition: 'all 0 linear',
      transform: 'translate3d(-100%,0,0)'
    });

    return $el;
  };

  /**
   * Checks if the progress bar is rendered.
   */

  NProgress.isRendered = function() {
    return ($("#nprogress").length > 0);
  };

  /**
   * Helpers
   */

  function clamp(n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  return NProgress;
}(jQuery));

