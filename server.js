require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { sql, getConnection } = require("./database");

const app = express();

app.use(express.json());


// ==============================================
// PORTA
// ==============================================

const PORT = process.env.PORT || 3000;


// ==============================================
// VALIDAÇÃO
// ==============================================

function validarCliente(body) {

    const camposObrigatorios = [
        "nome",
        "email",
        "telefone",
        "cpf"
    ];

    const camposAusentes = camposObrigatorios.filter(
        campo => {

            const valor = body[campo];

            return (
                valor === undefined ||
                valor === null ||
                String(valor).trim() === ""
            );
        }
    );

    if (camposAusentes.length > 0) {

        return `Campos obrigatórios: ${camposAusentes.join(", ")}.`;
    }

    if (String(body.nome).length > 150) {

        return "O nome deve possuir no máximo 150 caracteres.";
    }

    if (String(body.email).length > 50) {

        return "O email deve possuir no máximo 50 caracteres.";
    }

    if (String(body.telefone).length > 25) {

        return "O telefone deve possuir no máximo 25 caracteres.";
    }

    if (String(body.cpf).length !== 11) {

        return "O CPF deve possuir exatamente 11 caracteres.";
    }

    return null;
}


// ==============================================
// SELECT PADRÃO
// ==============================================

function clienteSelect() {

    return `
        SELECT
            Id AS id,
            Nome AS nome,
            Email AS email,
            Telefone AS telefone,
            Cpf AS cpf,
            DataCadastro AS dataCadastro,
            Ativo AS ativo
        FROM Clientes
    `;
}


// ==============================================
// CADASTRAR CLIENTE
// POST /clientes
// ==============================================

app.post("/clientes", async (req, res) => {

    try {

        const erroValidacao =
            validarCliente(req.body);

        if (erroValidacao) {

            return res.status(400).json({
                mensagem: erroValidacao
            });
        }


        const pool =
            await getConnection();


        const result = await pool.request()

            .input(
                "nome",
                sql.VarChar(150),
                req.body.nome.trim()
            )

            .input(
                "email",
                sql.VarChar(50),
                req.body.email.trim()
            )

            .input(
                "telefone",
                sql.VarChar(25),
                req.body.telefone.trim()
            )

            .input(
                "cpf",
                sql.VarChar(11),
                req.body.cpf.trim()
            )

            .query(`

                INSERT INTO Clientes
                (
                    Nome,
                    Email,
                    Telefone,
                    Cpf
                )

                OUTPUT
                    INSERTED.Id AS id,
                    INSERTED.Nome AS nome,
                    INSERTED.Email AS email,
                    INSERTED.Telefone AS telefone,
                    INSERTED.Cpf AS cpf,
                    INSERTED.DataCadastro AS dataCadastro,
                    INSERTED.Ativo AS ativo

                VALUES
                (
                    @nome,
                    @email,
                    @telefone,
                    @cpf
                );

            `);


        return res
            .status(201)
            .json(result.recordset[0]);

    }
    catch (error) {

        console.error(
            "Erro ao cadastrar cliente:",
            error
        );

        return res.status(500).json({

            mensagem:
                "Erro ao cadastrar cliente no banco de dados."

        });
    }

});


// ==============================================
// CONSULTAR TODOS
// GET /clientes
// ==============================================

app.get("/clientes", async (req, res) => {

    try {

        const pool =
            await getConnection();


        const result =
            await pool.request().query(`

                ${clienteSelect()}

                ORDER BY Id;

            `);


        return res.json(
            result.recordset
        );

    }
    catch (error) {

        console.error(
            "Erro ao consultar clientes:",
            error
        );

        return res.status(500).json({

            mensagem:
                "Erro ao consultar clientes no banco de dados."

        });
    }

});


// ==============================================
// CONSULTAR POR ID
// GET /clientes/1
// ==============================================

app.get("/clientes/:id", async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                mensagem: "ID inválido."

            });
        }


        const pool =
            await getConnection();


        const result = await pool.request()

            .input(
                "id",
                sql.Int,
                id
            )

            .query(`

                ${clienteSelect()}

                WHERE Id = @id;

            `);


        if (result.recordset.length === 0) {

            return res.status(404).json({

                mensagem:
                    "Cliente não encontrado."

            });
        }


        return res.json(
            result.recordset[0]
        );

    }
    catch (error) {

        console.error(
            "Erro ao consultar cliente:",
            error
        );

        return res.status(500).json({

            mensagem:
                "Erro ao consultar cliente no banco de dados."

        });
    }

});


// ==============================================
// ATUALIZAR CLIENTE
// PUT /clientes/1
// ==============================================

app.put("/clientes/:id", async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                mensagem: "ID inválido."

            });
        }


        const erroValidacao =
            validarCliente(req.body);


        if (erroValidacao) {

            return res.status(400).json({

                mensagem: erroValidacao

            });
        }


        const ativo =
            req.body.ativo === undefined
                ? null
                : Boolean(req.body.ativo);


        const pool =
            await getConnection();


        const result = await pool.request()

            .input(
                "id",
                sql.Int,
                id
            )

            .input(
                "nome",
                sql.VarChar(150),
                req.body.nome.trim()
            )

            .input(
                "email",
                sql.VarChar(50),
                req.body.email.trim()
            )

            .input(
                "telefone",
                sql.VarChar(25),
                req.body.telefone.trim()
            )

            .input(
                "cpf",
                sql.VarChar(11),
                req.body.cpf.trim()
            )

            .input(
                "ativo",
                sql.Bit,
                ativo
            )

            .query(`

                UPDATE Clientes

                SET
                    Nome = @nome,
                    Email = @email,
                    Telefone = @telefone,
                    Cpf = @cpf,
                    Ativo = COALESCE(@ativo, Ativo)

                OUTPUT
                    INSERTED.Id AS id,
                    INSERTED.Nome AS nome,
                    INSERTED.Email AS email,
                    INSERTED.Telefone AS telefone,
                    INSERTED.Cpf AS cpf,
                    INSERTED.DataCadastro AS dataCadastro,
                    INSERTED.Ativo AS ativo

                WHERE Id = @id;

            `);


        if (result.recordset.length === 0) {

            return res.status(404).json({

                mensagem:
                    "Cliente não encontrado."

            });
        }


        return res.json(
            result.recordset[0]
        );

    }
    catch (error) {

        console.error(
            "Erro ao atualizar cliente:",
            error
        );

        return res.status(500).json({

            mensagem:
                "Erro ao atualizar cliente no banco de dados."

        });
    }

});


