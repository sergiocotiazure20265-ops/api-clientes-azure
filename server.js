const express = require("express");
const swaggerUi = require("swagger-ui-express");

const app = express();

app.use(express.json());

// ==============================================
// PORTA
// ==============================================

const PORT = process.env.PORT || 3000;


// ==============================================
// CACHE EM MEMÓRIA
// ==============================================

let clientes = [];

let proximoId = 1;


// ==============================================
// CADASTRAR CLIENTE
// POST /clientes
// ==============================================

app.post("/clientes", (req, res) => {

    const cliente = {
        id: proximoId++,
        nome: req.body.nome,
        email: req.body.email
    };

    clientes.push(cliente);

    res.status(201).json(cliente);
});


// ==============================================
// CONSULTAR TODOS
// GET /clientes
// ==============================================

app.get("/clientes", (req, res) => {

    res.json(clientes);

});


// ==============================================
// CONSULTAR POR ID
// GET /clientes/1
// ==============================================

app.get("/clientes/:id", (req, res) => {

    const id = Number(req.params.id);

    const cliente = clientes.find(c => c.id === id);

    if (!cliente) {
        return res.status(404).json({
            mensagem: "Cliente não encontrado."
        });
    }

    res.json(cliente);
});


// ==============================================
// ATUALIZAR CLIENTE
// PUT /clientes/1
// ==============================================

app.put("/clientes/:id", (req, res) => {

    const id = Number(req.params.id);

    const cliente = clientes.find(c => c.id === id);

    if (!cliente) {
        return res.status(404).json({
            mensagem: "Cliente não encontrado."
        });
    }

    cliente.nome = req.body.nome;
    cliente.email = req.body.email;

    res.json(cliente);
});


// ==============================================
// EXCLUIR CLIENTE
// DELETE /clientes/1
// ==============================================

app.delete("/clientes/:id", (req, res) => {

    const id = Number(req.params.id);

    const cliente = clientes.find(c => c.id === id);

    if (!cliente) {
        return res.status(404).json({
            mensagem: "Cliente não encontrado."
        });
    }

    clientes = clientes.filter(c => c.id !== id);

    res.status(204).send();
});


// ==============================================
// SWAGGER
// ==============================================

const swaggerDocument = {

    openapi: "3.0.0",

    info: {
        title: "API de Clientes",
        version: "1.0.0",
        description: "API CRUD simples desenvolvida com Node.js e Express"
    },

    paths: {

        "/clientes": {

            get: {

                summary: "Consultar todos os clientes",

                responses: {

                    200: {
                        description: "Lista de clientes"
                    }
                }
            },


            post: {

                summary: "Cadastrar cliente",

                requestBody: {

                    required: true,

                    content: {

                        "application/json": {

                            schema: {

                                type: "object",

                                properties: {

                                    nome: {
                                        type: "string",
                                        example: "João da Silva"
                                    },

                                    email: {
                                        type: "string",
                                        example: "joao@gmail.com"
                                    }
                                }
                            }
                        }
                    }
                },

                responses: {

                    201: {
                        description: "Cliente cadastrado com sucesso"
                    }
                }
            }
        },


        "/clientes/{id}": {

            get: {

                summary: "Consultar cliente pelo ID",

                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,

                        schema: {
                            type: "integer"
                        }
                    }
                ],

                responses: {

                    200: {
                        description: "Cliente encontrado"
                    },

                    404: {
                        description: "Cliente não encontrado"
                    }
                }
            },


            put: {

                summary: "Atualizar cliente",

                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,

                        schema: {
                            type: "integer"
                        }
                    }
                ],

                requestBody: {

                    required: true,

                    content: {

                        "application/json": {

                            schema: {

                                type: "object",

                                properties: {

                                    nome: {
                                        type: "string",
                                        example: "João Pereira"
                                    },

                                    email: {
                                        type: "string",
                                        example: "joaopereira@gmail.com"
                                    }
                                }
                            }
                        }
                    }
                },

                responses: {

                    200: {
                        description: "Cliente atualizado com sucesso"
                    },

                    404: {
                        description: "Cliente não encontrado"
                    }
                }
            },


            delete: {

                summary: "Excluir cliente",

                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,

                        schema: {
                            type: "integer"
                        }
                    }
                ],

                responses: {

                    204: {
                        description: "Cliente excluído com sucesso"
                    },

                    404: {
                        description: "Cliente não encontrado"
                    }
                }
            }
        }
    }
};


// ==============================================
// CONFIGURAÇÃO DO SWAGGER
// ==============================================

app.use(
    "/swagger",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);


// ==============================================
// ROTA INICIAL
// ==============================================

app.get("/", (req, res) => {

    res.json({
        mensagem: "API de Clientes funcionando!",
        swagger: "/swagger"
    });

});


// ==============================================
// INICIAR SERVIDOR
// ==============================================

app.listen(PORT, () => {

    console.log(`API executando na porta ${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/swagger`);

});