// ======================================================
// CONTENTFLOW
// CRUD VISUAL - CLIENTES E CONTEÚDOS
// ======================================================



// ======================================================
// ESTILOS DO MODAL DE CONFIRMAÇÃO
// ======================================================

function loadConfirmationStyles() {

  if (
    document.getElementById(
      "contentflow-confirmation-styles"
    )
  ) {
    return;
  }


  const style =
    document.createElement("style");


  style.id =
    "contentflow-confirmation-styles";


  style.textContent = `

    .confirmation-modal-card {
      width: min(430px, calc(100vw - 32px));
      padding: 0;
      overflow: hidden;
    }


    .confirmation-modal-body {
      padding: 30px;
    }


    .confirmation-icon {
      width: 52px;
      height: 52px;

      margin-bottom: 20px;

      border-radius: 16px;

      display: flex;
      align-items: center;
      justify-content: center;

      background:
        rgba(198, 255, 0, 0.08);

      border:
        1px solid
        rgba(198, 255, 0, 0.18);

      color:
        #c6ff00;

      font-size: 24px;
      font-weight: 700;

      box-shadow:
        0 0 30px
        rgba(198, 255, 0, 0.05);
    }


    .confirmation-eyebrow {
      display: block;

      margin-bottom: 8px;

      color:
        #c6ff00;

      font-size: 10px;
      font-weight: 800;

      letter-spacing: 0.16em;

      text-transform: uppercase;
    }


    .confirmation-modal-body h3 {
      margin:
        0 0 12px;

      color:
        #f7f7f7;

      font-size: 24px;
      line-height: 1.15;

      letter-spacing:
        -0.03em;
    }


    .confirmation-text {
      margin: 0;

      color:
        #929292;

      font-size: 14px;
      line-height: 1.65;
    }


    .confirmation-name {
      color:
        #f7f7f7;

      font-weight: 700;
    }


    .confirmation-warning {
      margin-top: 18px;

      padding:
        12px 14px;

      border-radius: 12px;

      background:
        rgba(198, 255, 0, 0.055);

      border:
        1px solid
        rgba(198, 255, 0, 0.12);

      color:
        #9d9d9d;

      font-size: 11px;
      line-height: 1.5;
    }


    .confirmation-actions {
      padding:
        18px 30px 30px;

      display: flex;
      justify-content: flex-end;

      gap: 10px;
    }


    .danger-button {
      min-height: 42px;

      padding:
        0 18px;

      border:
        1px solid
        rgba(198, 255, 0, 0.35);

      border-radius: 11px;

      background:
        rgba(198, 255, 0, 0.12);

      color:
        #c6ff00;

      font-family: inherit;

      font-size: 12px;
      font-weight: 700;

      cursor: pointer;

      box-shadow:
        0 8px 26px
        rgba(198, 255, 0, 0.05);

      transition:
        background 0.2s ease,
        border-color 0.2s ease,
        color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.2s ease;
    }


    .danger-button:hover {
      background:
        #c6ff00;

      border-color:
        #c6ff00;

      color:
        #050505;

      box-shadow:
        0 10px 30px
        rgba(198, 255, 0, 0.16);

      transform:
        translateY(-1px);
    }


    .danger-button:disabled {
      opacity: 0.55;

      cursor: wait;

      transform: none;
    }


    .confirmation-cancel-button {
      min-height: 42px;
    }


    @media (max-width: 600px) {

      .confirmation-modal-body {
        padding:
          24px 22px;
      }


      .confirmation-actions {
        padding:
          16px 22px 24px;

        flex-direction: column-reverse;
      }


      .confirmation-actions button {
        width: 100%;
      }

    }

  `;


  document.head.appendChild(
    style
  );

}


loadConfirmationStyles();



// ======================================================
// CLIENTES - NOVA RENDERIZAÇÃO COM AÇÕES
// ======================================================

