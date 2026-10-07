const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");

const db = require("./database");

const app = express();
const PORT = 3000;


// ======================================================
// MIDDLEWARES
// ======================================================

app.use(cors());

app.use(express.json());


// ======================================================
// PÁGINA INICIAL
// Abre o login quando acessarmos localhost:3000
// ======================================================

app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "../frontend/login.html"
    )
  );

});


// ======================================================
// ARQUIVOS DO FRONT-END
// ======================================================

app.use(
  express.static(
    path.join(
      __dirname,
      "../frontend"
    )
  )
);


// ======================================================
// USUÁRIO ADMINISTRADOR INICIAL
// ======================================================

function criarUsuarioInicial() {

  const email =
    "gabriel@delta.com";

  const senha =
    "123456";

  const nome =
    "Gabriel";


  db.get(
    `
      SELECT id
      FROM usuarios
      WHERE email = ?
    `,
    [email],
    async (err, usuario) => {

      if (err) {

        console.error(
          "Erro ao verificar usuário inicial:",
          err.message
        );

        return;

      }


      if (usuario) {

        console.log(
          "Usuário administrador já existe."
        );

        return;

      }


      try {

        const senhaCriptografada =
          await bcrypt.hash(
            senha,
            10
          );


        db.run(
          `
            INSERT INTO usuarios (
              nome,
              email,
              senha
            )
            VALUES (?, ?, ?)
          `,
          [
            nome,
            email,
            senhaCriptografada
          ],
          function (error) {

            if (error) {

              console.error(
                "Erro ao criar usuário inicial:",
                error.message
              );

              return;

            }


            console.log(
              "Usuário administrador criado."
            );

            console.log(
              "Login: gabriel@delta.com"
            );

            console.log(
              "Senha: 123456"
            );

          }
        );


      } catch (error) {

        console.error(
          "Erro ao criptografar senha:",
          error
        );

      }

    }
  );

}


criarUsuarioInicial();


// ======================================================
// LOGIN
// ======================================================

app.post(
  "/auth/login",
  (req, res) => {

    const {
      email,
      senha
    } = req.body;


    if (
      !email ||
      !senha
    ) {

      return res
        .status(400)
        .json({

          erro:
            "Informe e-mail e senha."

        });

    }


    const sql = `
      SELECT *
      FROM usuarios
      WHERE email = ?
    `;


    db.get(
      sql,
      [
        email.trim().toLowerCase()
      ],
      async (err, usuario) => {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao realizar login.",

              detalhes:
                err.message

            });

        }


        if (!usuario) {

          return res
            .status(401)
            .json({

              erro:
                "E-mail ou senha incorretos."

            });

        }


        try {

          const senhaCorreta =
            await bcrypt.compare(
              senha,
              usuario.senha
            );


          if (!senhaCorreta) {

            return res
              .status(401)
              .json({

                erro:
                  "E-mail ou senha incorretos."

              });

          }


          res.json({

            mensagem:
              "Login realizado com sucesso.",

            usuario: {

              id:
                usuario.id,

              nome:
                usuario.nome,

              email:
                usuario.email

            }

          });


        } catch (error) {

          res
            .status(500)
            .json({

              erro:
                "Erro ao verificar senha."

            });

        }

      }
    );

  }
);


// ======================================================
// CADASTRAR NOVO USUÁRIO
// Já deixa preparado para futuramente cadastrar equipe.
// ======================================================

app.post(
  "/auth/register",
  async (req, res) => {

    const {
      nome,
      email,
      senha
    } = req.body;


    if (
      !nome ||
      !email ||
      !senha
    ) {

      return res
        .status(400)
        .json({

          erro:
            "Nome, e-mail e senha são obrigatórios."

        });

    }


    if (
      senha.length < 6
    ) {

      return res
        .status(400)
        .json({

          erro:
            "A senha precisa ter pelo menos 6 caracteres."

        });

    }


    try {

      const senhaCriptografada =
        await bcrypt.hash(
          senha,
          10
        );


      const sql = `
        INSERT INTO usuarios (
          nome,
          email,
          senha
        )
        VALUES (?, ?, ?)
      `;


      db.run(
        sql,
        [
          nome.trim(),

          email
            .trim()
            .toLowerCase(),

          senhaCriptografada
        ],
        function (err) {


          if (err) {


            if (
              err.message.includes(
                "UNIQUE"
              )
            ) {

              return res
                .status(409)
                .json({

                  erro:
                    "Já existe um usuário com esse e-mail."

                });

            }


            return res
              .status(500)
              .json({

                erro:
                  "Erro ao cadastrar usuário.",

                detalhes:
                  err.message

              });

          }


          res
            .status(201)
            .json({

              mensagem:
                "Usuário cadastrado com sucesso.",

              id:
                this.lastID

            });

        }
      );


    } catch (error) {

      res
        .status(500)
        .json({

          erro:
            "Erro ao criptografar senha."

        });

    }

  }
);


