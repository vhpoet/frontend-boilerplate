No fancy generators, just clone this repo and build your app on top of it.

### Package

- Uses AngularJS, Gulp, Jade, Sass (with sourcemaps), browserSync. 
- Respects [angularjs-styleguide](https://github.com/johnpapa/angularjs-styleguide).

### Setup

- `$ git clone https://github.com/vhpoet/frontend-boilerplate`
- Find and replace `frontendboilerplate` to `yourappname` in `./`
- `$ npm install`
- `$ npm install -g gulp`
- `$ gem install sass`
- `$ cp config-example.json config.json`
- `$ gulp`

### Deployment

Run `$ gulp dist` for the production ready code in `build`.

### TODO

- Add unit tests
- Add user signup/signin service
- Use Angular controllerAs 
- Add yeoman generator

### Contributing

I'm open for contributions via pull-requests, and please open an issue for anything you don't like.
