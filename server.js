const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const formidable = require('formidable');

//checking upload directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const server = http.createServer((req, res) => {
    if (req.url == "/upload" && req.method.toLowerCase() === 'post') {
        const form = new formidable({
            multiples: false,
            uploadDir: uploadDir,
            keepExtensions: true,
        });

        form.onPart = function(part) {
            if (part.filename) {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
                const ext = path.extname(part.filename).toLowerCase();

                if (!allowedTypes.includes(ext)){
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('<H1>Invalid file type. Only accepts JPG, PNG, and GIF are allowed.</H1>', 'utf8');
                    return;
                }
            }

            form.handlePart(part);
        };

        form.parse(req, (err, fields, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('<H1>Server Error during file upload</H1>', 'utf8');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('<H1>File uploaded successfully!</H1>', 'utf8');
        });

    }else{
        let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    }


    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

    fs.readFile(filePath, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<H1>404 - File Not Found</H1>', 'utf8');
            }else{
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        }else{
            res.writeHead(200, { 'Content-Type': mime.lookup(filePath)  });

            res.end(stats, 'utf8');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));