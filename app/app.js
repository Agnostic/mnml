var app = new MNML();

app.route([
  { path: '/', template: '/mnml/partials/home.html' },
  { path: '/routing', template: '/mnml/partials/routing.html', controller: 'routing' },
  { path: '/databinding', template: '/mnml/partials/databinding.html' },
  { path: '/templates', template: '/mnml/partials/templates.html', controller: 'templates' }
]);

app.appController(function(data){
  console.log('Pre-controller', data);
});

app.controller('home', function(){
  app.fireEvent('setPage', 'home');
});

app.controller('nav', function(){
  var self  = this;
  self.page = 'home';
  self.valor = 1;

  app.addEvent('setPage', function(page){
    console.log('page', page);
    self.page = page;
  });
});

app.controller('routing', function(){
  app.fireEvent('setPage', 'routing');
});

app.controller('databinding', function($name){
  var self      = this;
  this.name     = $name || 'World';
  this.boolean  = true;
  this.radio    = 2;
  this.select   = 2;
  this.textarea = "Hello Textarea";

  watch(self, function(){
    console.log('Watch', self.name);
  });

  app.fireEvent('setPage', 'databinding');
});

app.controller('include_controller', function(){

});

app.controller('templates', function(){
  app.fireEvent('setPage', 'templates');
  console.log('templates controller!');
});