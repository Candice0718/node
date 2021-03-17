今天我们来聊聊跨域的事情，那我们先从浏览器的报错开始吧！

![跨域报错](/Users/candice/Downloads/跨域资源包/跨域报错.png)

见到这个报错信息，那么就要恭喜你，遇到了跨域这个磨人的小妖精了。

关于[这篇文章的代码](https://github.com/Candice0718/node)，需要的自取。

## 什么是跨域？

那么说到跨域，我们就需要先搞懂什么是同源策略？

**同源策略**是一个重要的安全策略，它用于限制一个[origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin)的文档或者它加载的脚本如何能与另一个源的资源进行交互。它能帮助阻隔恶意文档，减少可能被攻击的媒介。

所谓"同源"指的是“三个相同”。

> 1. 协议相同
> 2. 域名相同
> 3. 端口相同

当**协议**、**域名**、**端口**中任意一个不相同时，都算作**跨域**。需注意即使两个不同的域名指向同一个IP地址，也是跨域。

**同源策略的限制：**

> 1. Cookie、LocalStorage、IndexedDB等本地存储内容
> 2. DOM节点
> 3. AJAX请求发送后，结果被浏览器拦截

**以下是可以嵌入跨源资源的一些示例：**

> 1. `<script src="..."></script>`标签嵌入跨域脚本
> 2. `<link rel="stylesheet" href="..."></link>`标签嵌入CSS
> 3. 通过`<img>`展示图片
> 4. 通过`<video>`和`<audio>`播放的多媒体资源
> 5. 通过`<object>`、`<embed>`、`<applet>`嵌入的插件
> 6. 通过`@fant-face`引入的字体。
> 7. 通过`<iframe>`载入的任何资源

## 怎么解决跨域？

为了模拟跨域，我用node搭建两个服务server1、server2。server1为3000端口为页面服务器，server2为4000端口为接口服务器。分别用**nodemon**启动两个服务。

Server1的代码如下：

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');
const server = http.createServer((request, response) => {
    const { url, method } = request;
    console.log(url);
    if(url === '/' && method === 'GET') {
        const file = path.resolve(__dirname, "../client/index.html");
        fs.readFile(file, (err, data) => {
            if(err) {
                response.writeHead(500, { 'Content-Type': 'text/plain;charset=utf-8' });
                response.end('服务器内部出现问题');
                return;
            } else {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(data);
                return;
            }
        })
    } else if(url === '/favicon.ico') {
        response.end('');
    }else{
        response.writeHead(404, { 'Content-Type': 'text/plain;charset=utf-8' });
        response.end('404 页面没有找到');
        return
    }
})
server.listen('3000', () => {
    console.log('3000服务器已启动。。。')
})
```

server2的代码如下：

```javascript
const http = require('http');
const server = http.createServer((request, response) => {
    const { url, method } = request;
    if(url === '/users/get' && method === 'GET') {
        const result = {
            username: "Candice"
        };
        response.end(JSON.stringify(result));
    }else {
        response.writeHead(500, { 'Content-Type': 'text/plain;charset=utf-8' });
        response.end('服务器内部出现问题');
    }

});
server.listen('4000', () => {
    console.log('4000服务器已经启动...')
});
```

### 1、CORS

**CORS**是一个W3C标准，全称是“跨域资源共享”（cross-origin resource sharing）。它允许浏览器向跨源服务器，发出**XMLHttpRequest**请求，从而克服了AJAX只能同源使用的限制。

CORS需要浏览器和服务器同时支持。目前，所有浏览器都支持该功能，IE浏览器不能低于IE10。

整个CORS通信过程，都是浏览器自动完成，不需要用户参与。因此，实现CORS通信的关键是服务器。只要服务器实现了CORS接口，就可以跨源通信。

浏览器将CORS请求分为两类：简单请求（simple request）和非简单请求（not-so-simple request）。

只要同时满足以下两大条件，就属于简单请求。

1. 请求方法是一下三种方法之一：
   - HEAD
   - GET
   - POST
2. HTTP的头信息不超出以下几种字段：
   - Accept
   - Accept-Language
   - Content-Language
   - Last-Event-ID
   - Content-Type：只限于三个值`application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain`

详细的CORS的讲解，请看阮一峰老师的[跨域资源共享CORS详解](https://www.ruanyifeng.com/blog/2016/04/cors.html)，我这边来模拟一个CORS的场景。

项目的目录结构见下图：

![image-20210316105710226](/Users/candice/Downloads/跨域资源包/CORS目录结构.png)



index.html则是一个简单的GET请求，获取用户信息。代码如下：

```html
<html>
  <head>
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script> 
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
  </head>
  <body>
    <div id="app">
      <div>
        {{user.username}}
      </div>
    </div>  
    <script>
      axios.defaults.baseURL = 'http://localhost:4000';
      var app = new Vue({
        el: '#app',
        data() {
          return  {
            user: {}
          }
        },
        created() {
          this.getUser();
        },
        methods: {
          async getUser() {
            let result = await axios.get('/users/get');
            this.user = result.data;
          }   
        }  
      });
   </script>
  </body>
  </html>
```

当加载页面时，请求“http://127.0.0.1:4000/users/get”接口。页面的访问地址为http://127.0.0.1:3000，毫无疑问这里会报跨域的错误。那下面我们就来看看怎么解决这个问题？

Server2.js在头信息中添加**Access-Control-Allow-Origin**。就可以解决简单请求

```javascript
if(url === '/users/get' && method === 'GET') {
    response.setHeader('Access-Control-Allow-Origin', '*');
    const result = {
      username: "Candice"
    };
    response.end(JSON.stringify(result));
  }
```

再次刷新页面，你就会响应头信息上多了一个"Access-Control-Allow-origin"。接口也可以正常的返回了。

![image-20210316110709056](/Users/candice/Downloads/跨域资源包/成功设置Access-Control-Allow-Origin.png)

那么接下来，/users/get接口设置了Cookie。

```javascript
response.setHeader('Set-Cookie', 'token=qeihuqruhu;');
```

这个地方会有坑，Chrome浏览器默认80+版本把SameSite设置为了Lax，导致没办法跨域写入cookie，也没办法读取，详细讲解请看这个大佬的[博客](https://blog.csdn.net/sinat_36521655/article/details/104844667)。那我们就手动改写一下SameSite。

```javascript
response.setHeader("Set-Cookie", "token=qeihuqruhu; Path=/users/get; SameSite=None; Secure=true");
```

我们现在4000的服务器上看看，能不能获取到？

```javascript
const cookie = request.headers.cookie;
```

不出意外我们将会得到undefined。因为CORS请求默认不发送Cookie和Http认证信息。如果要把Cookie发到服务器，一方面要服务器同意，指定`Access-Control-Allow-Credentials`字段。

```javascript
response.setHeader('Access-Control-Allow-Credentials', true);
```

另一方面，开发者必须在AJAX请求中打开`withCredentials`属性。

```javascript
axios.defaults.withCredentials = true;
```

都设置好了，你会看到这样的报错。

![携带cookie报错](/Users/candice/Downloads/跨域资源包/携带cookie报错.png)

这个时候不要怀疑自己，你设置的都是对的。是因为我们上面Access-Control-Allow-origin不能设置为星号，必须指定明确的、与请求网页一致的域名。

```javascript
response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
```

设置完之后，你就会发现错误不见了。

我们给GET请求添加一个头信息，看看又会发生什么？

```javascript
async getUser() {
  let result = await axios.get('/users/get', {
    headers: { // 触发了预检请求
      'X-Token': 'jilei'
    }
  });
  this.user = result.data;
} 
```

![image-20210315185327492](/Users/candice/Downloads/跨域资源包/预检.png)

在Header中添加‘X-Token’那么该请求就是一个非简单请求。会在正式通信之前，增加一次HTTP查询请求，称为“预检”请求（preflight）。“预检”请求用的请求方法是`OPTIONS`,表示这个请求是用来询问的。那么需要通过`Access-Control-Allow-Headers`允许X-Token这个头信息。

```javascript
if(method == 'OPTIONS' && url == '/users/get') {
  response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Headers', 'X-Token');
  response.end();
}
```

好了说到这里，整个CORS解决跨域就完美结束了！

### 2、JSONP

**Jsonp**(JSON with Padding) 是 json 的一种"使用模式"，可以让网页利用`<script>`等上文提及的允许跨域的标签从别的域名（网站）那获取资料，即跨域读取数据。JSONP只支持`GET`请求。

**JSONP的工作流程：**

> 1. 请求前：创建一个script标签，并给src赋值 url+callback的方法名，并在window上注册这个方法
> 2. 发送请求： 将script添加到页面中
> 3. 数据响应：服务器将返回的数据作为参数和函数名拼接在一起 jsonpCbk({data:”data”})。当浏览器接收到响应数据，由于发起请求的是script，所以相当于直接调用jsonpCbk方法，并且给回调传入了一个参数。

项目的目录结构如下图：

![image-20210316140548576](/Users/candice/Downloads/跨域资源包/JSONP目录结构.png)

index.html还是一个简单的GET请求，用来获取用户信息。代码如下：

```html
<html>
  <head>
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script> 
  </head>
  <body>
    <div id="app">
      <div>
        {{user.username}}
      </div>
    </div>  
    <script>
      /**
       * 封装jsonp方法
       **/
      function jsonp(url, callback) {
        return new Promise((resolve, reject) => {
          // 创建一个script标签
          let script = document.createElement('script');
          // 将callback方法注册到window上
          window[callback] = function(data) {
            resolve(data);
            // 移除script，防止造成垃圾节点
            document.body.removeChild(script);
          }
          // 将url+callback赋值给src
          script.src = `${url}?callback=${callback}`;
          // 挂载script
          document.body.appendChild(script);
        })
      }
      var app = new Vue({
        el: '#app',
        data() {
          return  {
            user: {}
          }
        },
        created() {
          this.getUser();
        },
        methods: {
          async getUser() {
            let url = "http://127.0.0.1:4000/users/get"
            jsonp(url, 'getUser').then(data=> {
              this.user = data;
            })
          }   
        }  
      });
   </script>
  </body>
  </html>
```

JSONP需要服务端一起配合的，需要将返回的结果作为实参，传回给callback。server2，4000服务器的改造代码如下：

```javascript
const http = require('http');
const Url = require('url');
const server = http.createServer((request, response) => {
    const { url, method } = request;
    const { pathname, query } = Url.parse(url, true);
    if(pathname === '/users/get' && method === 'GET') {
        const result = {
            username: "Candice"
        };
        response.end(query.callback + '(' + JSON.stringify(result) + ')');
    }else {
        response.writeHead(500, { 'Content-Type': 'text/plain;charset=utf-8' });
        response.end('服务器内部出现问题');
    }

});
server.listen('4000', () => {
    console.log('4000服务器已经启动...')
});
```

这个时候再看看接口，是不是成功返回啦！

![image-20210316145402921](/Users/candice/Downloads/跨域资源包/JSONP成功.png)



### 3、iframe

#### 1.iframe+window.name

就是利用了window.name有一个奇妙的性质，页面如果设置了`window.name`，那么在不关闭页面的情况下，在不同页面（甚至不同域名）加载window.name还是会保留。

需求：

3000端口的a.html需要显示4000端口b.html的数据。

**iframe+window.name的跨域的流程：**

> 1. 创建iframe - 在a.html页面中嵌入一个iframe，src指向b.html，并且通过css将iframe移除可视区域
> 2. b.html将需要共享的值赋值给window.name
> 3. b.html载入后，将iframe的src指向中转空页面
> 4. 在a.html页面读取contentWindow.name

项目的目录结构如下：

![image-20210316190917233](/Users/candice/Downloads/跨域资源包/windowName目录.png)

a.html嵌入b.页面的iframe。

```html
<html>
    <head>
    </head>
    <body>
      <!-- 嵌入iframe，并且在页面隐藏 -->
      <iframe id="newframe" 
        src="http://127.0.0.1:4000" 
        name="postframe"
        style="position: absolute; left: -9999px; top: 0; width: 0; height: 0;" >
    </iframe>
      <div id="app">
      </div>  
      <script>
        let first = true;
        let frame = document.getElementById('newframe');
        frame.addEventListener('load', () => {
            // 第一次加载iframe
            if(first){
                frame.src = "http://127.0.0.1:3000/empty";
                first = false
            } else {
                // 第二次加载iframe；
                let user = frame.contentWindow.name;
                document.getElementById('app').innerText = user;
            }
        })
     </script>
    </body>
    </html>
```

empty.html只是一个中转页面，为了绕过跨域的错误，所以页面就是一个空白页面

```html
<html></html>
```

b.html调用/user/get接口，并将接口返回的数据赋值给window.name

```html
<html>
    <head>
        <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    </head>
    <body>
        <script>
            axios.defaults.baseURL = 'http://127.0.0.1:4000';
            axios.defaults.withCredentials = true;
            axios.get('/users/get').then((result) => {
                window.name = JSON.stringify(result.data);
            });
        </script>
    </body>
</html>
```

Server1服务器添加一个/empty路径，用来访问empty.html

```javascript
if (url === '/empty' && method === 'GET') {
  const file = path.resolve(__dirname, "../client/empty.html");
  fs.readFile(file, (err, data) => {
    if(err) {
      response.writeHead(500, { 'Content-Type': 'text/plain;charset=utf-8' });
      response.end('服务器内部出现问题');
      return;
    } else { 
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(data);
      return;
    }
  })
}
```

server2服务器添加访问b.html的路径。

```javascript
if(url === '/' && method === 'GET') {
  const file = path.resolve(__dirname, "../client/b.html");
  fs.readFile(file, (err, data) => {
    if(err) {
      response.writeHead(500, { 'Content-Type': 'text/plain;charset=utf-8' });
      response.end('服务器内部出现问题');
      return;
    } else { 
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(data);
      return;
    }
  })
}
```

然后用nodemon分别启动3000，4000服务器，访问http://127.0.0.1:3000,你就会看见http://127.0.0.1:4000/user/get接口数据被打印到了页面上，又一次成功的实现了跨域。

#### 2. document.domian + iframe

该方式只能用于二级域名相同的情况下,将两个页面都通过js设置document.domain为相同的主域，来实现同域，就可以实现跨域了。因为我这边没有域名，这个例子我就不实现。

#### 3. location.hash + iframe

> 该方案跟window.name类似，就是将要获取的值绑在hash上来实现跨域。

需求：

3000端口的a.html需要显示4000端口b.html的数据。

iframe+location.hash的跨域流程：

> 1. 在a.html中嵌入一个iframe，src指向b.html并将携带一个hash值，并将iframe隐藏。
> 2. 在b.html中嵌入一个iframe，src指向a.html同源的empty.html并将值作为hash
> 3. empty.html中将获取到的hash赋值给a.html页面

项目的目录结构如下：

![image-20210316192641559](/Users/candice/Downloads/跨域资源包/iframe+hash目录.png)

3000和4000服务器的代码和window.name+iframe一模一样，我这边就不赘述了，想看全部源码到上文的github里下载。

a.html嵌入iframe，并监听hash的改变。

```html
<html>
    <head>
    </head>
    <body>
      <!-- 嵌入iframe，并且在页面隐藏 -->
      <iframe id="newframe" 
        src="http://127.0.0.1:4000#user" 
        name="postframe"
        style="position: absolute; left: -9999px; top: 0; width: 0; height: 0;" >
      </iframe>
      <div id="app">
      </div>  
      <script>
        window.onhashchange = function(){
          document.getElementById('app').innerText = location.hash;
	      }
     </script>
    </body>
    </html>
```

empty.html为a.html的同源页面，目的是将b.html传入的hash值赋值给a.html的hash。

```html
<html>
    <script type="text/javascript">
        // window.parent为b.html
        // window.parent.parent为a.html
        window.parent.parent.location.hash = location.hash;
    </script>
</html>
```

b.html则负责请求数据并将结果值作为hash传给empty.html

```html
<html>
    <head>
        <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    </head>
    <body>
        <script>
            axios.defaults.baseURL = 'http://127.0.0.1:4000';
            axios.defaults.withCredentials = true;
            axios.get('/users/get').then((result) => {
                let iframe = document.createElement("iframe");
	            iframe.src = 'http://127.0.0.1:3000/empty#'+result.data.username;
	            document.body.appendChild(iframe);
            });
        </script>
    </body>
</html>
```

#### 4. postMessage+iframe

postMessage()方法允许来自不同源的脚本采用异步方式进行有限的通信，可以实现跨文本档、多窗口、跨域消息传递。



> [targetWindow.postMessage(message, targetOrigin, [transfer]);](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
>
> 当使用postMessage传递数据的时候，目标源可以使用message方法来接受传递过来的数据

需求：

3000端口的a.html与4000端口的b.html进行通信。

iframe+postMessage的跨域流程：

> 1. 创建a.html嵌入iframe，src指向b.html，并将iframe隐藏。
> 2. b.html载入后通过iframe.contentWindow.postMessage()进行通信。
> 3. a.html通过onMessage监听数据

项目的目录结构如下：

![image-20210317105154361](/Users/candice/Downloads/跨域资源包/postMessage目录结构.png)

3000和4000的服务器只是简单的GET请求，分别返回两个页面，想看源码的自行下载代码。

a.html嵌入iframe，并与b.html发送hello

```html
<html>
  <head>
  </head>
  <body>
    <!-- 嵌入iframe，并且在页面隐藏 -->
    <iframe id="newframe" 
            src="http://127.0.0.1:4000" 
            name="postframe"
            style="position: absolute; left: -9999px; top: 0; width: 0; height: 0;" >
    </iframe>
    <div id="app">
    </div>  
    <script>
      let frame = document.getElementById('newframe');
      frame.addEventListener('load', () => {
        // 通过frame与b.html进行通信
        frame.contentWindow.postMessage('hello', 'http://127.0.0.1:4000');
      })
      // 监听发送的信息
      window.addEventListener('message', (event) => {
        document.getElementById('app').innerText = event.data;
      })
    </script>
  </body>
</html>
```

b.html接受a.html的消息并作出回应。

```html
<html>
  <body>
    <script>
      window.addEventListener('message', (event) => {
        // 向parent发送信息
        event.source.postMessage(`${event.data}, Candice`, 'http://127.0.0.1:3000');
      })
    </script>
  </body>
</html>
```



### 4、WebSocket

Websocket是HTML5的一个持久化的协议，它实现了浏览器与服务器的全双工通信，因为它本身不存在跨域问题，所以我们可以利用webSocket的API来解决跨域的问题。

Websocket是高级API，可能使用起来不方便，[socket.io](https://socket.io/)很好的封装了WebSocket，我们来实现一下。

WebSocket的流程

> 1. 3000服务器上创建一个客户端页面index.html，该页面创建一个socket实例用来和4000服务器通信
> 2. 4000服务器上也创建一个socket实例

项目的目录结构如下：

![image-20210316201425433](/Users/candice/Downloads/跨域资源包/websocket目录.png)

因为服务端也要实例化一个socket，所以需要安装一个socket.io

```shell
npm init
npm install --save socket.io
```

Index.html是一个3000端口的客户端。

```html
<html>
  <head>
  </head>
  <body>
    <div id="app"></div>
    <button onclick="sumbit()">hello</button>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.1.3/socket.io.min.js"> </script>
    <script src="http://libs.baidu.com/jquery/2.1.1/jquery.min.js"></script>
    <script>
      // 与http://127.0.0.1:4000服务器建立连接，通信
      var socket = io("http://127.0.0.1:4000"); 
      $(function() {
        // 监听message，并将信息显示到页面上
        socket.on("message", function(msg) { 
            $("#app").text(msg);
        }); 
        
      });
    function sumbit() {
      // 发送hello
      socket.emit("hello", "hello"); 
    } 
    </script>
  </body>
  </html>
```

Server2是4000端口的服务器，实例化一个socket并且允许与3000共享资源

```javascript
const server = require("http").createServer();
const io = require("socket.io")(server, {
    cors: { // 设置可以可以共享的源
        origin: "http://127.0.0.1:3000",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
  console.log("connection!!!!")
  socket.on('hello', (msg) => {
    io.emit('message', `${msg}, Candice`);
  })
});
server.listen('4000', () => {
    console.log('4000服务器已经启动...')
});
```

### 5、代理服务器

代理服务器指的是请求同源服务器，通过该服务器转发请求至目标服务器，得到结果再转发给前端。

项目的目录结构如下：

![image-20210317132006020](/Users/candice/Downloads/跨域资源包/代理服务器目录.png)

index.html发送/user/get请求同源服务器。

```html
<html>
  <head>
  </head>
  <body>
    <div id="app">
    </div>  
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script>
      axios.defaults.baseURL = 'http://127.0.0.1:3000';
      axios.defaults.withCredentials = true;
      axios.get('/users/get').then((result) => {
        document.getElementById('app').innerText = result.data.username;
      });
    </script>
  </body>
</html>
```

server1定义一个/user/get接口，该接口调用server2的/user/get接口，并将请求到的数据返回前端。

```javascript
if (url === '/users/get' && method === 'GET') {
  http.get('http://127.0.0.1:4000/users/get', (res) => {
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        response.end(rawData);
      } catch (e) {
        console.error(e.message);
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });
}
```

server2 定义一个/user/get并返回数据。

```javascript
if (url === '/users/get' && method === 'GET') {
  const result = {
    username: "Candice"
  };
  response.end(JSON.stringify(result));
}
```



### 6、nginx

后续会有一篇文章专门讲实战nginx，这里就先买个关子，等后面文章写好了，再来更新这块的内容。



## 跨域拓展

从上面的解决跨域的方法可以看出要解决跨域，都是需要服务端解决的，我们前端无能为力。

那么等别人解决就有一定的滞后性，我们又急着联调接口，那我们只能曲线救国了。下面分享几个前端开发阶段用的方法。

#### chrome浏览器的跨域设置

window系统：[Chrome版本49前后两种设置](https://www.cnblogs.com/laden666666/p/5544572.html)

mac系统：[Mac上解决Chrome浏览器跨域问题](https://www.jianshu.com/p/2db73311fcbe/)

#### webpack devserver

```javascript
module.exports = { 
  devServer: {
    port: 3000, // 设置端口号
    proxy: { // 设置代理服务器
      '/api/': {
        target: 'http://localhost:4000', changeOrigin: true,
      }, 
    },
  }, 
}
```



## 参考文献

[跨域资源共享CORS详解](https://www.ruanyifeng.com/blog/2016/04/cors.html)

[浏览器同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy#%E8%B7%A8%E6%BA%90%E7%BD%91%E7%BB%9C%E8%AE%BF%E9%97%AE)

[window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

[Origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin)

[浏览器同源政策及其规避方法](http://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html)

[九种跨域方式实现原理](https://juejin.cn/post/6844903767226351623#heading-16)

