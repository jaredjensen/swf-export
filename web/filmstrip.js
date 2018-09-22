(function($) {
  function moveHead($el, o, direction) {
    var head = $el.data('filmstripHead');
    o = o || opts($el);

    // Set the head position
    if (direction > 0) {
      head.frame++;
      head.col++;
      if (head.frame > o.numFrames) {
        // Go to frame 1
        head.frame = 1;
        head.col = 1;
        head.row = 1;
      } else if (head.col > o.grid.cols) {
        // Go to next row
        head.col = 1;
        head.row++;
      }
    } else if (direction < 0) {
      head.frame--;
      head.col--;
      if (head.frame < 1) {
        // Go to last frame
        head.frame = o.numFrames;
        head.col = o.grid.colsInLastRow;
        head.row = o.grid.rows;
      } else if (head.col < 1) {
        // Go to previous row
        head.col = o.grid.cols;
        head.row--;
      }
    } else {
      return;
    }

    // Set the image position
    var pos = {
      x: (head.col - 1) * -o.frameWidth,
      y: (head.row - 1) * -o.frameHeight,
    };
    $el.css({ backgroundPositionX: pos.x, backgroundPositionY: pos.y });

    $el.data('filmstripHead', head);
  }

  function play($el) {
    clearInterval($el.data('filmstripInterval'));
    var o = opts($el);
    var intvl = setInterval(function() {
      moveHead($el, o, 1);
    }, o.speed);
    $el.data('filmstripInterval', intvl);
    fireEvent($el, 'onPlay');
  }

  function stop($el) {
    clearInterval($el.data('filmstripInterval'));
    fireEvent($el, 'onStop');
  }

  function startDrag($el, pos) {
    stop($el);
    opts($el, { drag: pos });
    fireEvent($el, 'onDragStart');
  }

  function onDrag($el, pos) {
    var o = opts($el, { drag: pos });
    var dir = pos > o.drag ? 1 : -1;
    moveHead($el, o, dir);
    fireEvent($el, 'onDrag', dir);
  }

  function stopDrag($el) {
    fireEvent($el, 'onDragStop');
  }

  function loadImage($el) {
    var d = $.Deferred();
    var o = opts($el);

    // Set the loading message
    var $loader = $el.find('.filmstrip-loader');
    if (!$loader.length) {
      $loader = $('<span class="filmstrip-loader">Loading...</span>');
      $el.append($loader);
    }
    $loader.show();

    // Load the image and viewer
    var tmp = new Image();
    tmp.onload = function(e) {
      // Calculate the sprite grid
      var img = e.path[0];
      var cols = img.width / o.frameWidth;
      var rows = img.height / o.frameHeight;
      var colsInLastRow = cols - (cols * rows - o.numFrames);
      opts($el, {
        grid: {
          cols,
          rows,
          colsInLastRow,
        },
      });

      // Set the image and remove loader
      $el.html('').css('backgroundImage', 'url("' + o.spriteUrl + '")');
      $loader.remove();

      // Hook drag events
      $el.on('mousedown', function(e) {
        startDrag($el, e.clientX);
      });
      $el.on('mousemove', function(e) {
        if (e.buttons) {
          onDrag($el, e.clientX);
        }
      });
      $el.on('mouseleave mouseup', function() {
        stopDrag($el);
      });

      d.resolve($el, o);
      fireEvent($el, 'onLoad');
    };
    tmp.src = o.spriteUrl;

    return d;
  }

  function fireEvent($el, eventName, args) {
    var o = opts($el);
    if (typeof o[eventName] === 'function') {
      o[eventName]($el, args);
    }
  }

  function registerCallback($el, eventName, cb) {
    var o = {};
    o[eventName] = cb;
    opts($el, o);
  }

  function opts($el, opts) {
    var name = 'filmstripOptions';
    var oldOpts = $el.data(name) || {};
    if (opts) {
      var newOpts = Object.assign({}, oldOpts, opts);
      $el.data(name, newOpts);
    }
    return oldOpts;
  }

  $.fn.filmstrip = function(options) {
    this.each(function() {
      var $self = $(this);

      if (options && typeof options === 'string') {
        switch (options) {
          case 'play':
            play($self);
            break;
          case 'stop':
            stop($self);
            break;
          case 'onPlay':
          case 'onStop':
            registerCallback($self, options, arguments[1]);
            break;
        }
      } else {
        init($self, options);
      }
    });

    return this;
  };

  function init($el, options) {
    // Construct options
    var defaultOptions = {
      autoLoad: true,
      autoPlay: true,
      cols: 1,
      frameHeight: 400,
      frameWidth: 400,
      numFrames: 1,
      speed: 50,
      spriteUrl: '',
    };
    var o = Object.assign({}, defaultOptions, $el.data('filmstrip'), options);
    opts($el, o);

    // Initialize play head
    var head = {
      col: 1,
      frame: 1,
      row: 1,
    };
    $el.data('filmstripHead', head);
    $el.addClass('filmstrip');

    // Conditionally auto-play
    if (o.autoLoad) {
      loadImage($el).then(function() {
        if (o.autoPlay) {
          play($el);
        }
      });
    }
  }

  $(function() {
    $('.filmstrip').filmstrip();
  });
})(window.jQuery);
