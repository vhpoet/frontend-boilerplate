### This branch is the [nw.js](https://github.com/nwjs/nw.js/) version of the [frontend-boilerplate](https://github.com/vhpoet/frontend-boilerplate)

No fancy generators, just clone this repo and build your app on top of it.

### Package

- Uses nw.js, AngularJS, Bower, Gulp, Jade, Sass (with sourcemaps), browserSync. 
- Respects [angularjs-styleguide](https://github.com/johnpapa/angularjs-styleguide).

### Setup

- Setup [nw.js](https://github.com/nwjs/nw.js/).
- `$ git clone https://github.com/vhpoet/frontend-boilerplate`
- `$ git fetch --all; git checkout nodewebkit`
- Find and replace `frontendboilerplate` to `yourappname` in `./`
- `$ npm install`
- `$ npm install -g bower gulp`
- `$ gem install sass`
- `$ cp config-example.json config.json`
- `$ gulp`
- `$ /path/to/nw .`

### Deployment

Run `$ gulp packages` for the production ready packages in `build/packages`.

### Contributing

I'm open for contributions via pull-requests, and please open an issue for anything you don't like.