renderClients = function (lista) {

  const container =
    document.getElementById(
      "clients-grid"
    );


  if (!lista.length) {

    container.innerHTML = `

      <div class="empty-state">

        Nenhum cliente cadastrado.

      </div>

    `;

    return;

  }


  container.innerHTML =
    lista
      .map((cliente) => {


        const initials =
          cliente.nome
            .split(" ")
            .map(
              (word) =>
                word.charAt(0)
            )
            .join("")
            .slice(0, 2)
            .toUpperCase();


        return `

          <article class="client-card">


            <div class="client-card-top">


              <div class="client-avatar">

                ${initials}

              </div>


              <div class="card-actions">


                <button
                  class="action-button"
                  onclick="openClientEdit(${cliente.id})"
                  title="Editar cliente"
                >

                  ✎

                </button>


                <button
                  class="action-button danger-action"
                  onclick="deleteClient(${cliente.id})"
                  title="Excluir cliente"
                >

                  ×

                </button>


              </div>


            </div>


            <h4>

              ${cliente.nome}

            </h4>


            <p>

              ${
                cliente.nicho ||
                "Nicho não informado"
              }

            </p>


            <div class="client-meta">


              <span class="badge">

                ${
                  cliente.conteudos_mes ||
                  0
                } conteúdos/mês

              </span>


              <span class="badge">

                ${
                  cliente.instagram ||
                  "Sem Instagram"
                }

              </span>


              <span class="badge">

                ${
                  cliente.responsavel ||
                  "Sem responsável"
                }

              </span>


            </div>


          </article>

        `;

      })
      .join("");

};



// ======================================================
// CONTEÚDOS - NOVA TABELA COM AÇÕES
// ======================================================

renderContentsTable =
  function (lista) {


    const tbody =
      document.getElementById(
        "contents-table"
      );


    if (!lista.length) {


      tbody.innerHTML = `

        <tr>

          <td colspan="7">


            <div class="empty-state">

              Nenhum conteúdo cadastrado.

            </div>


          </td>

        </tr>

      `;


      return;

    }


    tbody.innerHTML =
      lista
        .map(
          (conteudo) => `


            <tr>


              <td>

                <strong>

                  ${conteudo.titulo}

                </strong>

              </td>


              <td>

                ${
                  conteudo.cliente_nome ||
                  "-"
                }

              </td>


              <td>

                ${
                  conteudo.formato ||
                  "-"
                }

              </td>


              <td>

                <span class="status-badge">

                  ${
                    conteudo.status ||
                    "-"
                  }

                </span>

              </td>


              <td>

                <span class="priority-badge">

                  ${
                    conteudo.prioridade ||
                    "-"
                  }

                </span>

              </td>


              <td>

                ${
                  formatDate(
                    conteudo.data_publicacao
                  )
                }

              </td>


              <td>


                <div class="table-actions">


                  <button
                    class="action-button"
                    onclick="openContentEdit(${conteudo.id})"
                    title="Editar conteúdo"
                  >

                    ✎

                  </button>


                  <button
                    class="action-button danger-action"
                    onclick="deleteContent(${conteudo.id})"
                    title="Excluir conteúdo"
                  >

                    ×

                  </button>


                </div>


              </td>


            </tr>


          `
        )
        .join("");

  };



// ======================================================
// MODAL DINÂMICO DE EDIÇÃO
// ======================================================

function createEditModal(html) {


  const oldModal =
    document.getElementById(
      "dynamic-edit-modal"
    );


  if (oldModal) {

    oldModal.remove();

  }


  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "dynamic-edit-modal";


  modal.className =
    "modal open";


  modal.innerHTML = `

    <div
      class="modal-overlay"
      onclick="closeDynamicModal()"
    ></div>


    ${html}

  `;


  document.body.appendChild(
    modal
  );

}



window.closeDynamicModal =
  function () {


    const modal =
      document.getElementById(
        "dynamic-edit-modal"
      );


    if (modal) {

      modal.remove();

    }

  };



// ======================================================
// MODAL DE CONFIRMAÇÃO
// ======================================================