// ======================================================
// CLIENTES
// ======================================================

app.post(
  "/clientes",
  (req, res) => {

    const {
      nome,
      nicho,
      instagram,
      conteudos_mes,
      responsavel
    } = req.body;


    const sql = `
      INSERT INTO clientes (
        nome,
        nicho,
        instagram,
        conteudos_mes,
        responsavel
      )
      VALUES (?, ?, ?, ?, ?)
    `;


    db.run(
      sql,
      [
        nome,
        nicho,
        instagram,
        conteudos_mes,
        responsavel
      ],
      function (err) {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao cadastrar cliente",

              detalhes:
                err.message

            });

        }


        res
          .status(201)
          .json({

            mensagem:
              "Cliente cadastrado com sucesso!",

            id:
              this.lastID

          });

      }
    );

  }
);


// ======================================================
// LISTAR CLIENTES
// ======================================================

app.get(
  "/clientes",
  (req, res) => {

    const sql =
      "SELECT * FROM clientes ORDER BY id DESC";


    db.all(
      sql,
      [],
      (err, rows) => {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao buscar clientes",

              detalhes:
                err.message

            });

        }


        res.json(
          rows
        );

      }
    );

  }
);


// ======================================================
// EXCLUIR CLIENTE
// ======================================================

app.delete(
  "/clientes/:id",
  (req, res) => {

    const {
      id
    } = req.params;


    const sql =
      "DELETE FROM clientes WHERE id = ?";


    db.run(
      sql,
      [id],
      function (err) {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao excluir cliente",

              detalhes:
                err.message

            });

        }


        if (
          this.changes === 0
        ) {

          return res
            .status(404)
            .json({

              erro:
                "Cliente não encontrado"

            });

        }


        res.json({

          mensagem:
            "Cliente excluído com sucesso!"

        });

      }
    );

  }
);


// ======================================================
// EDITAR CLIENTE
// ======================================================

app.put(
  "/clientes/:id",
  (req, res) => {

    const {
      id
    } = req.params;


    const {
      nome,
      nicho,
      instagram,
      conteudos_mes,
      responsavel
    } = req.body;


    const sql = `
      UPDATE clientes

      SET
        nome = ?,
        nicho = ?,
        instagram = ?,
        conteudos_mes = ?,
        responsavel = ?

      WHERE id = ?
    `;


    db.run(
      sql,
      [
        nome,
        nicho,
        instagram,
        conteudos_mes,
        responsavel,
        id
      ],
      function (err) {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao atualizar cliente",

              detalhes:
                err.message

            });

        }


        if (
          this.changes === 0
        ) {

          return res
            .status(404)
            .json({

              erro:
                "Cliente não encontrado"

            });

        }


        res.json({

          mensagem:
            "Cliente atualizado com sucesso!"

        });

      }
    );

  }
);


// ======================================================
// CRIAR CONTEÚDO
// ======================================================

