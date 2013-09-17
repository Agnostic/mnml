# _MNML_

_Minimalistic MVC framework for javascript web applications_

## Creating a new application
```html
<html>
  <body>
    <view></view> <!-- Templates will be rendered here -->
    <script src="/app/app.js"></script>
  </body>
</html>
```

app.js
```javascript
var app = new MNML();
```

## Routers
Use app.route to define your router, note that the controllers are optional.
```javascript
app.route([
  { path: '/', template: '/templates/home.html' },
  { path: '/hello/:name', template: '/templates/params.html', controller: 'params' }
]);
```

## Controllers

### Application controller
This controller is fired before any controller.

```javascript
app.appController(function(data){
  console.log('Pre-controller', data);
});
```

### Single controller
```javascript
app.controller('params', function(name){
  this.name = name;
});
```

## Views & Databinding
### Databinding
To assign a property of the controller to a view, use: {{ property }}.

/templates/params.html
```html
<div>
  <h2>Hello {{ name }}!</h2>
  <input type="text" model="name"/>
</div>
```

## Directives
### Controller
You can assign a controller to a div using the controller directive, for example:
```html
<div controller="params">
  Hello {{ name }}!
</div>
```

### Include
The include directive allows to attach a view inside an element, example:
```html
<div include="/templates/example.html"></div>
```
### if-class
This directive receives an object as a parameter, where properties are the classes and the values ​​are the conditions.
```html
<ul class="nav">
  <li if-class="{ active: status, inactive: !status }">Link</li>
</ul>
```
Equivalence in javascript, (So just an example):
```javascript
if (status) {
  li.className = 'active';
}
if (!status) {
  li.className = 'inactive';
}
```

### foreach
```javascript
app.controller('nav', function(){
  this.links = [
    { title: 'Home', href: '/' }
    { title: 'Another page', href: '/page' }
  ];
});
```
```html
<ul class="nav">
  <li foreach="link in links">
    <a href="{{ link.href }}">{{ link.title }}</a>
  </li>
</ul>
```

## Events
MNML has a mediator allowing us to use events in our application.
### addEvent
With addEvent we add our event and assign a callback.
```javascript
app.controller('nav', function(){
  var self  = this;
  self.page = 'home';

  app.addEvent('changePage', function(page){
    self.page = page;
  });
});
```
### fireEvent
With fireEvent we execute our event and we send data as the second parameter.
```javascript
app.controller('about', function(){
  app.fireEvent('changePage', 'about');
});
```
### removeEvent
Use removeEvent to remove an event.
```javascript
app.removeEvent('changePage');
```

## Utilities