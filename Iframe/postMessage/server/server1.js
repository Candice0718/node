const http = require('http');
const fs = require('fs');
const path = require('path');
const server = http.createServer((request, response) => {
    const { url, method, headers} = request;
    console.log(url);
    if(url === '/' && method === 'GET') {
        const file = path.resolve(__dirname, "../client/a.html");
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