app.post(
  "/conteudos",
  (req, res) => {

    const {

      titulo,
      cliente_id,
      formato,
      plataforma,
      objetivo,
      responsavel,
      prioridade,
      status,
      data_publicacao,
      descricao

    } = req.body;


    const sql = `
      INSERT INTO conteudos (

        titulo,
        cliente_id,
        formato,
        plataforma,
        objetivo,
        responsavel,
        prioridade,
        status,
        data_publicacao,
        descricao

      )

      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;


    db.run(
      sql,
      [

        titulo,
        cliente_id,
        formato,
        plataforma,
        objetivo,
        responsavel,
        prioridade,
        status,
        data_publicacao,
        descricao

      ],
      function (err) {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao cadastrar conteúdo",

              detalhes:
                err.message

            });

        }


        res
          .status(201)
          .json({

            mensagem:
              "Conteúdo cadastrado com sucesso!",

            id:
              this.lastID

          });

      }
    );

  }
);


// ======================================================
// LISTAR CONTEÚDOS
// ======================================================

app.get(
  "/conteudos",
  (req, res) => {

    const sql = `
      SELECT

        conteudos.*,

        clientes.nome
          AS cliente_nome

      FROM conteudos

      LEFT JOIN clientes
        ON conteudos.cliente_id = clientes.id

      ORDER BY conteudos.id DESC
    `;


    db.all(
      sql,
      [],
      (err, rows) => {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao buscar conteúdos",

              detalhes:
                err.message

            });

        }


        res.json(
          rows
        );

      }
    );

  }
);


// ======================================================
// ATUALIZAR STATUS
// ======================================================

app.patch(
  "/conteudos/:id/status",
  (req, res) => {

    const {
      id
    } = req.params;


    const {
      status
    } = req.body;


    const sql = `
      UPDATE conteudos

      SET status = ?

      WHERE id = ?
    `;


    db.run(
      sql,
      [
        status,
        id
      ],
      function (err) {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao atualizar status",

              detalhes:
                err.message

            });

        }


        if (
          this.changes === 0
        ) {

          return res
            .status(404)
            .json({

              erro:
                "Conteúdo não encontrado"

            });

        }


        res.json({

          mensagem:
            "Status atualizado com sucesso!",

          id:
            Number(id),

          status

        });

      }
    );

  }
);


// ======================================================
// EDITAR CONTEÚDO
// ======================================================

app.put(
  "/conteudos/:id",
  (req, res) => {

    const {
      id
    } = req.params;


    const {

      titulo,
      cliente_id,
      formato,
      plataforma,
      objetivo,
      responsavel,
      prioridade,
      status,
      data_publicacao,
      descricao

    } = req.body;


    const sql = `
      UPDATE conteudos

      SET
        titulo = ?,
        cliente_id = ?,
        formato = ?,
        plataforma = ?,
        objetivo = ?,
        responsavel = ?,
        prioridade = ?,
        status = ?,
        data_publicacao = ?,
        descricao = ?

      WHERE id = ?
    `;


    db.run(
      sql,
      [

        titulo,
        cliente_id,
        formato,
        plataforma,
        objetivo,
        responsavel,
        prioridade,
        status,
        data_publicacao,
        descricao,
        id

      ],
      function (err) {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao atualizar conteúdo",

              detalhes:
                err.message

            });

        }


        if (
          this.changes === 0
        ) {

          return res
            .status(404)
            .json({

              erro:
                "Conteúdo não encontrado"

            });

        }


        res.json({

          mensagem:
            "Conteúdo atualizado com sucesso!"

        });

      }
    );

  }
);


// ======================================================
// EXCLUIR CONTEÚDO
// ======================================================

app.delete(
  "/conteudos/:id",
  (req, res) => {

    const {
      id
    } = req.params;


    const sql =
      "DELETE FROM conteudos WHERE id = ?";


    db.run(
      sql,
      [id],
      function (err) {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao excluir conteúdo",

              detalhes:
                err.message

            });

        }


        if (
          this.changes === 0
        ) {

          return res
            .status(404)
            .json({

              erro:
                "Conteúdo não encontrado"

            });

        }


        res.json({

          mensagem:
            "Conteúdo excluído com sucesso!"

        });

      }
    );

  }
);


// ======================================================
// BUSCAR CONTEÚDO POR ID
// ======================================================

app.get(
  "/conteudos/:id",
  (req, res) => {

    const {
      id
    } = req.params;


    const sql = `
      SELECT

        conteudos.*,

        clientes.nome
          AS cliente_nome

      FROM conteudos

      LEFT JOIN clientes
        ON conteudos.cliente_id = clientes.id

      WHERE conteudos.id = ?
    `;


    db.get(
      sql,
      [id],
      (err, row) => {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao buscar conteúdo",

              detalhes:
                err.message

            });

        }


        if (!row) {

          return res
            .status(404)
            .json({

              erro:
                "Conteúdo não encontrado"

            });

        }


        res.json(
          row
        );

      }
    );

  }
);


// ======================================================
// DASHBOARD - RESUMO
// ======================================================

app.get(
  "/dashboard/resumo",
  (req, res) => {

    const sql = `
      SELECT

        COUNT(*)
          AS total,

        SUM(
          CASE
            WHEN status = 'Ideia'
            THEN 1
            ELSE 0
          END
        )
          AS ideias,

        SUM(
          CASE
            WHEN status = 'Roteiro'
            THEN 1
            ELSE 0
          END
        )
          AS roteiros,

        SUM(
          CASE
            WHEN status = 'Gravação'
            THEN 1
            ELSE 0
          END
        )
          AS gravacao,

        SUM(
          CASE
            WHEN status = 'Edição'
            THEN 1
            ELSE 0
          END
        )
          AS edicao,

        SUM(
          CASE
            WHEN status = 'Aprovação'
            THEN 1
            ELSE 0
          END
        )
          AS aprovacao,

        SUM(
          CASE
            WHEN status = 'Agendado'
            THEN 1
            ELSE 0
          END
        )
          AS agendados,

        SUM(
          CASE
            WHEN status = 'Publicado'
            THEN 1
            ELSE 0
          END
        )
          AS publicados

      FROM conteudos
    `;


    db.get(
      sql,
      [],
      (err, row) => {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao carregar resumo do dashboard",

              detalhes:
                err.message

            });

        }


        res.json(
          row
        );

      }
    );

  }
);


// ======================================================
// DASHBOARD - PRÓXIMOS CONTEÚDOS
// ======================================================

app.get(
  "/dashboard/proximos",
  (req, res) => {

    const sql = `
      SELECT

        conteudos.id,
        conteudos.titulo,
        conteudos.formato,
        conteudos.status,
        conteudos.prioridade,
        conteudos.data_publicacao,

        clientes.nome
          AS cliente_nome

      FROM conteudos

      LEFT JOIN clientes
        ON conteudos.cliente_id = clientes.id

      WHERE
        conteudos.data_publicacao IS NOT NULL

        AND conteudos.data_publicacao != ''

      ORDER BY
        conteudos.data_publicacao ASC

      LIMIT 5
    `;


    db.all(
      sql,
      [],
      (err, rows) => {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao carregar próximos conteúdos",

              detalhes:
                err.message

            });

        }


        res.json(
          rows
        );

      }
    );

  }
);


// ======================================================
// CONTEÚDOS DE UM CLIENTE
// ======================================================

app.get(
  "/clientes/:id/conteudos",
  (req, res) => {

    const {
      id
    } = req.params;


    const sql = `
      SELECT

        conteudos.*,

        clientes.nome
          AS cliente_nome

      FROM conteudos

      LEFT JOIN clientes
        ON conteudos.cliente_id = clientes.id

      WHERE
        conteudos.cliente_id = ?

      ORDER BY
        conteudos.data_publicacao ASC
    `;


    db.all(
      sql,
      [id],
      (err, rows) => {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao buscar conteúdos do cliente",

              detalhes:
                err.message

            });

        }


        res.json(
          rows
        );

      }
    );

  }
);


// ======================================================
// BUSCAR CLIENTE POR ID
// ======================================================

app.get(
  "/clientes/:id",
  (req, res) => {

    const {
      id
    } = req.params;


    const sql = `
      SELECT *
      FROM clientes
      WHERE id = ?
    `;


    db.get(
      sql,
      [id],
      (err, row) => {


        if (err) {

          return res
            .status(500)
            .json({

              erro:
                "Erro ao buscar cliente",

              detalhes:
                err.message

            });

        }


        if (!row) {

          return res
            .status(404)
            .json({

              erro:
                "Cliente não encontrado"

            });

        }


        res.json(
          row
        );

      }
    );

  }
);


// ======================================================
// INICIAR SERVIDOR
// ======================================================

app.listen(
  PORT,
  () => {

    console.log(
      `Servidor rodando em http://localhost:${PORT}`
    );

  }
);