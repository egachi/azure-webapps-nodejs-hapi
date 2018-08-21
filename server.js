const Hapi = require("hapi");
const fs = require("fs");

const server = new Hapi.Server({
        "host": process.env.HOST || 'localhost',
        "port": process.env.PORT || 3000
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        return 'Hello, world!';
    }
});

server.route({
     method: 'POST',
     path: '/submit',
     config: { 	 
     	payload: {
         	output: 'stream',
         	parse: true,
         	allow: 'multipart/form-data',
            maxBytes: 1000000000 
     	},    	 
    handler: (request, h) => {
       var responseString ="";

        const data = request.payload;
        if (data.file) {
            var name = data.file.hapi.filename;
            var path = __dirname + "/uploads/" + name;
            var file = fs.createWriteStream(path);
             
            file.on('error', function (err) { 
                responseString = err;
            });
             
            data.file.pipe(file);
             
            data.file.on('end', function (err) { 
                var ret = {
                    filename: data.file.hapi.filename,
                    headers: data.file.hapi.headers
                }
                responseString = JSON.stringify(ret);
            })
        }

        var response = h.response(responseString);
        response.code(200);
        response.header('Content-Type', 'text/plain');
        return response;
      }
    }
});


server.start(error => {
    if(error) {
        throw error;
    }
    console.log("Listening at " + server.info.uri);
});
