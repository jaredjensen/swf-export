(function($) {
  function moveHead($el, o, direction) {
    if (direction === 0) {
      return;
    }

    o = o || opts($el);

    if (direction > 0) {
      o.frame++;
      if (o.frame > o.numFrames) {
        o.frame = 1;
      }
    } else {
      o.frame--;
      if (o.frame < 1) {
        o.frame = o.numFrames;
      }
    }

    var src = imageUrl(o, o.frame);
    o.img.attr('src', src);

    opts($el, { frame: o.frame });
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

  function pad(s, len) {
    s = s.toString();
    while (s.length < len) {
      s = '0' + s;
    }
    return s;
  }

  function imageUrl(opts, i) {
    var len = opts.numFrames.toString().length;
    return opts.baseUrl + pad(i, len) + '.jpg';
  }

  function loadImage(url) {
    var d = $.Deferred();
    var tmp = new Image();
    tmp.onload = function() {
      d.resolve();
    };
    tmp.src = url;
    return d;
  }

  function loadImages($el) {
    var d = $.Deferred();
    var o = opts($el);

    // Set the loading message
    var $loader = $el.find('.filmstrip-loader');
    if (!$loader.length) {
      $loader = $('<span class="filmstrip-loader">Loading...</span>');
      $el.append($loader);
    }
    $loader.show();

    // Load images asynchronously
    var promises = [];
    var len = o.numFrames.toString().length;
    for (var i = 0; i < o.numFrames; i++) {
      var url = imageUrl(o, i + 1);
      promises.push(loadImage(url));
    }

    $.when
      .apply($, promises)
      .done(function() {
        // Set the image and remove loader
        var $img = $('<img/>');
        $img.attr('src', imageUrl(o, o.frame));
        $el.html('').append($img);
        $loader.remove();

        // Add cover to handle drag events
        var $cover = $('<div/>');
        $el.append($cover);

        opts($el, {
          img: $img,
        });

        // Hook drag events
        $cover.on('mousedown touchstart', function(e) {
          var x = e.clientX || e.originalEvent.touches[0].clientX;
          startDrag($el, x);
        });
        $cover.on('mousemove', function(e) {
          if (e.buttons) {
            onDrag($el, e.clientX);
          }
        });
        $cover.on('touchmove', function(e) {
          onDrag($el, e.originalEvent.touches[0].clientX);
        });
        $cover.on('mouseleave mouseup touchend', function() {
          stopDrag($el);
        });

        fireEvent($el, 'onLoad');

        d.resolve($el, o);

        setTimeout(function() {
          $cover.animate({ opacity: 0 }, 1000);
        }, 100);
      })
      .fail(function() {
        d.reject();
        console.log('Failed to load images');
      });

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
      var newOpts = $.extend({}, oldOpts, opts);
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
      baseUrl: '',
      frame: 1,
      numFrames: 1,
      speed: 50,
    };
    var o = $.extend({}, defaultOptions, $el.data('filmstrip'), options);
    opts($el, o);

    $el.addClass('filmstrip');

    // Conditionally auto-play
    if (o.autoLoad) {
      loadImages($el).then(function() {
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
