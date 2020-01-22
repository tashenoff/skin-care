var gulp = require("gulp"), // Подключаем Gulp
  scss = require("gulp-scss"), //Подключаем scss пакет,
  browserSync = require("browser-sync"), // Подключаем Browser Sync
  concat = require("gulp-concat"), // Подключаем gulp-concat (для конкатенации файлов)
  uglify = require("gulp-uglifyjs"), // Подключаем gulp-uglifyjs (для сжатия JS)
  cssnano = require("gulp-cssnano"), // Подключаем пакет для минификации CSS
  rename = require("gulp-rename"), // Подключаем библиотеку для переименования файлов
  del = require("del"), // Подключаем библиотеку для удаления файлов и папок
  imagemin = require("gulp-imagemin"), // Подключаем библиотеку для работы с изображениями
  pngquant = require("imagemin-pngquant"), // Подключаем библиотеку для работы с png
  cache = require("gulp-cache"), // Подключаем библиотеку кеширования
  autoprefixer = require("gulp-autoprefixer"), // Подключаем библиотеку для автоматического добавления префиксов
  nunjucksRender = require("gulp-nunjucks-render");

gulp.task("nunjucks", function() {
  // Gets .html and .nunjucks files in pages
  return (
    gulp
      .src("app/pages/**/*.+(html|nunjucks)")
      // Renders template with nunjucks
      .pipe(
        nunjucksRender({
          path: ["app/templates"]
        })
      )
      // output files in app folder
      .pipe(gulp.dest("app"))
      .pipe(browserSync.reload({ stream: true }))
  );
});

gulp.task("scss", function() {
  // Создаем таск scss
  return gulp

    .src("app/scss/main.scss") // Выбираем файл для минификации
    .pipe(scss()) // Преобразуем scss в CSS посредством gulp-scss

    .pipe(
      autoprefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {
        cascade: true
      })
    ) // Создаем префиксы

    .pipe(cssnano()) // Сжимаем
    .pipe(rename({ suffix: ".min" })) // Добавляем суффикс .min

    .pipe(gulp.dest("app/css")) // Выгружаем результата в папку app/css
    .pipe(browserSync.reload({ stream: true })); // Обновляем CSS на странице при изменении
});

gulp.task("browser-sync", function() {
  // Создаем таск browser-sync
  browserSync({
    // Выполняем browserSync
    server: {
      // Определяем параметры сервера
      baseDir: "app" // Директория для сервера - app
    },
    notify: false // Отключаем уведомления
  });
});

gulp.task("scripts", function() {
  return gulp
    .src([
      // Берем все необходимые библиотеки
      "app/libs/jquery/dist/jquery.min.js", // Берем jQuery
      "app/libs/magnific-popup/dist/jquery.magnific-popup.min.js" // Берем Magnific Popup
    ])
    .pipe(concat("libs.min.js")) // Собираем их в кучу в новом файле libs.min.js
    .pipe(uglify()) // Сжимаем JS файл
    .pipe(gulp.dest("app/js")); // Выгружаем в папку app/js
});

gulp.task("code", function() {
  return gulp.src("app/*.html").pipe(browserSync.reload({ stream: true }));
});

gulp.task("clean", async function() {
  return del.sync("dist"); // Удаляем папку dist перед сборкой
});

gulp.task("img", function() {
  return gulp
    .src("app/img/**/*") // Берем все изображения из app
    .pipe(
      cache(
        imagemin({
          // С кешированием
          // .pipe(imagemin({ // Сжимаем изображения без кеширования
          interlaced: true,
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          use: [pngquant()]
        })
      ) /**/
    )
    .pipe(gulp.dest("dist/img")); // Выгружаем на продакшен
});

gulp.task("prebuild", async function() {
  var buildCss = gulp
    .src([
      // Переносим библиотеки в продакшен

      "app/css/*.min.css"
    ])
    .pipe(gulp.dest("dist/css"));

  var buildFonts = gulp
    .src("app/fonts/**/*") // Переносим шрифты в продакшен
    .pipe(gulp.dest("dist/fonts"));

  var buildJs = gulp
    .src("app/js/**/*") // Переносим скрипты в продакшен
    .pipe(gulp.dest("dist/js"));

  var buildHtml = gulp
    .src("app/*.html") // Переносим HTML в продакшен
    .pipe(gulp.dest("dist"));
});

gulp.task("clear", function(callback) {
  return cache.clearAll();
});

gulp.task("watch", function() {
  gulp.watch("app/scss/**/*.scss", gulp.parallel("scss")); // Наблюдение за scss файлами
  gulp.watch("app/*.html", gulp.parallel("code")); // Наблюдение за HTML файлами в корне проекта
  gulp.watch("app/**/*.njk", gulp.parallel("code")); // Наблюдение за HTML файлами в корне проекта
  gulp.watch(
    ["app/js/common.js", "app/libs/**/*.js"],
    gulp.parallel("scripts")
  ); // Наблюдение за главным JS файлом и за библиотеками
});
gulp.task(
  "default",
  gulp.parallel("nunjucks", "scss", "scripts", "browser-sync", "watch")
);
gulp.task(
  "build",
  gulp.parallel("prebuild", "clean", "img", "scss", "scripts")
);
