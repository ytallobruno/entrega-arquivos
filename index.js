const net = require("net");
const fs = require("fs");

const arquivos = "./archive";

const RESPONSE_200 = "HTTP/1.1 200 OK\r\n\r\n";
const RESPONSE_201 = "HTTP/1.1 201 Created\r\n\r\n";
const RESPONSE_401 = "HTTP/1.1 401 Unauthorized\r\n\r\n";
const RESPONSE_404 = "HTTP/1.1 404 Not Found\r\n\r\n";
const RESPONSE_405 = "HTTP/1.1 405 Method Not Allowed\r\n\r\n";

const dividir = (splitLine) => {
    var split = splitLine.toString().split(" ");
    let objeto = {
        method: split[0],
        path: split[1],
    };
    return objeto;
};

const dividirPost = (splitLine) => {
    let conteudo = splitLine.toString().split("\r\n");
    let tamanhoConteudo = conteudo[conteudo.length - 1];
    let conteudoArray = tamanhoConteudo.split("&");
    let newArray = [];
    for (let i = 0; i < conteudoArray.length; i++) {
        newArray.push(conteudoArray[i].split("="));
    }
    return Object.fromEntries(newArray);
};

const server = net.createServer((socket) => {
    console.log(
        `=> (${socket.remoteAddress}:${socket.remotePort}) se conectou ao servidor!`
    );

    socket.on("data", (data) => {
        const dado = data.toString();
        const objeto = dividir(dado);
        const objetoPost = dividirPost(data);

        console.log(
            `=> (${socket.remoteAddress} : ${socket.remotePort}) Says: ${dado}`
        );

        console.log(objeto);

        if (objeto.method === "GET") {
            if (!fs.existsSync(arquivos + objeto.path)) {
                socket.write(RESPONSE_404);
                socket.end();
            } else {
                fs.readFile(arquivos + objeto.path, (err, data) => {
                    if (objeto.path == "/") {
                        var data = fs.readFileSync("./archive/index.html");
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
        } else if (objeto.method == "POST") {
            if (
                fs.existsSync(
                    arquivos + `/${objetoPost.arquivo}.${objetoPost.tipo}`
                )
            ) {
                socket.write(RESPONSE_401);
                socket.end();
            } else {
                fs.appendFile(
                    arquivos + `/${objetoPost.arquivo}.${objetoPost.tipo}`,
                    objetoPost.conteudo,
                    (err) => {
                        if (err) {
                            socket.write(RESPONSE_401);
                            console.log(err);
                        } else {
                            socket.write(RESPONSE_201);
                            console.log(
                                `Arquivo ${objetoPost.arquivo}.${objetoPost.tipo} postado com sucesso!\r\n`
                            );
                        }
                    }
                );
            }
        } else if (objeto.method == "DELETE") {
            fs.rm(arquivos + objeto.path, (err) => {
                if (err) {
                    socket.write(RESPONSE_404);
                    console.log(err);
                } else {
                    socket.write(RESPONSE_200);
                    console.log(`Arquivo ${objeto.path} excluído!\r\n`);
                }
            });
        } else if (dado.startsWith("OPTIONS")) {
            socket.write(RESPONSE_200);
            socket.write(
                `GET, POST, DELETE, OPTIONS. Use the following way to get/delete:\r\nMETHOD + path (ex.: /fileName.txt ) + HTTP/1.1\r\n\r\n`
            );
        } else {
            socket.write(RESPONSE_405);
            socket.end();
        }
    });
});

const port = 4002;
const host = "127.0.0.1";

server.listen(port, host, () => {
    console.log(`Servidor iniciado em ${host}:${port}`);
});
