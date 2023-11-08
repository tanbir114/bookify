// const fs = require('fs');

// const requestHandler = (req, res) => {
//     const url = req.url;
//     const method = req.method;

//     if(url === '/')
//     {
//         res.write('<html>');
//         res.write('<head>');
//         res.write('<titel>Enter Message</title>');
//         res.write('</head>');
//         res.write('<body>');
//         res.write('<form action="/message" method="POST"><input type="text" name="input"><button type="submit">Submit</button></form>');
//         res.write('</body>');
//         res.write('</html>');
//         // console.log('ok');
//         return res.end();
//     }

//     if(url === '/message' && method === 'POST')
//     {
//         const body = [];
//         let reqBody = '';
//         req.on('data', (chunk) => {
//             // console.log(chunk);
//             body.push(chunk);
//             reqBody+=chunk;
//             // console.log('Received data1 :', reqBody);
//         });

//         return req.on('end', () => {
//             const parsedBody = Buffer.concat(body).toString();
//             // console.log(parsedBody);
//             // console.log('Received data:', reqBody);
//             let message = parsedBody.split('=')[1];
//             message = message.replace("+"," ");
//             fs.writeFile('message.txt', message, err => {
//                 res.statusCode = 302;
//                 res.setHeader('Location','/');
//                 return res.end();
//             });       
//         });
//     }
//     res.setHeader('Content-Type', 'text/html');
//     res.write('<html>');
//     res.write('<head>');
//     res.write('<titel>Hello</title>');
//     res.write('</head>');
//     res.write('<body>');
//     res.write('<h1>Hello world</h1>');
//     res.write('</body>');
//     res.write('</html>');
//     res.end();
// }

// module.exports = requestHandler;