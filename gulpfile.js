const COMPRESSION = 50; // JPG compression percentage
const OPTIMIZATION = 6; // Image optimization level (1-7)
const USE_COLUMNS = true; // Arrange images into 20 columns

const gulp = require('gulp');
const spritesmith = require('gulp.spritesmith-multi');
const imagemin = require('gulp-imagemin');
const layout = require('layout');

layout.addAlgorithm('20-per-row', require('./20-per-row.js'));

gulp.task('sprite', () => {
  return gulp
    .src('img/**/*.jpg')
    .pipe(
      spritesmith({
        spritesmith: (opts) => {
          const config = {
            algorithm: '20-per-row',
            algorithmOpts: { sort: false },
            cssName: opts.cssName,
            imgName: opts.imgName.replace('.png', '.jpg'),
            imgOpts: { format: 'jpg', quality: COMPRESSION },
          };
          if (USE_COLUMNS) {
            Object.assign(config, {
              algorithm: '20-per-row',
              algorithmOpts: { sort: false },
            });
          }
          return config;
        },
      }),
    )
    .on('error', console.log)
    .pipe(gulp.dest('build'));
});

gulp.task('optimize', ['sprite'], () => {
  return gulp
    .src('build/*.jpg')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: OPTIMIZATION }),
      ]),
    )
    .on('error', console.log)
    .pipe(gulp.dest('final'));
});

gulp.task('default', ['sprite', 'optimize']);
