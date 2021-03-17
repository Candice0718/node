const http = require('http');
const fs = require('fs');
const path = require('path');
const server = http.createServer((request, response) => {
    const { url, method } = request;
    if (url === '/users/get' && method === 'GET') {
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