function openConfirmationModal({
  title,
  name,
  description,
  confirmText
}) {


  return new Promise(
    (resolve) => {


      const existingModal =
        document.getElementById(
          "contentflow-confirmation-modal"
        );


      if (existingModal) {

        existingModal.remove();

      }


      const modal =
        document.createElement(
          "div"
        );


      modal.id =
        "contentflow-confirmation-modal";


      modal.className =
        "modal open";


      const safeTitle =
        escapeHtml(
          title
        );


      const safeName =
        escapeHtml(
          name
        );


      const safeDescription =
        escapeHtml(
          description
        );


      const safeConfirmText =
        escapeHtml(
          confirmText
        );


      modal.innerHTML = `

        <div
          class="modal-overlay"
          id="confirmation-overlay"
        ></div>


        <div
          class="modal-card confirmation-modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-title"
        >


          <div class="confirmation-modal-body">


            <div
              class="confirmation-icon"
              aria-hidden="true"
            >

              !

            </div>


            <span class="confirmation-eyebrow">

              AÇÃO IRREVERSÍVEL

            </span>


            <h3
              id="confirmation-title"
            >

              ${safeTitle}

            </h3>


            <p class="confirmation-text">

              ${safeDescription}

              <span class="confirmation-name">

                “${safeName}”

              </span>?

            </p>


            <div class="confirmation-warning">

              Depois de excluído,
              este item não poderá ser
              recuperado pelo sistema.

            </div>


          </div>


          <div class="confirmation-actions">


            <button
              type="button"
              class="secondary-button confirmation-cancel-button"
              id="confirmation-cancel"
            >

              Cancelar

            </button>


            <button
              type="button"
              class="danger-button"
              id="confirmation-submit"
            >

              ${safeConfirmText}

            </button>


          </div>


        </div>

      `;


      document.body.appendChild(
        modal
      );


      const cancelButton =
        modal.querySelector(
          "#confirmation-cancel"
        );


      const confirmButton =
        modal.querySelector(
          "#confirmation-submit"
        );


      const overlay =
        modal.querySelector(
          "#confirmation-overlay"
        );


      let finished =
        false;


      function finish(result) {


        if (finished) {

          return;

        }


        finished =
          true;


        document.removeEventListener(
          "keydown",
          handleKeyDown
        );


        modal.remove();


        resolve(
          result
        );

      }


      function handleKeyDown(event) {


        if (
          event.key ===
          "Escape"
        ) {

          finish(
            false
          );

        }

      }


      cancelButton.addEventListener(
        "click",
        () => {

          finish(
            false
          );

        }
      );


      overlay.addEventListener(
        "click",
        () => {

          finish(
            false
          );

        }
      );


      confirmButton.addEventListener(
        "click",
        () => {

          finish(
            true
          );

        }
      );


      document.addEventListener(
        "keydown",
        handleKeyDown
      );


      setTimeout(
        () => {

          confirmButton.focus();

        },
        50
      );

    }
  );

}



// ======================================================
// EDITAR CLIENTE
// ======================================================

