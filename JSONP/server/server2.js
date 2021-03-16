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