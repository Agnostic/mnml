# _MNML_

_Minimalistic MVC framework for javascript web applications_

## Creating Application
```javascript
var app = new MNML();
```

## Routers
```javascript
app.route([
  { path: '/', template: '/templates/home.html' },
  { path: '/routing', template: '/templates/routing.html' },
  { path: '/databinding', template: '/templates/databinding.html' },
  { path: '/templates', template: '/templates/templates.html' }
]);
```

## Controllers
```javascript
app.controller('home', function(){
  console.log( 'Hello controller' );
});
```

## Views

## Directives