window.openClientEdit =
  function (id) {


    const cliente =
      clientes.find(
        (item) =>
          Number(item.id) ===
          Number(id)
      );


    if (!cliente) {


      showToast(
        "Cliente não encontrado."
      );


      return;

    }


    createEditModal(`


      <div class="modal-card">


        <div class="modal-header">


          <div>


            <span class="eyebrow">

              EDITAR CLIENTE

            </span>


            <h3>

              ${cliente.nome}

            </h3>


          </div>


          <button
            class="close-modal"
            onclick="closeDynamicModal()"
          >

            ×

          </button>


        </div>


        <form
          id="edit-client-form"
        >


          <div class="form-group">


            <label>

              Nome do cliente

            </label>


            <input
              id="edit-client-name"
              type="text"
              value="${escapeInput(
                cliente.nome ||
                ""
              )}"
              required
            >


          </div>


          <div class="form-group">


            <label>

              Nicho

            </label>


            <input
              id="edit-client-niche"
              type="text"
              value="${escapeInput(
                cliente.nicho ||
                ""
              )}"
            >


          </div>


          <div class="form-grid">


            <div class="form-group">


              <label>

                Instagram

              </label>


              <input
                id="edit-client-instagram"
                type="text"
                value="${escapeInput(
                  cliente.instagram ||
                  ""
                )}"
              >


            </div>


            <div class="form-group">


              <label>

                Conteúdos / mês

              </label>


              <input
                id="edit-client-count"
                type="number"
                value="${
                  cliente.conteudos_mes ||
                  0
                }"
              >


            </div>


          </div>


          <div class="form-group">


            <label>

              Responsável

            </label>


            <input
              id="edit-client-owner"
              type="text"
              value="${escapeInput(
                cliente.responsavel ||
                ""
              )}"
            >


          </div>


          <div class="modal-actions">


            <button
              type="button"
              class="secondary-button"
              onclick="closeDynamicModal()"
            >

              Cancelar

            </button>


            <button
              type="submit"
              class="primary-button"
            >

              Salvar alterações

            </button>


          </div>


        </form>


      </div>

    `);


    document
      .getElementById(
        "edit-client-form"
      )
      .addEventListener(
        "submit",
        async (event) => {


          event.preventDefault();


          const payload = {


            nome:

              document
                .getElementById(
                  "edit-client-name"
                )
                .value
                .trim(),


            nicho:

              document
                .getElementById(
                  "edit-client-niche"
                )
                .value
                .trim(),


            instagram:

              document
                .getElementById(
                  "edit-client-instagram"
                )
                .value
                .trim(),


            conteudos_mes:

              Number(
                document
                  .getElementById(
                    "edit-client-count"
                  )
                  .value ||
                0
              ),


            responsavel:

              document
                .getElementById(
                  "edit-client-owner"
                )
                .value
                .trim()

          };


          try {


            const response =
              await fetch(
                `${API_URL}/clientes/${id}`,
                {

                  method:
                    "PUT",

                  headers: {

                    "Content-Type":
                      "application/json"

                  },

                  body:
                    JSON.stringify(
                      payload
                    )

                }
              );


            const data =
              await response.json();


            if (!response.ok) {


              throw new Error(
                data.erro ||
                "Erro ao atualizar cliente"
              );

            }


            closeDynamicModal();


            showToast(
              "Cliente atualizado com sucesso."
            );


            await Promise.all([

              loadClients(),

              loadContents(),

              loadDashboard(),

              loadUpcoming()

            ]);


          } catch (error) {


            showToast(
              error.message
            );

          }


        }
      );

  };



// ======================================================
// EXCLUIR CLIENTE
// ======================================================

window.deleteClient =
  async function (id) {


    const cliente =
      clientes.find(
        (item) =>
          Number(item.id) ===
          Number(id)
      );


    if (!cliente) {


      showToast(
        "Cliente não encontrado."
      );


      return;

    }


    const hasContents =
      conteudos.some(
        (conteudo) =>
          Number(
            conteudo.cliente_id
          ) ===
          Number(id)
      );


    if (hasContents) {


      showToast(
        "Esse cliente possui conteúdos. Exclua ou transfira os conteúdos primeiro."
      );


      return;

    }


    const confirmed =
      await openConfirmationModal({

        title:
          "Excluir cliente?",

        name:
          cliente.nome,

        description:
          "Deseja realmente excluir o cliente",

        confirmText:
          "Excluir cliente"

      });


    if (!confirmed) {

      return;

    }


    try {


      const response =
        await fetch(
          `${API_URL}/clientes/${id}`,
          {

            method:
              "DELETE"

          }
        );


      const data =
        await response.json();


      if (!response.ok) {


        throw new Error(
          data.erro ||
          "Erro ao excluir cliente"
        );

      }


      showToast(
        "Cliente excluído com sucesso."
      );


      await loadClients();


    } catch (error) {


      showToast(
        error.message
      );

    }


  };



