const net = require("net");
const fs = require("fs");

const arquivos = "./archive";

const RESPONSE_404 = "HTTP/1.1 404 Not Found\r\n\r\n";
const RESPONSE_200 = "HTTP/1.1 200 OK\r\n\r\n";

const splitando = (splitLine) => {
    var split = splitLine.toString().split(" ");
    let objeto = {
        method: split[0],
        path: split[1],
    };
    return objeto;
};

const server = net.createServer((socket) => {
    console.log(
        `=> (${socket.remoteAddress}:${socket.remotePort}) se conectou ao servidor!`
    );

    socket.on("data", (data) => {
        var dado = data.toString();
        var objeto = splitando(dado);
        console.log(splitando(dado));
        console.log(
            `=> (${socket.remoteAddress} : ${socket.remotePort}) Says: ${dado}`
        );

        if (objeto.method === "GET") {
            if (!fs.existsSync(arquivos + objeto.path)) {
                socket.write(RESPONSE_404);
                socket.end();
            } else {
                fs.readFile(arquivos + objeto.path, (err, data) => {
                    if (objeto.path == "/") {
                        var data = fs.readFileSync("./arquivos/index.html");
                        socket.write(RESPONSE_200);
                        socket.write(data);
                    } else if (err) {
                        socket.write(RESPONSE_404);
                        console.log(err);
                    } else {
                        socket.write(RESPONSE_200);
                        socket.write(data);
                    }
                    socket.end();
                });
            }
            // } else if (objeto.method === "POST") {
            //     if (!fs.existsSync(arquivos + objeto.path)) {
            //         socket.write(RESPONSE_404);
            //         socket.end();
            //     } else {
            //         fs.readFile(arquivos + objeto.path, (err, data) => {
            //             if (objeto.path == "/") {
            //                 socket.write(RESPONSE_200);
            //                 socket.write("feito!")
            //                 console.log("feito2")
            //             } else if (err) {
            //                 socket.write(RESPONSE_404);
            //                 console.log(err);
            //             } else {
            //                 socket.write(RESPONSE_200);
            //                 socket.write(data);
            //             }
            //             socket.end();
            //         });
            //     }
        } else if (dado.startsWith("CREATE")) {
            fs.writeFile(arquivos + objeto.path, "", (err) => {
                if (err) {
                    socket.write(RESPONSE_404);
                    console.log(err);
                } else {
                    socket.write(RESPONSE_200);
                    console.log("Arquivo criado!");
                }
            });
        } else if (objeto.method === "DELETE") {
            fs.rm(arquivos + objeto.path, (err) => {
                if (err) {
                    socket.write(RESPONSE_404);
                    console.log(err);
                } else {
                    socket.write(RESPONSE_200);
                    console.log("Arquivo excluído!");
                }
            });
        } else if (dado.startsWith("OPTIONS")) {
            socket.write(RESPONSE_200);
            socket.write(
                `GET, POST, CREATE, DELETE, OPTIONS. Use the following way to get/post/delete:\r\nMETHOD + path (ex.: /abc.txt ) + HTTP/1.1\r\n\r\n`
            );
        } else if (dado.toLowerCase().startsWith("end")) {
            socket.write(RESPONSE_200);
            socket.end();
        }

        // const nome = (objeto.path.split("/")[1]).split(".")[0];
        // const tipo = objeto.path.split(".")[1];
        // console.log(nome, tipo);

        //     try {
        //         switch (tipo) {
        //             case "html":
        //                 var data = fs.readFileSync(
        //                     arquivos + objeto.path
        //                 );
        //                 socket.write(RESPONSE_200);
        //                 socket.write(data);
        //                 socket.end();
        //                 break;

        //             case "json":
        //                 var data = fs.readFileSync(
        //                     arquivos + objeto.path
        //                 );
        //                 socket.write(RESPONSE_200);
        //                 socket.write(data);
        //                 socket.end();
        //                 break;

        //             case "pdf":
        //                 var data = fs.readFileSync(
        //                     arquivos + objeto.path
        //                 );
        //                 socket.write(RESPONSE_200);
        //                 socket.write(data);
        //                 socket.end();
        //                 break;

        //             case "docx":
        //                 var data = fs.readFileSync(
        //                     arquivos + objeto.path
        //                 );
        //                 socket.write(RESPONSE_200);
        //                 socket.write(data);
        //                 socket.end();
        //                 break;

        //             case "jpg":
        //                 var data = fs.readFileSync(
        //                     arquivos + objeto.path
        //                 );
        //                 socket.write(RESPONSE_200);
        //                 socket.write(data);
        //                 socket.end();
        //                 break;

        //             default:
        //                 var data = fs.readFileSync("./arquivos/index.html");
        //                 socket.write(RESPONSE_200);
        //                 socket.write(data);
        //                 socket.end();
        //                 break;
        //         }
        //     } catch (error) {
        //         socket.write(RESPONSE_404);
        //         socket.end();
        //     }
    });

    // socket.on("end", () => {
    //     console.log(
    //         `=> (${socket.remoteAddress} : ${socket.remotePort}) Encerrou a conexão`
    //     );
    // });
});

const port = 4002;
const host = "127.0.0.1";

server.listen(port, host, () => {
    console.log(`Servidor iniciado em localhost:${port}`);
});
