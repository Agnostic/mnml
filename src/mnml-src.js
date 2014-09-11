/*! ============================================================
 *
 *                           M N M L
 *                   - JavaScript Framework -
 *
 * Author:
 * Gilberto Avalos Osuna - avalosagnostic@gmail.com
 *
 * Project site:
 * https://github.com/Agnostic/mnml
 *
 * ============================================================= */

(function(root){

  String.prototype.trim = function() {
    return this.replace(/^\s+/g,'').replace(/\s+$/g,'');
  };

  var ArrayProto    = Array.prototype,
  nativeForEach     = ArrayProto.forEach,
  breaker           = {},
  loadedRoute       = false,
  controllersQueue  = [],
  firePreController = false,
  basePath          = '';

  root.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

  function decode(string){
    string = string.replace(/%([EF][0-9A-F])%([89AB][0-9A-F])%([89AB][0-9A-F])/g,
      function(code,hex1,hex2,hex3){
        var n1= parseInt(hex1,16)-0xE0;
        var n2= parseInt(hex2,16)-0x80;
        if (n1 == 0 && n2 < 32) return code;
        var n3= parseInt(hex3,16)-0x80;
        var n= (n1<<12) + (n2<<6) + n3;
        if (n > 0xFFFF) return code;
        return String.fromCharCode(n);
      }
    );

    string = string.replace(/%([CD][0-9A-F])%([89AB][0-9A-F])/g,
      function(code,hex1,hex2) {
        var n1= parseInt(hex1,16)-0xC0;
        if (n1 < 2) return code;
        var n2= parseInt(hex2,16)-0x80;
        return String.fromCharCode((n1<<6)+n2);
      }
    );

    string = string.replace(/%([0-7][0-9A-F])/g,
      function(code,hex){
        return String.fromCharCode(parseInt(hex,16));
      }
    );

    return string;
  }

  function loadTemplate(path, elm){
    if(!elm){ throw "loadTemplate failed: DOM Element not found"; return };
    if(!path){ throw "loadTemplate failed: Path not found"; return };

    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.onload = function(){
      var template = this.responseText;

      template = template.replace( new RegExp( "\{\{\s*(.*)\s*\}\}", "gi" ), '<span model="$1"></span>' );
      template = template.replace(/'\s*/g, "'").replace(/"\s*/g, '"').replace(/\s*"/g, '"').replace(/\s*'/g, "'");
      elm.innerHTML = template;
    };
    xhr.send();
  }

  function Constructor(constructor, args) {
    var factoryFunction = constructor.bind.apply(constructor, args);
    return new factoryFunction();
  }

  function parseModels(models, controller, args){
    forEach(models, function(item){
      var model = item.getAttribute('model');

      if( item.tagName !== 'INPUT' && item.tagName !== 'SELECT' ){
        if(controller[model] !== item.innerHTML){
          item.innerHTML = controller[model] || '';
        }
      } else if( item.tagName === 'INPUT' ) {
        if( item.type.toUpperCase() === 'TEXT' ) {
          if(item.value != controller[model]){
            item.value = controller[model] || '';
          }
        } else if ( item.type.toUpperCase() === 'CHECKBOX' ){
          item.checked = controller[model] ? true : false;
        } else if ( item.type.toUpperCase() === 'RADIO' ) {
          item.checked = ( item.value == controller[model] ) ? true : false;
        }
      } else if ( item.tagName === 'TEXTAREA' || item.tagName === 'SELECT' ) {
        if(controller[model] != item.value){
          item.value = controller[model] || '';
        }
      }

      if ( !item.onkeypress && ( item.tagName === 'TEXTAREA' || item.tagName === 'INPUT' ) ) {
        item.onkeyup = function(e){
          controller[model] = item.value;
          parseDOMController.call(null, args);
        };

        if ( !item.onchange ){
          item.onchange = function(){
            controller[model] = item.value;
            parseDOMController.call(null, args);
          };
        }
      }
    });
  }

  function test(val1, val2){
    if(val2){
      return val1 == val2;
    } else {
      return val1;
    }
  }

  function parseClasses(classes, controller){
    forEach(classes, function(item){
      var conditions = item.getAttribute('if-class').replace('{', '').replace('}', '').trim();
      conditions = conditions.split(',');

      forEach(conditions, function(condition){
        condition = condition.split(':');

        var _class = condition[0].trim();
        _condition = condition[1].trim();

        var val;
        if( _condition.match('=') ) {
          var _condition = _condition.split('=');
          var val1, val2;
          forEach(_condition, function(item){
            item = item.trim();
            if(item !== "" && !val1){
              val1 = item;
              if(val1.match(/\'|\"/g)){
                val1 = val1.replace(/\'|\"/g, '');
              } else {
                val1 = controller[val1];
              }
            } else if ( item !== "" && val1 ){
              val2 = item;
              if(val2.match(/\'|\"/g)){
                val2 = val2.replace(/\'|\"/g, '');
              } else {
                val2 = controller[val2];
              }
            }
          });

          if(test(val1, val2)){
            item.className += ' ' + _class;
          } else {
            item.className = item.className.replace(_class, '');
          }
        } else {
          if( test(controller[_condition]) ){
            item.className += ' ' + _class;
          } else {
            item.className = item.className.replace(_class, '');
          }
        }

      });
    });
  }

  function parseDOMController(name, controller){
    var models = document.querySelectorAll("[controller='"+name+"'] [model]"),
    classes    = document.querySelectorAll("[controller='"+name+"'] [if-class]");

    parseModels(models, controller, arguments);
    parseClasses(classes, controller);
  }

  function bindLinks(element){
    var links = element.querySelectorAll('a');
    if( links.length ){
      forEach(links, function(link){
        var href = link.getAttribute('href');
        if( href !== '#' ){
          link.onclick = function(e){
            if (basePath) {
              href = href.replace(basePath, '/');
              href = basePath + href;
              href = href.replace('//', '/');
            }
            History.pushState({ url: href }, document.title, href );
            e.preventDefault();
          };
        }
      });
    }
  }

  function preController(controller){
    if(controller && typeof controller === 'function'){
      var data = {
        url: History.getState().data.url,
        controller: route.controller,
        params: params
      };
      self.__appController(data);
    }
    firePreController = false;
  }

  var M = function(){
    var self          = this;
    self.controllers  = {};
    self.events       = {};
    self.routes       = [];
    self.init         = false;
    self.currentRoute = {};

    if (location.pathname !== '/') {
      basePath = location.pathname;
    }

    var body = document.getElementsByTagName('body')[0];

    // Bind links for router
    bindLinks(body);

    // Add statechange listener for routes
    History.Adapter.bind(root,'statechange', function(e){
      self.checkRoutes();
    });

    // Listen for new elements
    root.document.addEventListener('DOMNodeInserted', function(e){
      var element = e.srcElement;
      self.parseElement(element);
    }, false);
  };

  M.prototype.addEvent = function(event, fn){
    var self = this;
    if(! self.events[event] ){
      self.events[event] = [];
    }
    self.events[event].push({ context: self, callback: fn });
  };

  M.prototype.fireEvent = function(event){
    var self = this;

    if ( !self.events[event] ){
      return false;
    }

    for( var i = 0; i < self.events[event].length; i++ ){
      var ev = self.events[event][i],
      args   = Array.prototype.slice.call( arguments, 1 );
      ev.callback.apply( ev.context, args );
    }
  };

  M.prototype.removeEvent = function(event){
    if(this.events[event]){
      delete this.events[event];
    }
  };

  M.prototype.find = function(selector, parent){
    if(parent){
      selector = parent + ' ' + selector;
    }
    return document.querySelectorAll(selector);
  };

  M.prototype.parseElement = function(element){
    var self = this;

    if( element.querySelectorAll ){
      bindLinks(element);
    }

    if(element.getAttribute){

      var controller = element.getAttribute('controller');
      if(controller && self.controllers[controller]){
        self.initController(controller, true);
      }
    }

    if( element.querySelectorAll ){
      var includes = element.querySelectorAll('[include]');
      if( includes.length ){
        forEach(includes, function(include){
          var path = include.getAttribute('include');
          loadTemplate(path, include);
        });
      }
    }
  };

  M.prototype.initController = function(controller, parseDOM){
    var self = this,
    fn       = self.controllers[controller];

    if(!loadedRoute){
      controllersQueue.push({ controller: controller, parseDOM: parseDOM });
      firePreController = true;
    } else {

      if( firePreController ){
        preController(self.__preController);
      }

      if(controllersQueue.length){
        forEach(controllersQueue, function(controller){
          self.initController(controller.controller, controller.parseDOM);
        });
      }

      if(fn){
        fn = Constructor(fn, self.currentRoute.params);

        if(parseDOM){
          parseDOMController(controller, fn);
        }
        watch(fn, function(){
          parseDOMController(controller, fn);
        });

        self.controllers[controller].initialized = true;
      }
    }
  };

  M.prototype.checkRoutes = function(){
    var self = this;

    for(var i = 0; i < self.routes.length; i++){
      var route = self.routes[i];
      if(self.currentRoute.path !== route.path){
        var namedParam = /:\w+/g,
        splatParam     = /\*\w+/g,
        path           = route.path.replace(namedParam, '([^\/]+)').replace(splatParam, '(.*?)');

        var exp        = "^" + path + "$";
        var regex      = new RegExp(exp);

        var url = History.getState().data.url || History.getState().hash, url2;

        if( url[url.length-1] === '/' ){
          url2 = url;
          url2 = url2.replace(/\/$/, '');
        } else {
          url2 = url;
          url2 += '/';
        }

        if (basePath) {
          url = url.replace(basePath, '/');
        }

        if( regex.test(url) || regex.test(url2) && route.template){
          var params  = regex.exec(url) || [];
          temp_params = [];

          params.forEach(function(item){
            if( item !== undefined && temp_params.indexOf(item) < 0 ){
              item = decode(item.replace('/', ''));
              temp_params.push(item);
            }
          });

          route.params = (params[0] !== undefined) ? temp_params : [];

          view = document.getElementsByTagName('view')[0];

          if(view){
            loadTemplate(route.template, view);
          }

          if(firePreController && self.__appController){
            preController(self.__appController);
          }

          if(route.controller && self.controllers[route.controller]){
            self.initController(route.controller, false);
          }

          self.currentRoute = route;
          loadedRoute       = true;
        }
      }
    }
  };

  M.prototype.route = function(routes){
    var self = this;
    for(var i = 0; i < routes.length; i++){
      var route = routes[i];
      self.routes.push({
        path: route.path,
        template: route.template,
        controller: route.controller
      });
    }
    self.checkRoutes();
  };

  M.navigate = function(path){
    var self = this;
    History.Adapter.pushState({ url: path }, document.title, path);
    self.checkRoutes();
  };

  M.prototype.appController = function(fn){
    this.__appController = fn;
  };

  M.prototype.controller = function(name, fn){
    var self               = this;
    self.controllers[name] = fn;

    var body = document.getElementsByTagName('body')[0];
    var controllers = body.querySelectorAll("[controller='"+name+"']");
    if( controllers.length ){
      forEach(controllers, function(controller){
        self.parseElement(controller);
      });
    }
  };

  M.prototype.ajax = function(data){
    var xhr = new XMLHttpRequest(), formData;

    if( data.type ) {
      var type = data.type.toUpperCase();
      if( type === 'POST' || type === 'PUT' ){
        if( data.form ){
          formData = new FormData(data.form);
        }
      }
      xhr.open(data.type || 'GET', data.url);
    }

    return {

    };
  };

  root.MNML = M;

})(window, undefined);