// ======================================================
// EDITAR CONTEÚDO
// ======================================================

window.openContentEdit =
  function (id) {


    const conteudo =
      conteudos.find(
        (item) =>
          Number(item.id) ===
          Number(id)
      );


    if (!conteudo) {


      showToast(
        "Conteúdo não encontrado."
      );


      return;

    }


    const clientOptions =
      clientes
        .map(
          (cliente) => `


            <option
              value="${cliente.id}"
              ${
                Number(cliente.id) ===
                Number(
                  conteudo.cliente_id
                )

                  ? "selected"
                  : ""
              }
            >

              ${cliente.nome}

            </option>


          `
        )
        .join("");


    createEditModal(`


      <div class="modal-card modal-large">


        <div class="modal-header">


          <div>


            <span class="eyebrow">

              EDITAR CONTEÚDO

            </span>


            <h3>

              Editar conteúdo

            </h3>


          </div>


          <button
            class="close-modal"
            onclick="closeDynamicModal()"
          >

            ×

          </button>


        </div>


        <form
          id="edit-content-form"
        >


          <div class="form-group">


            <label>

              Título

            </label>


            <input
              id="edit-content-title"
              type="text"
              value="${escapeInput(
                conteudo.titulo ||
                ""
              )}"
              required
            >


          </div>


          <div class="form-grid">


            <div class="form-group">


              <label>

                Cliente

              </label>


              <select
                id="edit-content-client"
              >

                ${clientOptions}

              </select>


            </div>


            <div class="form-group">


              <label>

                Formato

              </label>


              <select
                id="edit-content-format"
              >

                ${selectOptions(
                  [
                    "Reels",
                    "Carrossel",
                    "Stories",
                    "Post estático"
                  ],
                  conteudo.formato
                )}

              </select>


            </div>


          </div>


          <div class="form-grid">


            <div class="form-group">


              <label>

                Plataforma

              </label>


              <select
                id="edit-content-platform"
              >

                ${selectOptions(
                  [
                    "Instagram",
                    "TikTok",
                    "YouTube",
                    "LinkedIn"
                  ],
                  conteudo.plataforma
                )}

              </select>


            </div>


            <div class="form-group">


              <label>

                Objetivo

              </label>


              <select
                id="edit-content-objective"
              >

                ${selectOptions(
                  [
                    "Autoridade",
                    "Educação",
                    "Conversão",
                    "Engajamento"
                  ],
                  conteudo.objetivo
                )}

              </select>


            </div>


          </div>


          <div class="form-grid">


            <div class="form-group">


              <label>

                Prioridade

              </label>


              <select
                id="edit-content-priority"
              >

                ${selectOptions(
                  [
                    "Baixa",
                    "Média",
                    "Alta"
                  ],
                  conteudo.prioridade
                )}

              </select>


            </div>


            <div class="form-group">


              <label>

                Status

              </label>


              <select
                id="edit-content-status"
              >

                ${selectOptions(
                  [
                    "Ideia",
                    "Roteiro",
                    "Gravação",
                    "Edição",
                    "Aprovação",
                    "Agendado",
                    "Publicado"
                  ],
                  conteudo.status
                )}

              </select>


            </div>


          </div>


          <div class="form-grid">


            <div class="form-group">


              <label>

                Responsável

              </label>


              <input
                id="edit-content-owner"
                type="text"
                value="${escapeInput(
                  conteudo.responsavel ||
                  ""
                )}"
              >


            </div>


            <div class="form-group">


              <label>

                Publicação

              </label>


              <input
                id="edit-content-date"
                type="date"
                value="${
                  conteudo.data_publicacao ||
                  ""
                }"
              >


            </div>


          </div>


          <div class="form-group">


            <label>

              Descrição

            </label>


            <textarea
              id="edit-content-description"
              rows="4"
            >${escapeTextarea(
              conteudo.descricao ||
              ""
            )}</textarea>


          </div>


          <div class="modal-actions">


            <button
              type="button"
              class="secondary-button"
              onclick="closeDynamicModal()"
            >

              Cancelar

            </button>


            <button
              type="submit"
              class="primary-button"
            >

              Salvar alterações

            </button>


          </div>


        </form>


      </div>

    `);


    document
      .getElementById(
        "edit-content-form"
      )
      .addEventListener(
        "submit",
        async (event) => {


          event.preventDefault();


          const payload = {


            titulo:

              document
                .getElementById(
                  "edit-content-title"
                )
                .value
                .trim(),


            cliente_id:

              Number(
                document
                  .getElementById(
                    "edit-content-client"
                  )
                  .value
              ),


            formato:

              document
                .getElementById(
                  "edit-content-format"
                )
                .value,


            plataforma:

              document
                .getElementById(
                  "edit-content-platform"
                )
                .value,


            objetivo:

              document
                .getElementById(
                  "edit-content-objective"
                )
                .value,


            responsavel:

              document
                .getElementById(
                  "edit-content-owner"
                )
                .value
                .trim(),


            prioridade:

              document
                .getElementById(
                  "edit-content-priority"
                )
                .value,


            status:

              document
                .getElementById(
                  "edit-content-status"
                )
                .value,


            data_publicacao:

              document
                .getElementById(
                  "edit-content-date"
                )
                .value,


            descricao:

              document
                .getElementById(
                  "edit-content-description"
                )
                .value
                .trim()

          };


          try {


            const response =
              await fetch(
                `${API_URL}/conteudos/${id}`,
                {

                  method:
                    "PUT",

                  headers: {

                    "Content-Type":
                      "application/json"

                  },

                  body:
                    JSON.stringify(
                      payload
                    )

                }
              );


            const data =
              await response.json();


            if (!response.ok) {


              throw new Error(
                data.erro ||
                "Erro ao atualizar conteúdo"
              );

            }


            closeDynamicModal();


            showToast(
              "Conteúdo atualizado com sucesso."
            );


            await refreshContentAreas();


          } catch (error) {


            showToast(
              error.message
            );

          }


        }
      );

  };



