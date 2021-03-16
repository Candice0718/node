const http = require('http');
const server = http.createServer((request, response) => {
    const { url, method, headers } = request;
    if(url === '/users/get' && method === 'GET') {
        const cookie = headers.cookie;
        console.log("cookie", cookie);
        // console.log(request);
        response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
        response.setHeader('Access-Control-Allow-Credentials', true);
        response.setHeader("Set-Cookie", "token=qeihuqruhu; Path=/users/get; SameSite=None; Secure=true");
        // response.writeHead(200, { 'Content-Type': 'application/json' });
        const result = {
            username: "Candice"
        };
        response.end(JSON.stringify(result));
    }else if(method == 'OPTIONS' && url == '/users/get') {
        response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
        response.setHeader('Access-Control-Allow-Credentials', true);
        response.setHeader('Access-Control-Allow-Headers', 'X-Token');
        response.end();
    }else {
        response.writeHead(500, { 'Content-Type': 'text/plain;charset=utf-8' });
        response.end('服务器内部出现问题');
    }

});
server.listen('4000', () => {
    console.log('4000服务器已经启动...')
});