// ==============================================
// EXCLUIR CLIENTE
// DELETE /clientes/1
// ==============================================

app.delete("/clientes/:id", async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                mensagem: "ID inválido."

            });
        }


        const pool =
            await getConnection();


        const result = await pool.request()

            .input(
                "id",
                sql.Int,
                id
            )

            .query(`

                DELETE FROM Clientes

                WHERE Id = @id;

            `);


        if (result.rowsAffected[0] === 0) {

            return res.status(404).json({

                mensagem:
                    "Cliente não encontrado."

            });
        }


        return res
            .status(204)
            .send();

    }
    catch (error) {

        console.error(
            "Erro ao excluir cliente:",
            error
        );

        return res.status(500).json({

            mensagem:
                "Erro ao excluir cliente no banco de dados."

        });
    }

});


// ==============================================
// SWAGGER
// ==============================================

const clienteSchema = {

    type: "object",

    properties: {

        id: {
            type: "integer",
            example: 1
        },

        nome: {
            type: "string",
            example: "João da Silva"
        },

        email: {
            type: "string",
            example: "joaosilva@gmail.com"
        },

        telefone: {
            type: "string",
            example: "(21)99999-0000"
        },

        cpf: {
            type: "string",
            example: "12345678900"
        },

        dataCadastro: {
            type: "string",
            format: "date-time"
        },

        ativo: {
            type: "boolean",
            example: true
        }
    }
};


const clienteRequestSchema = {

    type: "object",

    required: [
        "nome",
        "email",
        "telefone",
        "cpf"
    ],

    properties: {

        nome: {
            type: "string",
            example: "João da Silva"
        },

        email: {
            type: "string",
            example: "joaosilva@gmail.com"
        },

        telefone: {
            type: "string",
            example: "(21)99999-0000"
        },

        cpf: {
            type: "string",
            example: "12345678900"
        },

        ativo: {
            type: "boolean",
            example: true,
            description:
                "Opcional no PUT. Se não for informado, o valor atual será mantido."
        }
    }
};


const swaggerDocument = {

    openapi: "3.0.0",

    info: {

        title: "API de Clientes",

        version: "2.0.0",

        description:
            "API CRUD desenvolvida com Node.js, Express e SQL Server"
    },

    components: {

        schemas: {

            Cliente:
                clienteSchema,

            ClienteRequest:
                clienteRequestSchema
        }
    },

    paths: {

        "/clientes": {

            get: {

                summary:
                    "Consultar todos os clientes",

                responses: {

                    200: {

                        description:
                            "Lista de clientes",

                        content: {

                            "application/json": {

                                schema: {

                                    type: "array",

                                    items: {

                                        $ref:
                                            "#/components/schemas/Cliente"
                                    }
                                }
                            }
                        }
                    }
                }
            },

            post: {

                summary:
                    "Cadastrar cliente",

                requestBody: {

                    required: true,

                    content: {

                        "application/json": {

                            schema: {

                                $ref:
                                    "#/components/schemas/ClienteRequest"
                            }
                        }
                    }
                },

                responses: {

                    201: {

                        description:
                            "Cliente cadastrado com sucesso"
                    },

                    400: {

                        description:
                            "Dados inválidos"
                    }
                }
            }
        },


        "/clientes/{id}": {

            get: {

                summary:
                    "Consultar cliente pelo ID",

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

                        description:
                            "Cliente encontrado"
                    },

                    404: {

                        description:
                            "Cliente não encontrado"
                    }
                }
            },


            put: {

                summary:
                    "Atualizar cliente",

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

                                $ref:
                                    "#/components/schemas/ClienteRequest"
                            }
                        }
                    }
                },

                responses: {

                    200: {

                        description:
                            "Cliente atualizado com sucesso"
                    },

                    400: {

                        description:
                            "Dados inválidos"
                    },

                    404: {

                        description:
                            "Cliente não encontrado"
                    }
                }
            },


            delete: {

                summary:
                    "Excluir cliente",

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

                        description:
                            "Cliente excluído com sucesso"
                    },

                    404: {

                        description:
                            "Cliente não encontrado"
                    }
                }
            }
        }
    }
};


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

        mensagem:
            "API de Clientes com SQL Server funcionando!",

        swagger:
            "/swagger"
    });

});


// ==============================================
// INICIAR SERVIDOR
// ==============================================

async function iniciarServidor() {

    try {

        await getConnection();

        app.listen(PORT, () => {

            console.log(
                `API executando na porta ${PORT}`
            );

            console.log(
                `Swagger: http://localhost:${PORT}/swagger`
            );
        });

    }
    catch (error) {

        console.error(
            "Não foi possível conectar ao SQL Server."
        );

        console.error(
            error.message
        );

        process.exit(1);
    }
}


iniciarServidor();