// ======================================================
// EXCLUIR CONTEÚDO
// ======================================================

window.deleteContent =
  async function (id) {


    const conteudo =
      conteudos.find(
        (item) =>
          Number(item.id) ===
          Number(id)
      );


    if (!conteudo) {


      showToast(
        "Conteúdo não encontrado."
      );


      return;

    }


    const confirmed =
      await openConfirmationModal({

        title:
          "Excluir conteúdo?",

        name:
          conteudo.titulo,

        description:
          "Deseja realmente excluir o conteúdo",

        confirmText:
          "Excluir conteúdo"

      });


    if (!confirmed) {

      return;

    }


    try {


      const response =
        await fetch(
          `${API_URL}/conteudos/${id}`,
          {

            method:
              "DELETE"

          }
        );


      const data =
        await response.json();


      if (!response.ok) {


        throw new Error(
          data.erro ||
          "Erro ao excluir conteúdo"
        );

      }


      showToast(
        "Conteúdo excluído com sucesso."
      );


      await refreshContentAreas();


    } catch (error) {


      showToast(
        error.message
      );

    }


  };



// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

function selectOptions(
  options,
  current
) {


  return options
    .map(
      (option) => `


        <option
          value="${option}"
          ${
            option === current
              ? "selected"
              : ""
          }
        >

          ${option}

        </option>


      `
    )
    .join("");

}



function escapeInput(value) {


  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    );

}



function escapeTextarea(value) {


  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    );

}



function escapeHtml(value) {


  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}



// ======================================================
// ATUALIZA A INTERFACE JÁ EXISTENTE
// ======================================================

setTimeout(
  () => {


    renderClients(
      clientes
    );


    renderContentsTable(
      conteudos
    );


  },
  300
);