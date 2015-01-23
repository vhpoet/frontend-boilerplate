No fancy generators, just clone this repo and build your app on top of it.

### Package

- Uses AngularJS, Bower, Gulp, Jade, Sass (with sourcemaps), browserSync. 
- Respects [angularjs-styleguide](https://github.com/johnpapa/angularjs-styleguide).

### Setup

- `$ git clone https://github.com/vhpoet/frontend-boilerplate`
- Find and replace `frontendboilerplate` to `yourappname` in `./`
- `$ npm install`
- `$ npm install -g bower gulp`
- `$ gem install sass`
- `$ gulp`

Access your awesome app in `build/dev`.

### Deployment

Run `$ gulp dist` for the production ready code in `build/dist`.

### TODO

- Add unit tests
- Add user signup/signin service
- Use Angular controllerAs 

### Contributing

I'm open for contributions via pull-requests, and please open an issue for anything you don't like.
