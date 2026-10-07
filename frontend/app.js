const API_URL = "http://localhost:3000";


// ======================================================
// FUNÇÃO AUXILIAR - GET SEM CACHE
// ======================================================

async function fetchFresh(url) {

  return fetch(
    `${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`,
    {
      cache: "no-store"
    }
  );

}


// ======================================================
// ESTADO GLOBAL
// ======================================================

let clientes = [];

let conteudos = [];

let selectedClientId =
  null;


// ======================================================
// ESTADO DE NAVEGAÇÃO
// ======================================================

const savedPage =
  sessionStorage.getItem(
    "contentflow-current-page"
  ) ||
  "dashboard";


const savedClientId =
  sessionStorage.getItem(
    "contentflow-current-client"
  );


if (
  savedClientId
) {

  selectedClientId =
    Number(
      savedClientId
    );

}


let dashboardAttentionFilter =
  null;


// ======================================================
// CLIENTE ATUAL
// ======================================================

function getSelectedClient() {

  if (!selectedClientId) {

    return null;

  }


  return (
    clientes.find(
      (cliente) =>
        Number(cliente.id) ===
        Number(selectedClientId)
    ) ||
    null
  );

}


// ======================================================
// CONTEÚDOS VISÍVEIS
// ======================================================

function getVisibleContents() {

  if (!selectedClientId) {

    return conteudos;

  }


  return conteudos.filter(
    (conteudo) =>
      Number(
        conteudo.cliente_id
      ) ===
      Number(
        selectedClientId
      )
  );

}


// ======================================================
// PROTEGER TEXTO NO HTML
// ======================================================

function safeText(value) {

  return String(
    value ?? ""
  )

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
// NAVEGAÇÃO
// ======================================================

const menuItems =
  document.querySelectorAll(
    ".menu-item[data-page]"
  );


const pages =
  document.querySelectorAll(
    ".page"
  );


const pageTitle =
  document.getElementById(
    "page-title"
  );


const pageNames = {

  dashboard:
    "Dashboard",

  clientes:
    "Clientes",

  conteudos:
    "Conteúdos",

  pipeline:
    "Fluxo de Conteúdo",

  calendario:
    "Calendário",

  contentlab:
    "Content Lab",

  configuracoes:
    "Configurações"

};


// ======================================================
// ATIVAR ITEM DA SIDEBAR
// ======================================================

function setActiveMenu(page) {

  menuItems.forEach(
    (menu) => {

      menu.classList.toggle(
        "active",
        menu.dataset.page === page
      );

    }
  );

}


// ======================================================
// MOSTRAR PÁGINA
// ======================================================

function showPage(page) {

  pages.forEach(
    (section) => {

      section.classList.toggle(
        "active",
        section.id === page
      );

    }
  );


  sessionStorage.setItem(
    "contentflow-current-page",
    page
  );


  if (
    selectedClientId
  ) {

    sessionStorage.setItem(
      "contentflow-current-client",
      String(
        selectedClientId
      )
    );

  } else {

    sessionStorage.removeItem(
      "contentflow-current-client"
    );

  }


  if (pageTitle) {

    const cliente =
      getSelectedClient();


    if (

      cliente &&

      [
        "dashboard",
        "conteudos",
        "pipeline",
        "calendario"
      ].includes(page)

    ) {

      pageTitle.textContent =
        `${pageNames[page]} / ${cliente.nome}`;

    } else {

      pageTitle.textContent =
        pageNames[page] ||
        page;

    }

  }


  setActiveMenu(
    page
  );

}


// ======================================================
// NAVEGAR
// ======================================================

async function navigateTo(
  page,
  options = {}
) {

  const {
    preserveClient = false
  } = options;


  dashboardAttentionFilter =
    null;


  if (!preserveClient) {

    selectedClientId =
      null;

  }


  showPage(
    page
  );


  await refreshCurrentPage(
    page
  );

}


// ======================================================
// CLIQUE NA SIDEBAR
// ======================================================

menuItems.forEach(
  (item) => {

    item.addEventListener(
      "click",
      async () => {

        const page =
          item.dataset.page;


        await navigateTo(
          page,
          {
            preserveClient:
              false
          }
        );

      }
    );

  }
);


// ======================================================
// TOAST
// ======================================================

function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


  const toastMessage =
    document.getElementById(
      "toast-message"
    );


  if (
    !toast ||
    !toastMessage
  ) {

    return;

  }


  toastMessage.textContent =
    message;


  toast.classList.add(
    "show"
  );


  setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );

    },
    3000
  );

}


// ======================================================
// MODAIS
// ======================================================

const clientModal =
  document.getElementById(
    "client-modal"
  );


const contentModal =
  document.getElementById(
    "content-modal"
  );


const newClientButton =
  document.getElementById(
    "new-client-button"
  );


const newContentButton =
  document.getElementById(
    "new-content-button"
  );


// ======================================================
// ABRIR NOVO CLIENTE
// ======================================================

if (
  newClientButton &&
  clientModal
) {

  newClientButton.addEventListener(
    "click",
    () => {

      clientModal.classList.add(
        "open"
      );

    }
  );

}


// ======================================================
// BOTÃO GLOBAL NOVO CONTEÚDO
// ======================================================

if (
  newContentButton &&
  contentModal
) {

  newContentButton.addEventListener(
    "click",
    () => {

      prepareContentModalForCurrentClient();


      contentModal.classList.add(
        "open"
      );

    }
  );

}


// ======================================================
// BOTÕES NOVO CONTEÚDO
// ======================================================

document

  .querySelectorAll(
    ".new-content-trigger"
  )

  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          prepareContentModalForCurrentClient();


          if (contentModal) {

            contentModal.classList.add(
              "open"
            );

          }

        }
      );

    }
  );


// ======================================================
// FECHAR MODAIS
// ======================================================

document

  .querySelectorAll(
    ".close-modal"
  )

  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const modalId =
            button.dataset.modal;


          if (modalId) {

            document
              .getElementById(
                modalId
              )
              ?.classList
              .remove(
                "open"
              );

          }

        }
      );

    }
  );


// ======================================================
// FECHAR CLICANDO FORA
// ======================================================

document

  .querySelectorAll(
    ".modal-overlay"
  )

  .forEach(
    (overlay) => {

      overlay.addEventListener(
        "click",
        () => {

          overlay
            .parentElement
            ?.classList
            .remove(
              "open"
            );

        }
      );

    }
  );


// ======================================================
// PREPARAR MODAL PARA CLIENTE ATUAL
// ======================================================

function prepareContentModalForCurrentClient() {

  if (!selectedClientId) {

    return;

  }


  const contentClient =
    document.getElementById(
      "content-client"
    );


  if (contentClient) {

    contentClient.value =
      String(
        selectedClientId
      );

  }

}


// ======================================================
// RESUMO DO DASHBOARD POR CLIENTE
// ======================================================

function calculateSummary(
  lista
) {

  return {

    total:
      lista.length,


    ideias:
      lista.filter(
        (item) =>
          item.status ===
          "Ideia"
      ).length,


    roteiros:
      lista.filter(
        (item) =>
          item.status ===
          "Roteiro"
      ).length,


    gravacao:
      lista.filter(
        (item) =>
          item.status ===
          "Gravação"
      ).length,


    edicao:
      lista.filter(
        (item) =>
          item.status ===
          "Edição"
      ).length,


    aprovacao:
      lista.filter(
        (item) =>
          item.status ===
          "Aprovação"
      ).length,


    agendados:
      lista.filter(
        (item) =>
          item.status ===
          "Agendado"
      ).length,


    publicados:
      lista.filter(
        (item) =>
          item.status ===
          "Publicado"
      ).length

  };

}


// ======================================================
// OBTER TOTAL DE CONTEÚDOS ATIVOS
// ======================================================

function getActiveContents(
  lista = conteudos
) {

  return lista.filter(
    (conteudo) =>
      conteudo.status !==
      "Publicado"
  );

}


// ======================================================
// OBTER CONTEÚDOS POR STATUS
// ======================================================

function getContentsByStatus(
  status,
  lista = conteudos
) {

  return lista.filter(
    (conteudo) =>
      conteudo.status ===
      status
  );

}


// ======================================================
// DASHBOARD
// ======================================================

async function loadDashboard() {

  try {

    let data;


    if (selectedClientId) {

      data =
        calculateSummary(
          getVisibleContents()
        );

    } else {

      const response =
        await fetchFresh(
          `${API_URL}/dashboard/resumo`
        );


      if (!response.ok) {

        throw new Error(
          "Erro ao carregar dashboard"
        );

      }


      data =
        await response.json();

    }


    const total =
      Number(
        data.total
      ) || 0;


    const ideias =
      Number(
        data.ideias
      ) || 0;


    const roteiros =
      Number(
        data.roteiros
      ) || 0;


    const edicao =
      Number(
        data.edicao
      ) || 0;


    const aprovacao =
      Number(
        data.aprovacao
      ) || 0;


    const publicados =
      Number(
        data.publicados
      ) || 0;


    const activeContents =
      getActiveContents(
        getVisibleContents()
      ).length;


    setText(
      "stat-total",
      activeContents
    );


    setText(
      "stat-edicao",
      edicao
    );


    setText(
      "stat-aprovacao",
      aprovacao
    );


    setText(
      "stat-publicados",
      publicados
    );


    setText(
      "progress-ideias",
      ideias
    );


    setText(
      "progress-roteiro",
      roteiros
    );


    setText(
      "progress-edicao",
      edicao
    );


    setText(
      "progress-aprovacao",
      aprovacao
    );


    updateProgressBar(
      "progress-ideias",
      ideias,
      total
    );


    updateProgressBar(
      "progress-roteiro",
      roteiros,
      total
    );


    updateProgressBar(
      "progress-edicao",
      edicao,
      total
    );


    updateProgressBar(
      "progress-aprovacao",
      aprovacao,
      total
    );


    updateDashboardHeading();


    renderDashboardClients();


    renderDashboardContext();


    configureDashboardStatActions();


    configureDashboardAttentionActions();


    updateDashboardAttentionCounts();


  } catch (error) {

    console.error(
      "Erro ao carregar dashboard:",
      error
    );

  }

}


// ======================================================
// ALTERAR TEXTO
// ======================================================

function setText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.textContent =
      value;

  }

}


// ======================================================
// BARRA DE PROGRESSO
// ======================================================

function updateProgressBar(
  elementId,
  value,
  total
) {

  const numberElement =
    document.getElementById(
      elementId
    );


  if (!numberElement) {

    return;

  }


  const row =
    numberElement.closest(
      ".production-row"
    );


  if (!row) {

    return;

  }


  const bar =
    row.querySelector(
      ".progress-bar"
    );


  if (!bar) {

    return;

  }


  let percentage =
    0;


  if (
    total > 0 &&
    value > 0
  ) {

    percentage =
      Math.max(
        4,
        Math.round(
          (value / total) *
          100
        )
      );

  }


  bar.style.width =
    `${percentage}%`;

}


// ======================================================
// TEXTO DO DASHBOARD
// ======================================================

function updateDashboardHeading() {

  const dashboard =
    document.getElementById(
      "dashboard"
    );


  if (!dashboard) {

    return;

  }


  const heroTitle =
    dashboard.querySelector(
      ".hero h3"
    );


  const heroText =
    dashboard.querySelector(
      ".hero p"
    );


  const cliente =
    getSelectedClient();


  const currentHour =
    new Date().getHours();


  let greeting =
    "Bom dia";


  if (
    currentHour >= 12 &&
    currentHour < 18
  ) {

    greeting =
      "Boa tarde";

  }


  if (
    currentHour >= 18 ||
    currentHour < 5
  ) {

    greeting =
      "Boa noite";

  }


  const agencyName =
    localStorage.getItem(
      "contentflow-agency-name"
    ) ||
    "Delta Produtora";


  if (heroTitle) {

    heroTitle.textContent =
      cliente

        ? cliente.nome

        : `${greeting}, ${agencyName}.`;

  }


  if (heroText) {

    heroText.textContent =
      cliente

        ? `Aqui está a operação de conteúdo de ${cliente.nome}.`

        : "Aqui é o que está acontecendo na operação de conteúdo da agência.";

  }

}


// ======================================================
// DASHBOARD - ÁREA DE CLIENTES
// ======================================================

function ensureDashboardClientsPanel() {

  const dashboard =
    document.getElementById(
      "dashboard"
    );


  if (!dashboard) {

    return null;

  }


  let panel =
    document.getElementById(
      "dashboard-clients-panel"
    );


  if (!panel) {

    panel =
      document.createElement(
        "article"
      );


    panel.id =
      "dashboard-clients-panel";


    panel.className =
      "panel dashboard-clients-panel";


    panel.innerHTML = `

      <div class="panel-header">

        <div>

          <span class="eyebrow">
            CLIENTES
          </span>

          <h4>
            Sua operação por cliente
          </h4>

        </div>


        <button
          type="button"
          class="primary-button"
          id="dashboard-new-client-button"
        >

          + Novo cliente

        </button>

      </div>


      <div
        id="dashboard-clients-grid"
        class="dashboard-clients-grid"
      ></div>

    `;


    dashboard.appendChild(
      panel
    );


    panel
      .querySelector(
        "#dashboard-new-client-button"
      )
      ?.addEventListener(
        "click",
        () => {

          clientModal
            ?.classList
            .add(
              "open"
            );

        }
      );

  }


  return panel;

}
// ======================================================
// RENDERIZAR CLIENTES NO DASHBOARD
// ======================================================

function renderDashboardClients() {

  const panel =
    ensureDashboardClientsPanel();


  if (!panel) {

    return;

  }


  panel.style.display =
    selectedClientId

      ? "none"

      : "block";


  if (selectedClientId) {

    return;

  }


  const container =
    document.getElementById(
      "dashboard-clients-grid"
    );


  if (!container) {

    return;

  }


  if (!clientes.length) {

    container.innerHTML = `

      <div class="empty-state">

        Nenhum cliente cadastrado.

      </div>

    `;


    return;

  }


  container.innerHTML =
    clientes

      .map(
        (cliente) => {


          const initials =
            cliente.nome

              .split(" ")

              .map(
                (word) =>
                  word.charAt(0)
              )

              .join("")

              .slice(
                0,
                2
              )

              .toUpperCase();


          return `

            <article class="dashboard-client-card">


              <button
                type="button"
                class="dashboard-client-main"
                data-client-dashboard="${cliente.id}"
              >


                <div class="client-avatar">

                  ${safeText(initials)}

                </div>


                <div class="dashboard-client-info">

                  <strong>

                    ${safeText(cliente.nome)}

                  </strong>


                  <span>

                    ${safeText(
                      cliente.nicho ||
                      "Nicho não informado"
                    )}

                  </span>

                </div>


                <span class="dashboard-client-arrow">

                  →

                </span>


              </button>


              <div class="dashboard-client-shortcuts">


                <button
                  type="button"
                  data-client-view="conteudos"
                  data-client-id="${cliente.id}"
                >

                  Conteúdos

                </button>


                <button
                  type="button"
                  data-client-view="pipeline"
                  data-client-id="${cliente.id}"
                >

                  Fluxo

                </button>


                <button
                  type="button"
                  data-client-view="calendario"
                  data-client-id="${cliente.id}"
                >

                  Calendário

                </button>


              </div>


              <div class="dashboard-client-admin-actions">


                <button
                  type="button"
                  class="action-button"
                  onclick="openClientEdit(${cliente.id})"
                  title="Editar cliente"
                >

                  ✎

                </button>


                <button
                  type="button"
                  class="action-button danger-action"
                  onclick="deleteClient(${cliente.id})"
                  title="Excluir cliente"
                >

                  ×

                </button>


              </div>


            </article>

          `;

        }
      )

      .join("");


  container

    .querySelectorAll(
      "[data-client-dashboard]"
    )

    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          async () => {


            dashboardAttentionFilter =
              null;


            selectedClientId =
              Number(
                button.dataset
                  .clientDashboard
              );


            showPage(
              "dashboard"
            );


            await refreshCurrentPage(
              "dashboard"
            );

          }
        );

      }
    );


  container

    .querySelectorAll(
      "[data-client-view]"
    )

    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          async () => {


            dashboardAttentionFilter =
              null;


            selectedClientId =
              Number(
                button.dataset
                  .clientId
              );


            const page =
              button.dataset
                .clientView;


            showPage(
              page
            );


            await refreshCurrentPage(
              page
            );

          }
        );

      }
    );

}


// ======================================================
// WORKSPACE DO CLIENTE
// ======================================================

async function openClientWorkspace(
  clientId,
  page = "dashboard"
) {

  const cliente =
    clientes.find(
      (item) =>
        Number(item.id) ===
        Number(clientId)
    );


  if (!cliente) {

    showToast(
      "Cliente não encontrado."
    );

    return;

  }


  selectedClientId =
    Number(clientId);


  dashboardAttentionFilter =
    null;


  showPage(
    page
  );


  await refreshCurrentPage(
    page
  );

}


// ======================================================
// SAIR DO WORKSPACE DO CLIENTE
// ======================================================

async function leaveClientWorkspace(
  page = "dashboard"
) {

  dashboardAttentionFilter =
    null;


  selectedClientId =
    null;


  showPage(
    page
  );


  await refreshCurrentPage(
    page
  );

}


// ======================================================
// BARRA DO CLIENTE
// ======================================================

function createClientWorkspaceBar(
  currentPage
) {

  const cliente =
    getSelectedClient();


  if (!cliente) {

    return null;

  }


  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "client-workspace-bar";


  wrapper.innerHTML = `

    <div class="client-workspace-main">


      <button
        type="button"
        class="client-back-button"
        data-client-back
      >

        ← Todos os clientes

      </button>


      <div class="client-workspace-identity">


        <div class="client-avatar">

          ${safeText(
            cliente.nome
              .split(" ")
              .map(
                (word) =>
                  word.charAt(0)
              )
              .join("")
              .slice(0, 2)
              .toUpperCase()
          )}

        </div>


        <div>


          <strong>

            ${safeText(
              cliente.nome
            )}

          </strong>


          <span>

            ${safeText(
              cliente.nicho ||
              "Nicho não informado"
            )}

          </span>


        </div>


      </div>


    </div>


    <div class="client-workspace-navigation">


      <button
        type="button"
        data-client-page="dashboard"
        class="${
          currentPage ===
          "dashboard"

            ? "active"
            : ""
        }"
      >

        Dashboard

      </button>


      <button
        type="button"
        data-client-page="conteudos"
        class="${
          currentPage ===
          "conteudos"

            ? "active"
            : ""
        }"
      >

        Conteúdos

      </button>


      <button
        type="button"
        data-client-page="pipeline"
        class="${
          currentPage ===
          "pipeline"

            ? "active"
            : ""
        }"
      >

        Fluxo de Conteúdo

      </button>


      <button
        type="button"
        data-client-page="calendario"
        class="${
          currentPage ===
          "calendario"

            ? "active"
            : ""
        }"
      >

        Calendário

      </button>


    </div>

  `;


  wrapper
    .querySelector(
      "[data-client-back]"
    )
    ?.addEventListener(
      "click",
      async () => {

        await leaveClientWorkspace(
          "dashboard"
        );

      }
    );


  wrapper
    .querySelectorAll(
      "[data-client-page]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          async () => {


            dashboardAttentionFilter =
              null;


            const page =
              button.dataset
                .clientPage;


            showPage(
              page
            );


            await refreshCurrentPage(
              page
            );

          }
        );

      }
    );


  return wrapper;

}


// ======================================================
// CONTEXTO DO DASHBOARD DO CLIENTE
// ======================================================

function renderDashboardContext() {

  const dashboard =
    document.getElementById(
      "dashboard"
    );


  if (!dashboard) {

    return;

  }


  const oldBar =
    dashboard.querySelector(
      ".client-workspace-bar"
    );


  if (oldBar) {

    oldBar.remove();

  }


  if (!selectedClientId) {

    return;

  }


  const bar =
    createClientWorkspaceBar(
      "dashboard"
    );


  if (!bar) {

    return;

  }


  dashboard.prepend(
    bar
  );

}


// ======================================================
// PREPARAR PÁGINAS FILTRADAS POR CLIENTE
// ======================================================

function ensureClientScopedPage(
  pageId
) {

  const section =
    document.getElementById(
      pageId
    );


  if (!section) {

    return null;

  }


  if (
    section.dataset
      .clientScopeReady ===
    "true"
  ) {

    return section;

  }


  const originalChildren =
    Array.from(
      section.children
    );


  originalChildren.forEach(
    (child) => {

      child.classList.add(
        "client-page-original-content"
      );

    }
  );


  const selector =
    document.createElement(
      "div"
    );


  selector.className =
    "client-selector-view";


  selector.dataset
    .clientSelectorFor =
    pageId;


  section.prepend(
    selector
  );


  section.dataset
    .clientScopeReady =
    "true";


  return section;

}


// ======================================================
// TÍTULOS DA SELEÇÃO DE CLIENTE
// ======================================================

function getClientSelectorCopy(
  page
) {

  const copies = {

    conteudos: {

      eyebrow:
        "CONTEÚDOS",

      title:
        "Escolha um cliente",

      description:
        "Selecione um cliente para visualizar e gerenciar seus conteúdos."

    },


    pipeline: {

      eyebrow:
        "FLUXO DE CONTEÚDO",

      title:
        "Escolha um cliente",

      description:
        "Selecione um cliente para acompanhar seu fluxo de produção."

    },


    calendario: {

      eyebrow:
        "CALENDÁRIO EDITORIAL",

      title:
        "Escolha um cliente",

      description:
        "Selecione um cliente para visualizar seu calendário de publicações."

    }

  };


  return (
    copies[page] ||
    copies.conteudos
  );

}


// ======================================================
// RENDERIZAR SELEÇÃO DE CLIENTES
// ======================================================

function renderClientSelector(
  page
) {

  const section =
    ensureClientScopedPage(
      page
    );


  if (!section) {

    return;

  }


  const selector =
    section.querySelector(
      ".client-selector-view"
    );


  const originalContent =
    section.querySelectorAll(
      ".client-page-original-content"
    );


  if (!selector) {

    return;

  }


  // ==================================================
  // CLIENTE SELECIONADO
  // ==================================================

  if (selectedClientId) {


    selector.style.display =
      "none";


    originalContent.forEach(
      (element) => {

        element.style.display =
          "";

      }
    );


    renderClientPageContext(
      page
    );


    return;

  }


  // ==================================================
  // SEM CLIENTE SELECIONADO
  // ==================================================

  removeClientPageContext(
    page
  );


  originalContent.forEach(
    (element) => {

      element.style.display =
        "none";

    }
  );


  selector.style.display =
    "block";


  const copy =
    getClientSelectorCopy(
      page
    );


  selector.innerHTML = `

    <div class="client-selector-header">


      <span class="eyebrow">

        ${safeText(
          copy.eyebrow
        )}

      </span>


      <h3>

        ${safeText(
          copy.title
        )}

      </h3>


      <p>

        ${safeText(
          copy.description
        )}

      </p>


    </div>


    <div
      class="client-selector-grid"
    >

      ${
        clientes.length

          ? clientes
              .map(
                (cliente) => {


                  const initials =
                    cliente.nome

                      .split(" ")

                      .map(
                        (word) =>
                          word.charAt(0)
                      )

                      .join("")

                      .slice(
                        0,
                        2
                      )

                      .toUpperCase();


                  return `

                    <button
                      type="button"
                      class="client-selector-card"
                      data-select-client="${cliente.id}"
                    >


                      <div class="client-avatar">

                        ${safeText(
                          initials
                        )}

                      </div>


                      <div class="client-selector-info">


                        <strong>

                          ${safeText(
                            cliente.nome
                          )}

                        </strong>


                        <span>

                          ${safeText(
                            cliente.nicho ||
                            "Nicho não informado"
                          )}

                        </span>


                        <small>

                          ${
                            Number(
                              cliente
                                .conteudos_mes
                            ) || 0
                          }
                          conteúdos/mês

                        </small>


                      </div>


                      <span class="client-selector-arrow">

                        →

                      </span>


                    </button>

                  `;

                }
              )
              .join("")

          : `

              <div class="empty-state">

                Nenhum cliente cadastrado.

              </div>

            `
      }

    </div>

  `;


  selector
    .querySelectorAll(
      "[data-select-client]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          async () => {


            dashboardAttentionFilter =
              null;


            await openClientWorkspace(
              Number(
                button.dataset
                  .selectClient
              ),
              page
            );

          }
        );

      }
    );

}


// ======================================================
// CONTEXTO INTERNO DA PÁGINA DO CLIENTE
// ======================================================

function renderClientPageContext(
  page
) {

  const section =
    document.getElementById(
      page
    );


  if (!section) {

    return;

  }


  removeClientPageContext(
    page
  );


  const bar =
    createClientWorkspaceBar(
      page
    );


  if (!bar) {

    return;

  }


  section.prepend(
    bar
  );

}


// ======================================================
// REMOVER CONTEXTO ANTIGO
// ======================================================

function removeClientPageContext(
  page
) {

  const section =
    document.getElementById(
      page
    );


  if (!section) {

    return;

  }


  section
    .querySelector(
      ".client-workspace-bar"
    )
    ?.remove();

}


// ======================================================
// PRÓXIMOS CONTEÚDOS
// ======================================================

async function loadUpcoming() {

  try {


    let data = [];


    if (selectedClientId) {


      data =
        getVisibleContents()

          .filter(
            (item) =>
              item.data_publicacao
          )

          .sort(
            (a, b) => {

              return String(
                a.data_publicacao
              ).localeCompare(
                String(
                  b.data_publicacao
                )
              );

            }
          )

          .slice(
            0,
            5
          );


    } else {


      const response =
        await fetchFresh(
          `${API_URL}/dashboard/proximos`
        );


      if (!response.ok) {

        throw new Error(
          "Erro ao carregar próximos conteúdos"
        );

      }


      data =
        await response.json();

    }


    const container =
      document.getElementById(
        "upcoming-list"
      );


    if (!container) {

      return;

    }


    if (!data.length) {


      container.innerHTML = `

        <div class="empty-state">

          Nenhum conteúdo agendado.

        </div>

      `;


      return;

    }


    container.innerHTML =
      data

        .map(
          (item) => `


            <div class="upcoming-item">


              <strong>

                ${safeText(
                  item.titulo
                )}

              </strong>


              <span>


                ${safeText(
                  item.cliente_nome ||
                  getSelectedClient()
                    ?.nome ||
                  "Sem cliente"
                )}


                •


                ${formatDate(
                  item.data_publicacao
                )}


              </span>


            </div>


          `
        )

        .join("");


  } catch (error) {


    console.error(
      "Erro ao carregar próximos conteúdos:",
      error
    );

  }

}
// ======================================================
// FORMATAR DATA
// ======================================================

function formatDate(
  dateString
) {

  if (!dateString) {

    return "Sem data";

  }


  const date =
    new Date(
      `${dateString}T00:00:00`
    );


  return date.toLocaleDateString(
    "pt-BR"
  );

}


// ======================================================
// CARREGAR CLIENTES
// ======================================================

async function loadClients() {

  try {


    const response =
      await fetchFresh(
        `${API_URL}/clientes`
      );


    if (!response.ok) {

      throw new Error(
        "Erro ao carregar clientes"
      );

    }


    clientes =
      await response.json();


    const clientsGrid =
      document.getElementById(
        "clients-grid"
      );


    if (
      clientsGrid &&
      typeof renderClients ===
        "function"
    ) {

      renderClients(
        clientes
      );

    }


    fillClientSelects();


    renderDashboardClients();


    [
      "conteudos",
      "pipeline",
      "calendario"
    ].forEach(
      (page) => {

        const section =
          document.getElementById(
            page
          );


        if (
          section &&
          section.dataset
            .clientScopeReady ===
            "true"
        ) {

          renderClientSelector(
            page
          );

        }

      }
    );


  } catch (error) {


    console.error(
      "Erro ao carregar clientes:",
      error
    );

  }

}


// ======================================================
// PREENCHER SELECTS DE CLIENTES
// ======================================================

function fillClientSelects() {

  const contentClient =
    document.getElementById(
      "content-client"
    );


  const labClient =
    document.getElementById(
      "lab-client"
    );


  const options =
    clientes

      .map(
        (cliente) => `

          <option
            value="${cliente.id}"
          >

            ${safeText(
              cliente.nome
            )}

          </option>

        `
      )

      .join("");


  if (contentClient) {

    const previousValue =
      contentClient.value;


    contentClient.innerHTML = `

      <option value="">

        Selecione

      </option>

      ${options}

    `;


    if (selectedClientId) {

      contentClient.value =
        String(
          selectedClientId
        );

    } else if (
      previousValue
    ) {

      contentClient.value =
        previousValue;

    }

  }


  if (labClient) {

    const previousValue =
      labClient.value;


    labClient.innerHTML = `

      <option value="">

        Selecione o cliente

      </option>

      ${options}

    `;


    if (
      previousValue
    ) {

      labClient.value =
        previousValue;

    }

  }

}


// ======================================================
// CARREGAR CONTEÚDOS
// ======================================================

async function loadContents() {

  try {


    const response =
      await fetchFresh(
        `${API_URL}/conteudos`
      );


    if (!response.ok) {

      throw new Error(
        "Erro ao carregar conteúdos"
      );

    }


    conteudos =
      await response.json();


    renderCurrentContentViews();


  } catch (error) {


    console.error(
      "Erro ao carregar conteúdos:",
      error
    );

  }

}


// ======================================================
// RENDERIZAR VIEWS COM FILTRO DE CLIENTE
// ======================================================

function renderCurrentContentViews() {

  const lista =
    getVisibleContents();


  if (
    typeof renderContentsTable ===
      "function"
  ) {

    if (
      dashboardAttentionFilter
    ) {

      applyContentFilters();

    } else {

      renderContentsTable(
        lista
      );

    }

  }


  renderKanban(
    lista
  );


  renderCalendar(
    lista
  );

}


// ======================================================
// ATUALIZAR PÁGINA ATUAL
// ======================================================

async function refreshCurrentPage(
  page
) {


  switch (page) {


    case "dashboard":


      await Promise.all([

        loadDashboard(),

        loadUpcoming()

      ]);


      configureDashboardStatActions();


      configureDashboardAttentionActions();


      updateDashboardAttentionCounts();


      break;


    case "conteudos":


      renderClientSelector(
        "conteudos"
      );


      if (
        selectedClientId ||
        dashboardAttentionFilter
      ) {

        applyContentFilters();

      }


      break;


    case "pipeline":


      dashboardAttentionFilter =
        null;


      renderClientSelector(
        "pipeline"
      );


      if (selectedClientId) {

        renderKanban(
          getVisibleContents()
        );

      }


      break;


    case "calendario":


      dashboardAttentionFilter =
        null;


      renderClientSelector(
        "calendario"
      );


      if (selectedClientId) {

        renderCalendar(
          getVisibleContents()
        );

      }


      break;


    case "contentlab":


      dashboardAttentionFilter =
        null;


      fillClientSelects();


      break;


    case "configuracoes":


      dashboardAttentionFilter =
        null;


      if (
        typeof loadContentFlowSettings ===
        "function"
      ) {

        loadContentFlowSettings();

      }


      break;

  }

}


// ======================================================
// CADASTRAR CLIENTE
// ======================================================

const clientForm =
  document.getElementById(
    "client-form"
  );


if (clientForm) {

  clientForm.addEventListener(
    "submit",
    async (event) => {


      event.preventDefault();


      const payload = {


        nome:

          document
            .getElementById(
              "client-name"
            )
            .value
            .trim(),


        nicho:

          document
            .getElementById(
              "client-niche"
            )
            .value
            .trim(),


        instagram:

          document
            .getElementById(
              "client-instagram"
            )
            .value
            .trim(),


        conteudos_mes:

          Number(
            document
              .getElementById(
                "client-content-count"
              )
              .value ||
            0
          ),


        responsavel:

          document
            .getElementById(
              "client-owner"
            )
            .value
            .trim()

      };


      try {


        const response =
          await fetch(
            `${API_URL}/clientes`,
            {

              method:
                "POST",


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
            "Erro ao cadastrar cliente"
          );

        }


        showToast(
          "Cliente cadastrado com sucesso."
        );


        clientModal
          ?.classList
          .remove(
            "open"
          );


        event.target.reset();


        await Promise.all([

          loadClients(),

          loadDashboard()

        ]);


      } catch (error) {


        showToast(
          error.message
        );

      }


    }
  );

}


// ======================================================
// CADASTRAR CONTEÚDO
// ======================================================

const contentForm =
  document.getElementById(
    "content-form"
  );


if (contentForm) {

  contentForm.addEventListener(
    "submit",
    async (event) => {


      event.preventDefault();


      const clientField =
        document.getElementById(
          "content-client"
        );


      const clienteId =
        selectedClientId ||

        Number(
          clientField?.value
        );


      if (!clienteId) {

        showToast(
          "Selecione um cliente."
        );

        return;

      }


      const payload = {


        titulo:

          document
            .getElementById(
              "content-title"
            )
            .value
            .trim(),


        cliente_id:

          Number(
            clienteId
          ),


        formato:

          document
            .getElementById(
              "content-format"
            )
            .value,


        plataforma:

          document
            .getElementById(
              "content-platform"
            )
            .value,


        objetivo:

          document
            .getElementById(
              "content-objective"
            )
            .value,


        responsavel:

          document
            .getElementById(
              "content-owner"
            )
            .value
            .trim(),


        prioridade:

          document
            .getElementById(
              "content-priority"
            )
            .value,


        status:

          document
            .getElementById(
              "content-status"
            )
            .value,


        data_publicacao:

          document
            .getElementById(
              "content-date"
            )
            .value,


        descricao:

          document
            .getElementById(
              "content-description"
            )
            .value
            .trim()

      };


      try {


        const response =
          await fetch(
            `${API_URL}/conteudos`,
            {

              method:
                "POST",


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
            "Erro ao criar conteúdo"
          );

        }


        showToast(
          "Conteúdo criado com sucesso."
        );


        contentModal
          ?.classList
          .remove(
            "open"
          );


        event.target.reset();


        await refreshContentAreas();


        if (selectedClientId) {

          prepareContentModalForCurrentClient();

        }


      } catch (error) {


        showToast(
          error.message
        );

      }


    }
  );

}


// ======================================================
// ATUALIZAÇÃO GLOBAL
// ======================================================

async function refreshContentAreas() {


  await Promise.all([

    loadContents(),

    loadDashboard(),

    loadUpcoming()

  ]);


  const activePage =
    document.querySelector(
      ".page.active"
    )?.id;


  if (activePage) {

    await refreshCurrentPage(
      activePage
    );

  }

}


// ======================================================
// FLUXO DE CONTEÚDO
// ======================================================

function renderKanban(
  lista
) {


  document

    .querySelectorAll(
      ".kanban-list"
    )

    .forEach(
      (list) => {

        list.innerHTML =
          "";

      }
    );


  lista.forEach(
    (conteudo) => {


      const column =
        document.querySelector(

          `.kanban-column[data-status="${conteudo.status}"] .kanban-list`

        );


      if (!column) {

        return;

      }


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "kanban-card";


      card.draggable =
        true;


      card.dataset.id =
        conteudo.id;


      card.innerHTML = `

        <h5>

          ${safeText(
            conteudo.titulo
          )}

        </h5>


        <p>

          ${safeText(
            conteudo.formato ||
            "Sem formato"
          )}

          •

          ${safeText(
            conteudo.prioridade ||
            "Sem prioridade"
          )}

        </p>


        ${
          !selectedClientId

            ? `

                <p>

                  ${safeText(
                    conteudo.cliente_nome ||
                    "Sem cliente"
                  )}

                </p>

              `

            : ""
        }

      `;


      card.addEventListener(
        "dragstart",
        () => {

          card.classList.add(
            "dragging"
          );

        }
      );


      card.addEventListener(
        "dragend",
        () => {

          card.classList.remove(
            "dragging"
          );

        }
      );


      column.appendChild(
        card
      );

    }
  );


  updateKanbanCounts();

}


// ======================================================
// DRAG AND DROP
// ======================================================

document

  .querySelectorAll(
    ".kanban-list"
  )

  .forEach(
    (list) => {


      list.addEventListener(
        "dragover",
        (event) => {


          event.preventDefault();


          const draggingCard =
            document.querySelector(
              ".dragging"
            );


          if (draggingCard) {

            list.appendChild(
              draggingCard
            );

          }


        }
      );


      list.addEventListener(
        "drop",
        async () => {


          const card =
            list.querySelector(
              ".dragging"
            );


          if (!card) {

            return;

          }


          const newStatus =
            list

              .closest(
                ".kanban-column"
              )

              ?.dataset
              .status;


          const id =
            card.dataset.id;


          if (
            !id ||
            !newStatus
          ) {

            return;

          }


          try {


            const response =
              await fetch(

                `${API_URL}/conteudos/${id}/status`,

                {

                  method:
                    "PATCH",


                  headers: {

                    "Content-Type":
                      "application/json"

                  },


                  body:
                    JSON.stringify({

                      status:
                        newStatus

                    })

                }

              );


            if (!response.ok) {

              throw new Error(
                "Erro ao atualizar status"
              );

            }


            showToast(
              `Conteúdo movido para ${newStatus}.`
            );


            await refreshContentAreas();


          } catch (error) {


            console.error(
              error
            );


            showToast(
              "Não foi possível atualizar o conteúdo."
            );


            await loadContents();

          }


        }
      );


    }
  );


// ======================================================
// CONTADORES DO FLUXO
// ======================================================

function updateKanbanCounts() {


  document

    .querySelectorAll(
      ".kanban-column"
    )

    .forEach(
      (column) => {


        const count =
          column

            .querySelectorAll(
              ".kanban-card"
            )

            .length;


        const counter =
          column.querySelector(
            ".kanban-count"
          );


        if (counter) {

          counter.textContent =
            count;

        }


      }
    );

}


// ======================================================
// CALENDÁRIO
// ======================================================

let calendarYear =
  2026;


let calendarMonth =
  9;


// ======================================================
// RENDERIZAR CALENDÁRIO
// ======================================================

function renderCalendar(
  lista
) {


  const calendar =
    document.getElementById(
      "calendar-grid"
    );


  if (!calendar) {

    return;

  }


  calendar

    .querySelectorAll(
      ".calendar-day"
    )

    .forEach(
      (day) => {

        day.remove();

      }
    );


  updateCalendarTitle();


  const firstDay =
    new Date(
      calendarYear,
      calendarMonth,
      1
    )
      .getDay();


  const adjustedFirstDay =
    firstDay === 0

      ? 6

      : firstDay - 1;


  const lastDay =
    new Date(
      calendarYear,
      calendarMonth + 1,
      0
    )
      .getDate();


  for (
    let i = 0;
    i < adjustedFirstDay;
    i++
  ) {


    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "calendar-day calendar-day-empty";


    calendar.appendChild(
      empty
    );

  }


  for (
    let day = 1;
    day <= lastDay;
    day++
  ) {


    const dayElement =
      document.createElement(
        "div"
      );


    dayElement.className =
      "calendar-day";


    dayElement.innerHTML = `

      <span class="calendar-number">

        ${day}

      </span>

    `;


    const contentsForDay =
      lista.filter(
        (item) => {


          if (
            !item.data_publicacao
          ) {

            return false;

          }


          const date =
            new Date(
              `${item.data_publicacao}T00:00:00`
            );


          return (

            date.getFullYear() ===
              calendarYear &&

            date.getMonth() ===
              calendarMonth &&

            date.getDate() ===
              day

          );


        }
      );


    contentsForDay.forEach(
      (conteudo) => {


        const contentElement =
          document.createElement(
            "button"
          );


        contentElement.type =
          "button";


        contentElement.className =
          "calendar-content";


        contentElement.textContent =
          conteudo.titulo;


        contentElement.title =
          conteudo.titulo;


        contentElement.addEventListener(
          "click",
          () => {


            if (
              typeof openContentEdit ===
              "function"
            ) {

              openContentEdit(
                conteudo.id
              );

            }


          }
        );


        dayElement.appendChild(
          contentElement
        );


      }
    );


    calendar.appendChild(
      dayElement
    );

  }

}


// ======================================================
// TÍTULO DO CALENDÁRIO
// ======================================================

function updateCalendarTitle() {


  const possibleTitles = [

    document.getElementById(
      "calendar-current-month"
    ),

    document.querySelector(
      ".calendar-month"
    ),

    document.querySelector(
      ".calendar-title"
    )

  ];


  const title =
    possibleTitles.find(
      Boolean
    );


  if (!title) {

    return;

  }


  const date =
    new Date(
      calendarYear,
      calendarMonth,
      1
    );


  const text =
    date.toLocaleDateString(
      "pt-BR",
      {

        month:
          "long",

        year:
          "numeric"

      }
    );


  title.textContent =
    text.charAt(0)
      .toUpperCase() +
    text.slice(1);

}


// ======================================================
// BOTÕES DO CALENDÁRIO
// ======================================================

function configureCalendarNavigation() {


  const previousButton =

    document.getElementById(
      "calendar-prev"
    ) ||

    document.querySelector(
      "[data-calendar-prev]"
    );


  const nextButton =

    document.getElementById(
      "calendar-next"
    ) ||

    document.querySelector(
      "[data-calendar-next]"
    );


  if (
    previousButton &&
    previousButton.dataset
      .calendarReady !==
      "true"
  ) {


    previousButton.dataset
      .calendarReady =
      "true";


    previousButton.addEventListener(
      "click",
      () => {


        calendarMonth--;


        if (
          calendarMonth < 0
        ) {

          calendarMonth =
            11;

          calendarYear--;

        }


        renderCalendar(
          getVisibleContents()
        );

      }
    );

  }


  if (
    nextButton &&
    nextButton.dataset
      .calendarReady !==
      "true"
  ) {


    nextButton.dataset
      .calendarReady =
      "true";


    nextButton.addEventListener(
      "click",
      () => {


        calendarMonth++;


        if (
          calendarMonth > 11
        ) {

          calendarMonth =
            0;

          calendarYear++;

        }


        renderCalendar(
          getVisibleContents()
        );

      }
    );

  }

}

// ======================================================
// CONTENT LAB
// ======================================================

const labClient =
  document.getElementById(
    "lab-client"
  );


const labTheme =
  document.getElementById(
    "lab-theme"
  );


let temaAutomatico =
  "";


// ======================================================
// PREVIEW DO CLIENTE NO CONTENT LAB
// ======================================================

let labClientPreview =
  null;


if (labClient) {


  const labClientGroup =
    labClient.closest(
      ".form-group"
    );


  if (labClientGroup) {


    labClientPreview =
      document.createElement(
        "div"
      );


    labClientPreview.id =
      "lab-client-preview";


    labClientPreview.style.display =
      "none";


    labClientPreview.style.marginBottom =
      "18px";


    labClientPreview.style.padding =
      "14px";


    labClientPreview.style.borderRadius =
      "14px";


    labClientPreview.style.background =
      "rgba(255,255,255,0.07)";


    labClientPreview.style.border =
      "1px solid rgba(255,255,255,0.12)";


    labClientGroup.insertAdjacentElement(
      "afterend",
      labClientPreview
    );

  }

}


// ======================================================
// SELECIONAR CLIENTE NO CONTENT LAB
// ======================================================

if (labClient) {


  labClient.addEventListener(
    "change",
    () => {


      const clientId =
        Number(
          labClient.value
        );


      const cliente =
        clientes.find(
          (item) =>
            Number(
              item.id
            ) ===
            clientId
        );


      if (!cliente) {


        if (labClientPreview) {

          labClientPreview.style.display =
            "none";

        }


        return;

      }


      const nicho =
        cliente.nicho ||
        "Conteúdo";


      temaAutomatico =
        nicho;


      if (
        labTheme &&
        !labTheme
          .value
          .trim()
      ) {

        labTheme.value =
          nicho;

      }


      if (labTheme) {

        labTheme.placeholder =
          `Ex: ${nicho}`;

      }


      if (labClientPreview) {


        labClientPreview.innerHTML = `

          <div
            style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              gap:15px;
            "
          >


            <div>


              <div
                style="
                  color:white;
                  font-weight:700;
                  font-size:14px;
                "
              >

                ${safeText(
                  cliente.nome
                )}

              </div>


              <div
                style="
                  color:rgba(255,255,255,0.58);
                  font-size:12px;
                  margin-top:4px;
                "
              >

                ${safeText(
                  nicho
                )}

                ${
                  cliente.instagram

                    ? ` • ${safeText(
                        cliente.instagram
                      )}`

                    : ""
                }

              </div>


            </div>


            <span
              style="
                color:#c6ff00;
                font-size:12px;
                font-weight:600;
              "
            >

              Cliente selecionado ✓

            </span>


          </div>

        `;


        labClientPreview.style.display =
          "block";

      }


      showToast(
        `${cliente.nome} selecionado no Content Lab.`
      );


    }
  );

}


// ======================================================
// GERAR IDEIAS
// ======================================================

const generateIdeasButton =
  document.getElementById(
    "generate-ideas-button"
  );


if (
  generateIdeasButton &&
  labClient
) {


  generateIdeasButton.addEventListener(
    "click",
    () => {


      const clientId =
        Number(
          labClient.value
        );


      const cliente =
        clientes.find(
          (item) =>
            Number(
              item.id
            ) ===
            clientId
        );


      if (!cliente) {

        showToast(
          "Selecione um cliente."
        );

        return;

      }


      let theme =
        labTheme
          ?.value
          .trim() ||
        "";


      if (!theme) {


        theme =
          cliente.nicho ||
          temaAutomatico ||
          "conteúdo";


        if (labTheme) {

          labTheme.value =
            theme;

        }


      }


      const objective =
        document
          .getElementById(
            "lab-objective"
          )
          ?.value ||
        "Autoridade";


      const format =
        document
          .getElementById(
            "lab-format"
          )
          ?.value ||
        "Reels";


      const ideas = [


        {

          title:
            `3 erros comuns sobre ${theme}`,


          text:
            `Uma abordagem educativa em ${format} para gerar ${objective.toLowerCase()} e demonstrar conhecimento sobre ${theme}.`

        },


        {

          title:
            `O que ninguém te conta sobre ${theme}`,


          text:
            "Conteúdo com abertura forte para despertar curiosidade e aumentar retenção."

        },


        {

          title:
            `${theme}: mito ou verdade?`,


          text:
            "Um conteúdo direto para quebrar objeções, educar o público e fortalecer autoridade."

        }


      ];


      renderGeneratedIdeas(
        ideas,
        cliente,
        objective,
        format
      );


      showToast(
        `Ideias geradas para ${cliente.nome}.`
      );


    }
  );

}


// ======================================================
// EXIBIR IDEIAS
// ======================================================

function renderGeneratedIdeas(
  ideas,
  cliente,
  objective,
  format
) {


  const container =
    document.getElementById(
      "ideas-results"
    );


  if (!container) {

    return;

  }


  container.innerHTML =
    ideas

      .map(
        (idea, index) => `

          <article class="idea-card">


            <span class="eyebrow">

              IDEIA ${index + 1}

            </span>


            <h4>

              ${safeText(
                idea.title
              )}

            </h4>


            <p>

              ${safeText(
                idea.text
              )}

            </p>


            <div
              style="
                display:flex;
                gap:7px;
                margin-top:14px;
                flex-wrap:wrap;
              "
            >


              <span class="badge">

                ${safeText(
                  format
                )}

              </span>


              <span class="badge">

                ${safeText(
                  objective
                )}

              </span>


              <span class="badge">

                ${safeText(
                  cliente.nome
                )}

              </span>


            </div>


            <button
              class="
                primary-button
                add-idea-button
              "
              style="
                width:100%;
                margin-top:16px;
              "
              data-title="${encodeURIComponent(
                idea.title
              )}"
              data-description="${encodeURIComponent(
                idea.text
              )}"
              data-client="${cliente.id}"
              data-format="${encodeURIComponent(
                format
              )}"
              data-objective="${encodeURIComponent(
                objective
              )}"
            >

              + Adicionar ao Fluxo de Conteúdo

            </button>


          </article>

        `
      )

      .join("");


  container

    .querySelectorAll(
      ".add-idea-button"
    )

    .forEach(
      (button) => {


        button.addEventListener(
          "click",
          async () => {

            await addIdeaToContentFlow(
              button
            );

          }
        );


      }
    );

}


// ======================================================
// ADICIONAR IDEIA AO FLUXO DE CONTEÚDO
// ======================================================

async function addIdeaToContentFlow(
  button
) {


  const clienteId =
    Number(
      button.dataset.client
    );


  const cliente =
    clientes.find(
      (item) =>
        Number(
          item.id
        ) ===
        clienteId
    );


  const titulo =
    decodeURIComponent(
      button.dataset.title
    );


  const descricao =
    decodeURIComponent(
      button.dataset.description
    );


  const formato =
    decodeURIComponent(
      button.dataset.format
    );


  const objetivo =
    decodeURIComponent(
      button.dataset.objective
    );


  const payload = {


    titulo:
      titulo,


    cliente_id:
      clienteId,


    formato:
      formato,


    plataforma:
      "Instagram",


    objetivo:
      objetivo,


    responsavel:
      cliente?.responsavel ||
      "",


    prioridade:
      "Média",


    status:
      "Ideia",


    data_publicacao:
      "",


    descricao:
      descricao

  };


  const originalText =
    button.textContent;


  button.disabled =
    true;


  button.textContent =
    "Adicionando...";


  try {


    const response =
      await fetch(
        `${API_URL}/conteudos`,
        {

          method:
            "POST",


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
        "Erro ao adicionar ideia"
      );

    }


    button.textContent =
      "✓ Adicionado ao Fluxo";


    await refreshContentAreas();


    showToast(
      "Ideia adicionada ao Fluxo de Conteúdo."
    );


  } catch (error) {


    button.disabled =
      false;


    button.textContent =
      originalText;


    showToast(
      error.message
    );


  }

}


// ======================================================
// COMPATIBILIDADE COM NOME ANTIGO
// ======================================================

async function addIdeaToPipeline(
  button
) {

  return addIdeaToContentFlow(
    button
  );

}


// ======================================================
// BUSCA DE CLIENTES
// ======================================================

const clientSearch =
  document.getElementById(
    "client-search"
  );


if (clientSearch) {


  clientSearch.addEventListener(
    "input",
    (event) => {


      const term =
        event
          .target
          .value
          .toLowerCase();


      const filtered =
        clientes.filter(
          (cliente) =>


            cliente
              .nome
              .toLowerCase()
              .includes(
                term
              )


            ||


            (
              cliente.nicho ||
              ""
            )
              .toLowerCase()
              .includes(
                term
              )


        );


      if (
        typeof renderClients ===
        "function"
      ) {

        renderClients(
          filtered
        );

      }


    }
  );

}


// ======================================================
// BUSCA DE CONTEÚDOS
// ======================================================

const contentSearch =
  document.getElementById(
    "content-search"
  );


if (contentSearch) {


  contentSearch.addEventListener(
    "input",
    () => {

      applyContentFilters();

    }
  );

}


// ======================================================
// FILTRO DE STATUS
// ======================================================

const contentStatusFilter =
  document.getElementById(
    "content-status-filter"
  );


if (contentStatusFilter) {


  contentStatusFilter.addEventListener(
    "change",
    () => {

      applyContentFilters();

    }
  );

}


// ======================================================
// APLICAR FILTROS DE CONTEÚDO
// ======================================================

function applyContentFilters() {


  let filtered =
    getVisibleContents();


  const term =
    contentSearch
      ?.value
      .trim()
      .toLowerCase() ||
    "";


  const status =
    contentStatusFilter
      ?.value ||
    "";


  // ==================================================
  // FILTROS VINDOS DO DASHBOARD
  // ==================================================

  if (
    dashboardAttentionFilter ===
    "ativos"
  ) {

    filtered =
      filtered.filter(
        (conteudo) =>
          conteudo.status !==
          "Publicado"
      );

  }


  if (
    dashboardAttentionFilter ===
    "edicao"
  ) {

    filtered =
      filtered.filter(
        (conteudo) =>
          conteudo.status ===
          "Edição"
      );

  }


  if (
    dashboardAttentionFilter ===
    "aprovacao"
  ) {

    filtered =
      filtered.filter(
        (conteudo) =>
          conteudo.status ===
          "Aprovação"
      );

  }


  if (
    dashboardAttentionFilter ===
    "publicados"
  ) {

    filtered =
      filtered.filter(
        (conteudo) =>
          conteudo.status ===
          "Publicado"
      );

  }


  if (
    dashboardAttentionFilter ===
    "atrasados"
  ) {


    const today =
      new Date();


    today.setHours(
      0,
      0,
      0,
      0
    );


    filtered =
      filtered.filter(
        (conteudo) => {


          if (
            !conteudo.data_publicacao
          ) {

            return false;

          }


          if (
            conteudo.status ===
            "Publicado"
          ) {

            return false;

          }


          const contentDate =
            new Date(
              `${conteudo.data_publicacao}T00:00:00`
            );


          return (
            contentDate <
            today
          );


        }
      );

  }


  // ==================================================
  // BUSCA
  // ==================================================

  if (term) {


    filtered =
      filtered.filter(
        (conteudo) => {


          const titulo =
            (
              conteudo.titulo ||
              ""
            )
              .toLowerCase();


          const cliente =
            (
              conteudo.cliente_nome ||
              ""
            )
              .toLowerCase();


          return (

            titulo.includes(
              term
            ) ||

            cliente.includes(
              term
            )

          );


        }
      );

  }


  // ==================================================
  // STATUS MANUAL
  // ==================================================

  if (status) {


    filtered =
      filtered.filter(
        (conteudo) =>
          conteudo.status ===
          status
      );

  }


  renderContentsTable(
    filtered
  );

}


// ======================================================
// LIMPAR FILTRO DO DASHBOARD
// ======================================================

function clearDashboardAttentionFilter() {

  dashboardAttentionFilter =
    null;


  if (contentSearch) {

    contentSearch.value =
      "";

  }


  if (contentStatusFilter) {

    contentStatusFilter.value =
      "";

  }

}
// ======================================================
// OBTER CONTEÚDOS ATRASADOS
// ======================================================

function getOverdueContents(
  lista = conteudos
) {


  const today =
    new Date();


  today.setHours(
    0,
    0,
    0,
    0
  );


  return lista.filter(
    (conteudo) => {


      if (
        !conteudo.data_publicacao
      ) {

        return false;

      }


      if (
        conteudo.status ===
        "Publicado"
      ) {

        return false;

      }


      const date =
        new Date(
          `${conteudo.data_publicacao}T00:00:00`
        );


      return (
        date <
        today
      );


    }
  );

}


// ======================================================
// OBTER CONTEÚDOS EM APROVAÇÃO
// ======================================================

function getApprovalContents(
  lista = conteudos
) {


  return lista.filter(
    (conteudo) =>
      conteudo.status ===
      "Aprovação"
  );

}


// ======================================================
// OBTER CLIENTES SEM AGENDA
// ======================================================

function getClientsWithoutSchedule() {


  const today =
    new Date();


  today.setHours(
    0,
    0,
    0,
    0
  );


  return clientes.filter(
    (cliente) => {


      const hasScheduledContent =
        conteudos.some(
          (conteudo) => {


            if (
              Number(
                conteudo.cliente_id
              ) !==
              Number(
                cliente.id
              )
            ) {

              return false;

            }


            if (
              !conteudo.data_publicacao
            ) {

              return false;

            }


            if (
              conteudo.status ===
              "Publicado"
            ) {

              return false;

            }


            const date =
              new Date(
                `${conteudo.data_publicacao}T00:00:00`
              );


            return (
              date >=
              today
            );


          }
        );


      return (
        !hasScheduledContent
      );


    }
  );

}


// ======================================================
// CRIAR MODAL DE ATENÇÃO DO DASHBOARD
// ======================================================

function createDashboardAttentionModal({
  eyebrow =
    "ATENÇÃO",

  title =
    "Detalhes",

  content =
    ""
} = {}) {


  document
    .getElementById(
      "dashboard-attention-modal"
    )
    ?.remove();


  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "dashboard-attention-modal";


  modal.className =
    "modal open";


  modal.innerHTML = `

    <div
      class="modal-overlay"
      data-dashboard-attention-close
    ></div>


    <div class="modal-card">


      <div class="modal-header">


        <div>

          <span class="eyebrow">

            ${safeText(
              eyebrow
            )}

          </span>


          <h3>

            ${safeText(
              title
            )}

          </h3>

        </div>


        <button
          type="button"
          class="close-modal"
          data-dashboard-attention-close
        >

          ×

        </button>


      </div>


      <div
        class="dashboard-attention-modal-content"
      >

        ${content}

      </div>


    </div>

  `;


  document.body.appendChild(
    modal
  );


  modal
    .querySelectorAll(
      "[data-dashboard-attention-close]"
    )
    .forEach(
      (element) => {

        element.addEventListener(
          "click",
          () => {

            modal.remove();

          }
        );

      }
    );


  return modal;

}


// ======================================================
// CRIAR ITEM DE CONTEÚDO NO MODAL
// ======================================================

function createDashboardContentItem(
  conteudo
) {

  return `

    <button
      type="button"
      class="dashboard-attention-list-item"
      data-attention-content="${conteudo.id}"
    >


      <div>


        <strong>

          ${safeText(
            conteudo.titulo
          )}

        </strong>


        <span>

          ${safeText(
            conteudo.cliente_nome ||
            getSelectedClient()
              ?.nome ||
            "Sem cliente"
          )}

          ${
            conteudo.status

              ? ` • ${safeText(
                  conteudo.status
                )}`

              : ""
          }

          ${
            conteudo.data_publicacao

              ? ` • ${formatDate(
                  conteudo.data_publicacao
                )}`

              : ""
          }

        </span>


      </div>


      <span class="dashboard-attention-arrow">

        →

      </span>


    </button>

  `;

}


// ======================================================
// ATIVAR ITENS DE CONTEÚDO DO MODAL
// ======================================================

function configureDashboardModalContentLinks(
  modal
) {


  modal
    .querySelectorAll(
      "[data-attention-content]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {


            const id =
              Number(
                button.dataset
                  .attentionContent
              );


            modal.remove();


            if (
              typeof openContentEdit ===
              "function"
            ) {

              openContentEdit(
                id
              );

            }


          }
        );

      }
    );

}


// ======================================================
// ABRIR LISTA GENÉRICA DE CONTEÚDOS DO DASHBOARD
// ======================================================

function openDashboardContentList({
  lista = [],
  eyebrow = "CONTEÚDOS",
  title = "Conteúdos",
  emptyMessage = "Nenhum conteúdo encontrado."
} = {}) {


  const content =
    lista.length

      ? lista
          .map(
            (conteudo) =>
              createDashboardContentItem(
                conteudo
              )
          )
          .join("")

      : `

          <div class="empty-state">

            ${safeText(
              emptyMessage
            )}

          </div>

        `;


  const modal =
    createDashboardAttentionModal({

      eyebrow,

      title,

      content

    });


  configureDashboardModalContentLinks(
    modal
  );


  return modal;

}


// ======================================================
// ABRIR PÁGINA DE CONTEÚDOS COM FILTRO DO DASHBOARD
// ======================================================

function openDashboardContentFilter(
  filter
) {


  dashboardAttentionFilter =
    filter;


  if (contentSearch) {

    contentSearch.value =
      "";

  }


  if (contentStatusFilter) {

    contentStatusFilter.value =
      "";

  }


  showPage(
    "conteudos"
  );


  renderClientSelector(
    "conteudos"
  );


  applyContentFilters();

}


// ======================================================
// CARD: CONTEÚDOS ATIVOS
// ======================================================

function showActiveContentsFromDashboard() {


  const lista =
    getActiveContents(
      getVisibleContents()
    );


  if (selectedClientId) {

    openDashboardContentFilter(
      "ativos"
    );

    return;

  }


  openDashboardContentList({

    lista,

    eyebrow:
      "OPERAÇÃO",

    title:
      "Conteúdos ativos",

    emptyMessage:
      "Nenhum conteúdo ativo no momento."

  });

}


// ======================================================
// CARD: EM EDIÇÃO
// ======================================================

function showEditingContentsFromDashboard() {


  const lista =
    getContentsByStatus(
      "Edição",
      getVisibleContents()
    );


  if (selectedClientId) {

    openDashboardContentFilter(
      "edicao"
    );

    return;

  }


  openDashboardContentList({

    lista,

    eyebrow:
      "PRODUÇÃO",

    title:
      "Conteúdos em edição",

    emptyMessage:
      "Nenhum conteúdo está em edição."

  });

}


// ======================================================
// CARD: APROVAÇÃO
// ======================================================

function showDashboardApprovalContents() {


  const lista =
    getContentsByStatus(
      "Aprovação",
      getVisibleContents()
    );


  if (selectedClientId) {

    openDashboardContentFilter(
      "aprovacao"
    );

    return;

  }


  openDashboardContentList({

    lista,

    eyebrow:
      "APROVAÇÃO",

    title:
      "Conteúdos em aprovação",

    emptyMessage:
      "Nenhum conteúdo está em aprovação."

  });

}


// ======================================================
// CARD: PUBLICADOS
// ======================================================

function showPublishedContentsFromDashboard() {


  const lista =
    getContentsByStatus(
      "Publicado",
      getVisibleContents()
    );


  if (selectedClientId) {

    openDashboardContentFilter(
      "publicados"
    );

    return;

  }


  openDashboardContentList({

    lista,

    eyebrow:
      "PUBLICADOS",

    title:
      "Conteúdos publicados",

    emptyMessage:
      "Nenhum conteúdo publicado ainda."

  });

}


// ======================================================
// IDENTIFICAR AÇÃO DE UM CARD PRINCIPAL
// ======================================================

function getDashboardStatAction(
  card
) {


  const number =
    card.querySelector(
      "strong"
    );


  const label =
    card.querySelector(
      ".stat-label"
    );


  const id =
    number?.id ||
    "";


  const text =
    label
      ?.textContent
      .trim()
      .toLowerCase() ||
    "";


  if (
    id ===
      "stat-total" ||

    text.includes(
      "conteúdos ativos"
    ) ||

    text.includes(
      "conteudos ativos"
    )
  ) {

    return (
      showActiveContentsFromDashboard
    );

  }


  if (
    id ===
      "stat-edicao" ||

    text.includes(
      "em edição"
    ) ||

    text.includes(
      "em edicao"
    )
  ) {

    return (
      showEditingContentsFromDashboard
    );

  }


  if (
    id ===
      "stat-aprovacao" ||

    text ===
      "aprovação" ||

    text ===
      "aprovacao"
  ) {

    return (
      showDashboardApprovalContents
    );

  }


  if (
    id ===
      "stat-publicados" ||

    text.includes(
      "publicados"
    )
  ) {

    return (
      showPublishedContentsFromDashboard
    );

  }


  return null;

}


// ======================================================
// CONFIGURAR CARDS PRINCIPAIS DO DASHBOARD
// ======================================================

function configureDashboardStatActions() {


  const dashboard =
    document.getElementById(
      "dashboard"
    );


  if (!dashboard) {

    return;

  }


  const cards =
    dashboard.querySelectorAll(
      ".stat-card"
    );


  cards.forEach(
    (card) => {


      const action =
        getDashboardStatAction(
          card
        );


      if (!action) {

        return;

      }


      if (
        card.dataset
          .statReady ===
        "true"
      ) {

        return;

      }


      card.dataset
        .statReady =
        "true";


      card.setAttribute(
        "role",
        "button"
      );


      card.setAttribute(
        "tabindex",
        "0"
      );


      card.addEventListener(
        "click",
        action
      );


      card.addEventListener(
        "keydown",
        (event) => {


          if (
            event.key ===
              "Enter" ||

            event.key ===
              " "
          ) {


            event.preventDefault();


            action();

          }


        }
      );


    }
  );

}


// ======================================================
// MOSTRAR CONTEÚDOS ATRASADOS
// ======================================================

function showOverdueContents() {


  const lista =
    getOverdueContents(
      getVisibleContents()
    );


  if (selectedClientId) {


    openDashboardContentFilter(
      "atrasados"
    );


    return;

  }


  openDashboardContentList({

    lista,

    eyebrow:
      "PRAZOS",

    title:
      "Conteúdos atrasados",

    emptyMessage:
      "Nenhum conteúdo atrasado."

  });

}


// ======================================================
// MOSTRAR CONTEÚDOS EM APROVAÇÃO
// ======================================================

function showApprovalContents() {


  const lista =
    getApprovalContents(
      getVisibleContents()
    );


  if (selectedClientId) {


    openDashboardContentFilter(
      "aprovacao"
    );


    return;

  }


  openDashboardContentList({

    lista,

    eyebrow:
      "APROVAÇÃO",

    title:
      "Aguardando aprovação",

    emptyMessage:
      "Nenhum conteúdo aguardando aprovação."

  });

}


// ======================================================
// MOSTRAR CLIENTES SEM AGENDA
// ======================================================

function showClientsWithoutSchedule() {


  const lista =
    getClientsWithoutSchedule();


  const content =
    lista.length

      ? lista
          .map(
            (cliente) => {


              const initials =
                cliente.nome

                  .split(" ")

                  .map(
                    (word) =>
                      word.charAt(0)
                  )

                  .join("")

                  .slice(
                    0,
                    2
                  )

                  .toUpperCase();


              return `

                <button
                  type="button"
                  class="dashboard-attention-list-item"
                  data-no-schedule-client="${cliente.id}"
                >


                  <div
                    class="client-avatar"
                  >

                    ${safeText(
                      initials
                    )}

                  </div>


                  <div>


                    <strong>

                      ${safeText(
                        cliente.nome
                      )}

                    </strong>


                    <span>

                      ${safeText(
                        cliente.nicho ||
                        "Nicho não informado"
                      )}

                    </span>


                  </div>


                  <span class="dashboard-attention-arrow">

                    →

                  </span>


                </button>

              `;

            }
          )
          .join("")

      : `

          <div class="empty-state">

            Todos os clientes possuem conteúdos agendados.

          </div>

        `;


  const modal =
    createDashboardAttentionModal({

      eyebrow:
        "PLANEJAMENTO",

      title:
        "Clientes sem agenda",

      content

    });


  modal
    .querySelectorAll(
      "[data-no-schedule-client]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          async () => {


            const clientId =
              Number(
                button.dataset
                  .noScheduleClient
              );


            modal.remove();


            dashboardAttentionFilter =
              null;


            await openClientWorkspace(
              clientId,
              "calendario"
            );


          }
        );

      }
    );

}


// ======================================================
// CONFIGURAR CARDS DE ATENÇÃO DO DASHBOARD
// ======================================================

function configureDashboardAttentionActions() {


  const dashboard =
    document.getElementById(
      "dashboard"
    );


  if (!dashboard) {

    return;

  }


  const attentionItems =
    dashboard.querySelectorAll(
      ".attention-item"
    );


  attentionItems.forEach(
    (item) => {


      if (
        item.dataset
          .attentionReady ===
        "true"
      ) {

        return;

      }


      const title =
        item
          .querySelector(
            "strong"
          )
          ?.textContent
          .trim()
          .toLowerCase();


      if (!title) {

        return;

      }


      let action =
        null;


      if (
        title.includes(
          "conteúdos atrasados"
        )
      ) {

        action =
          showOverdueContents;

      }


      if (
        title.includes(
          "aguardando aprovação"
        )
      ) {

        action =
          showApprovalContents;

      }


      if (
        title.includes(
          "clientes sem agenda"
        )
      ) {

        action =
          showClientsWithoutSchedule;

      }


      if (!action) {

        return;

      }


      item.dataset
        .attentionReady =
        "true";


      item.setAttribute(
        "role",
        "button"
      );


      item.setAttribute(
        "tabindex",
        "0"
      );


      item.addEventListener(
        "click",
        action
      );


      item.addEventListener(
        "keydown",
        (event) => {


          if (
            event.key ===
              "Enter" ||

            event.key ===
              " "
          ) {


            event.preventDefault();


            action();

          }


        }
      );


    }
  );

} 
// ======================================================
// FOTO DE PERFIL
// ======================================================

const profilePhotoButton =
  document.getElementById(
    "profile-photo-button"
  );


const profilePhotoInput =
  document.getElementById(
    "profile-photo-input"
  );


const profileAvatar =
  document.getElementById(
    "profile-avatar"
  );


// ======================================================
// CARREGAR FOTO SALVA
// ======================================================

function loadProfilePhoto() {


  if (!profileAvatar) {

    return;

  }


  const savedPhoto =
    localStorage.getItem(
      "contentflow-profile-photo"
    );


  if (!savedPhoto) {

    return;

  }


  profileAvatar.innerHTML = `

    <img
      src="${savedPhoto}"
      alt="Foto de perfil"
    >

  `;

}


// ======================================================
// CLICAR NO AVATAR
// ======================================================

if (
  profilePhotoButton &&
  profilePhotoInput
) {


  profilePhotoButton.addEventListener(
    "click",
    () => {

      profilePhotoInput.click();

    }
  );

}


// ======================================================
// ALTERAR FOTO
// ======================================================

if (
  profilePhotoInput &&
  profileAvatar
) {


  profilePhotoInput.addEventListener(
    "change",
    (event) => {


      const file =
        event
          .target
          .files[0];


      if (!file) {

        return;

      }


      const validTypes = [

        "image/jpeg",

        "image/png",

        "image/webp"

      ];


      if (
        !validTypes.includes(
          file.type
        )
      ) {


        showToast(
          "Selecione uma imagem JPG, PNG ou WEBP."
        );


        profilePhotoInput.value =
          "";


        return;

      }


      const maxSize =
        3 *
        1024 *
        1024;


      if (
        file.size >
        maxSize
      ) {


        showToast(
          "A imagem deve ter no máximo 3 MB."
        );


        profilePhotoInput.value =
          "";


        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        function () {


          const image =
            reader.result;


          try {


            localStorage.setItem(
              "contentflow-profile-photo",
              image
            );


            profileAvatar.innerHTML = `

              <img
                src="${image}"
                alt="Foto de perfil"
              >

            `;


            showToast(
              "Foto de perfil atualizada."
            );


          } catch (error) {


            console.error(
              "Erro ao salvar foto:",
              error
            );


            showToast(
              "Não foi possível salvar essa imagem."
            );

          }


          profilePhotoInput.value =
            "";

        };


      reader.readAsDataURL(
        file
      );


    }
  );

}


// ======================================================
// AJUSTAR PERFIL DA AGÊNCIA
// ======================================================

function updateAgencyProfile() {


  const loggedUserName =
    document.getElementById(
      "logged-user-name"
    );


  if (loggedUserName) {

    loggedUserName.textContent =
      "Delta Produtora";

  }

}


// ======================================================
// CORRIGIR TEXTOS ANTIGOS DE PIPELINE
// ======================================================

function replaceOldPipelineLabels() {


  const elements =
    document.querySelectorAll(
      "button, a, h1, h2, h3, h4, span, p"
    );


  elements.forEach(
    (element) => {


      if (
        element.children.length
      ) {

        return;

      }


      const text =
        element.textContent
          ?.trim();


      if (!text) {

        return;

      }


      if (
        text ===
        "Pipeline"
      ) {

        element.textContent =
          "Fluxo de Conteúdo";

      }


      if (
        text ===
        "Ver pipeline"
      ) {

        element.textContent =
          "Ver fluxo de conteúdo";

      }


      if (
        text ===
        "Ver Pipeline"
      ) {

        element.textContent =
          "Ver Fluxo de Conteúdo";

      }


    }
  );

}


// ======================================================
// BOTÕES "VER FLUXO" DO DASHBOARD
// ======================================================

function configureDashboardFlowLinks() {


  const dashboard =
    document.getElementById(
      "dashboard"
    );


  if (!dashboard) {

    return;

  }


  const buttons =
    dashboard.querySelectorAll(
      "button, a"
    );


  buttons.forEach(
    (button) => {


      const text =
        button.textContent
          ?.trim()
          .toLowerCase();


      if (
        text ===
          "ver pipeline" ||

        text ===
          "ver fluxo" ||

        text ===
          "ver fluxo de conteúdo"
      ) {


        button.textContent =
          "Ver fluxo de conteúdo";


        if (
          button.dataset
            .flowReady ===
          "true"
        ) {

          return;

        }


        button.dataset
          .flowReady =
          "true";


        button.addEventListener(
          "click",
          async (event) => {


            event.preventDefault();


            dashboardAttentionFilter =
              null;


            showPage(
              "pipeline"
            );


            await refreshCurrentPage(
              "pipeline"
            );


          }
        );


      }


    }
  );

}


// ======================================================
// ATUALIZAR CONTADORES DOS CARDS DE ATENÇÃO
// ======================================================

function updateDashboardAttentionCounts() {


  const dashboard =
    document.getElementById(
      "dashboard"
    );


  if (!dashboard) {

    return;

  }


  const overdueCount =
    getOverdueContents(
      getVisibleContents()
    ).length;


  const approvalCount =
    getApprovalContents(
      getVisibleContents()
    ).length;


  const noScheduleCount =
    selectedClientId

      ? 0

      : getClientsWithoutSchedule()
          .length;


  const items =
    dashboard.querySelectorAll(
      ".attention-item"
    );


  items.forEach(
    (item) => {


      const title =
        item
          .querySelector(
            "strong"
          )
          ?.textContent
          .trim()
          .toLowerCase();


      const description =
        item.querySelector(
          "p"
        );


      if (
        !title ||
        !description
      ) {

        return;

      }


      if (
        title.includes(
          "conteúdos atrasados"
        )
      ) {

        description.textContent =
          overdueCount === 1

            ? "1 conteúdo com prazo vencido."

            : `${overdueCount} conteúdos com prazo vencido.`;

      }


      if (
        title.includes(
          "aguardando aprovação"
        )
      ) {

        description.textContent =
          approvalCount === 1

            ? "1 conteúdo aguardando retorno."

            : `${approvalCount} conteúdos aguardando retorno.`;

      }


      if (
        title.includes(
          "clientes sem agenda"
        )
      ) {


        if (selectedClientId) {

          item.style.display =
            "none";

        } else {

          item.style.display =
            "";


          description.textContent =
            noScheduleCount === 1

              ? "1 cliente ainda precisa de conteúdos planejados."

              : `${noScheduleCount} clientes ainda precisam de conteúdos planejados.`;

        }

      }


    }
  );

}


// ======================================================
// ATUALIZAR DASHBOARD COMPLETO
// ======================================================

async function refreshDashboardAttention() {


  configureDashboardStatActions();


  configureDashboardAttentionActions();


  updateDashboardAttentionCounts();

}


// ======================================================
// INICIALIZAÇÃO
// ======================================================

async function init() {


  loadProfilePhoto();


  updateAgencyProfile();


  configureCalendarNavigation();


  await Promise.all([

    loadClients(),

    loadContents()

  ]);


  await Promise.all([

    loadDashboard(),

    loadUpcoming()

  ]);


  replaceOldPipelineLabels();


  configureDashboardFlowLinks();


  configureDashboardStatActions();


  configureDashboardAttentionActions();


  updateDashboardAttentionCounts();


  const pageToOpen =
    document.getElementById(
      savedPage
    )

      ? savedPage

      : "dashboard";


  showPage(
    pageToOpen
  );


  await refreshCurrentPage(
    pageToOpen
  );


  renderDashboardClients();


  renderDashboardContext();


  configureDashboardStatActions();


  configureDashboardAttentionActions();


  updateDashboardAttentionCounts();

}


init();
// ======================================================
// BUSCA GERAL DO CONTENTFLOW
// ======================================================

const globalSearchButton =
  document.getElementById(
    "global-search-button"
  );


const globalSearchModal =
  document.getElementById(
    "global-search-modal"
  );


const globalSearchInput =
  document.getElementById(
    "global-search-input"
  );


const globalSearchResults =
  document.getElementById(
    "global-search-results"
  );


let globalSearchItems = [];

let globalSearchSelectedIndex = -1;


// ======================================================
// NORMALIZAR TEXTO DA BUSCA
// Remove acentos e deixa tudo minúsculo
// ======================================================

function normalizeGlobalSearchText(
  value
) {

  return String(
    value ?? ""
  )

    .normalize("NFD")

    .replace(
      /[\u0300-\u036f]/g,
      ""
    )

    .toLowerCase()

    .trim();

}


// ======================================================
// PEGAR NOME DO CLIENTE DE UM CONTEÚDO
// ======================================================

function getGlobalSearchContentClientName(
  conteudo
) {


  if (
    conteudo.cliente_nome
  ) {

    return conteudo.cliente_nome;

  }


  const cliente =
    clientes.find(
      (item) =>
        Number(item.id) ===
        Number(
          conteudo.cliente_id
        )
    );


  return (
    cliente?.nome ||
    "Sem cliente"
  );

}


// ======================================================
// ABRIR BUSCA GERAL
// ======================================================

function openGlobalSearch() {


  if (
    !globalSearchModal
  ) {

    console.error(
      "Modal da Busca Geral não encontrado."
    );

    return;

  }


  globalSearchModal.classList.add(
    "open"
  );


  globalSearchModal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "global-search-open"
  );


  globalSearchSelectedIndex =
    -1;


  if (
    globalSearchInput
  ) {


    globalSearchInput.value =
      "";


    setTimeout(
      () => {

        globalSearchInput.focus();

      },
      30
    );

  }


  renderGlobalSearchInitialState();

}


// ======================================================
// FECHAR BUSCA GERAL
// ======================================================

function closeGlobalSearch() {


  if (
    !globalSearchModal
  ) {

    return;

  }


  globalSearchModal.classList.remove(
    "open"
  );


  globalSearchModal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "global-search-open"
  );


  globalSearchSelectedIndex =
    -1;


  globalSearchItems =
    [];


  if (
    globalSearchInput
  ) {

    globalSearchInput.value =
      "";

  }

}


// ======================================================
// ESTADO INICIAL DA BUSCA
// ======================================================

function renderGlobalSearchInitialState() {


  if (
    !globalSearchResults
  ) {

    return;

  }


  globalSearchItems =
    [];


  globalSearchSelectedIndex =
    -1;


  globalSearchResults.innerHTML = `

    <div class="global-search-empty">

      <strong>
        Comece digitando para pesquisar
      </strong>

      <span>
        Você pode buscar por cliente, conteúdo, status,
        formato ou responsável.
      </span>

    </div>

  `;

}


// ======================================================
// BUSCAR CLIENTES
// ======================================================

function searchGlobalClients(
  normalizedTerm
) {


  return clientes.filter(
    (cliente) => {


      const searchableText =
        normalizeGlobalSearchText(
          [

            cliente.nome,

            cliente.nicho,

            cliente.instagram,

            cliente.responsavel

          ]

            .filter(Boolean)

            .join(" ")
        );


      return searchableText.includes(
        normalizedTerm
      );

    }
  );

}


// ======================================================
// BUSCAR CONTEÚDOS
// ======================================================

function searchGlobalContents(
  normalizedTerm
) {


  return conteudos.filter(
    (conteudo) => {


      const clientName =
        getGlobalSearchContentClientName(
          conteudo
        );


      const searchableText =
        normalizeGlobalSearchText(
          [

            conteudo.titulo,

            clientName,

            conteudo.formato,

            conteudo.plataforma,

            conteudo.objetivo,

            conteudo.responsavel,

            conteudo.prioridade,

            conteudo.status,

            conteudo.descricao

          ]

            .filter(Boolean)

            .join(" ")
        );


      return searchableText.includes(
        normalizedTerm
      );

    }
  );

}


// ======================================================
// CRIAR INICIAIS DO CLIENTE
// ======================================================

function getGlobalSearchInitials(
  name
) {


  return String(
    name || ""
  )

    .split(" ")

    .filter(Boolean)

    .map(
      (part) =>
        part.charAt(0)
    )

    .join("")

    .slice(
      0,
      2
    )

    .toUpperCase();

}


// ======================================================
// RENDERIZAR RESULTADOS DA BUSCA
// ======================================================

function renderGlobalSearchResults(
  term
) {


  if (
    !globalSearchResults
  ) {

    return;

  }


  const normalizedTerm =
    normalizeGlobalSearchText(
      term
    );


  if (
    !normalizedTerm
  ) {

    renderGlobalSearchInitialState();

    return;

  }


  const matchedClients =
    searchGlobalClients(
      normalizedTerm
    );


  const matchedContents =
    searchGlobalContents(
      normalizedTerm
    );


  globalSearchItems =
    [];


  matchedClients.forEach(
    (cliente) => {


      globalSearchItems.push({

        type:
          "cliente",

        id:
          Number(
            cliente.id
          ),

        data:
          cliente

      });

    }
  );


  matchedContents.forEach(
    (conteudo) => {


      globalSearchItems.push({

        type:
          "conteudo",

        id:
          Number(
            conteudo.id
          ),

        data:
          conteudo

      });

    }
  );


  globalSearchSelectedIndex =
    globalSearchItems.length

      ? 0

      : -1;


  if (
    !globalSearchItems.length
  ) {


    globalSearchResults.innerHTML = `

      <div class="global-search-empty">

        <strong>
          Nenhum resultado encontrado
        </strong>

        <span>
          Não encontramos clientes ou conteúdos para
          "${safeText(term)}".
        </span>

      </div>

    `;


    return;

  }


  let html =
    "";


  // ==================================================
  // CLIENTES
  // ==================================================

  if (
    matchedClients.length
  ) {


    html += `

      <div class="global-search-group">

        <div class="global-search-group-title">

          <span>
            CLIENTES
          </span>

          <small>
            ${matchedClients.length}
          </small>

        </div>

    `;


    matchedClients.forEach(
      (cliente) => {


        const initials =
          getGlobalSearchInitials(
            cliente.nome
          );


        html += `

          <button
            type="button"
            class="global-search-result-item"
            data-global-search-type="cliente"
            data-global-search-id="${cliente.id}"
          >

            <div class="global-search-result-icon client-avatar">

              ${safeText(
                initials
              )}

            </div>


            <div class="global-search-result-info">

              <strong>

                ${safeText(
                  cliente.nome
                )}

              </strong>


              <span>

                ${safeText(
                  cliente.nicho ||
                  "Nicho não informado"
                )}

                ${
                  cliente.responsavel

                    ? ` • ${safeText(
                        cliente.responsavel
                      )}`

                    : ""
                }

              </span>

            </div>


            <div class="global-search-result-type">

              Cliente

            </div>


            <span class="global-search-result-arrow">

              →

            </span>

          </button>

        `;

      }
    );


    html += `

      </div>

    `;

  }


  // ==================================================
  // CONTEÚDOS
  // ==================================================

  if (
    matchedContents.length
  ) {


    html += `

      <div class="global-search-group">

        <div class="global-search-group-title">

          <span>
            CONTEÚDOS
          </span>

          <small>
            ${matchedContents.length}
          </small>

        </div>

    `;


    matchedContents.forEach(
      (conteudo) => {


        const clientName =
          getGlobalSearchContentClientName(
            conteudo
          );


        html += `

          <button
            type="button"
            class="global-search-result-item"
            data-global-search-type="conteudo"
            data-global-search-id="${conteudo.id}"
          >

            <div class="global-search-result-icon">

              ▤

            </div>


            <div class="global-search-result-info">

              <strong>

                ${safeText(
                  conteudo.titulo ||
                  "Conteúdo sem título"
                )}

              </strong>


              <span>

                ${safeText(
                  clientName
                )}

                ${
                  conteudo.formato

                    ? ` • ${safeText(
                        conteudo.formato
                      )}`

                    : ""
                }

                ${
                  conteudo.status

                    ? ` • ${safeText(
                        conteudo.status
                      )}`

                    : ""
                }

              </span>

            </div>


            <div class="global-search-result-type">

              ${safeText(
                conteudo.status ||
                "Conteúdo"
              )}

            </div>


            <span class="global-search-result-arrow">

              →

            </span>

          </button>

        `;

      }
    );


    html += `

      </div>

    `;

  }


  globalSearchResults.innerHTML =
    html;


  configureGlobalSearchResultButtons();


  updateGlobalSearchSelection();

}


// ======================================================
// CONFIGURAR CLIQUE DOS RESULTADOS
// ======================================================

function configureGlobalSearchResultButtons() {


  if (
    !globalSearchResults
  ) {

    return;

  }


  const buttons =
    globalSearchResults.querySelectorAll(
      ".global-search-result-item"
    );


  buttons.forEach(
    (button, index) => {


      button.addEventListener(
        "mouseenter",
        () => {


          globalSearchSelectedIndex =
            index;


          updateGlobalSearchSelection();

        }
      );


      button.addEventListener(
        "click",
        async () => {


          globalSearchSelectedIndex =
            index;


          await openSelectedGlobalSearchResult();

        }
      );


    }
  );

}


// ======================================================
// ATUALIZAR SELEÇÃO VISUAL
// ======================================================

function updateGlobalSearchSelection() {


  if (
    !globalSearchResults
  ) {

    return;

  }


  const buttons =
    Array.from(
      globalSearchResults.querySelectorAll(
        ".global-search-result-item"
      )
    );


  buttons.forEach(
    (button, index) => {


      const selected =
        index ===
        globalSearchSelectedIndex;


      button.classList.toggle(
        "active",
        selected
      );


      if (
        selected
      ) {


        button.setAttribute(
          "aria-selected",
          "true"
        );


      } else {


        button.removeAttribute(
          "aria-selected"
        );

      }


    }
  );


  const selectedButton =
    buttons[
      globalSearchSelectedIndex
    ];


  if (
    selectedButton
  ) {

    selectedButton.scrollIntoView({

      block:
        "nearest"

    });

  }

}


// ======================================================
// ABRIR RESULTADO SELECIONADO
// ======================================================

async function openSelectedGlobalSearchResult() {


  if (
    globalSearchSelectedIndex < 0 ||
    globalSearchSelectedIndex >=
      globalSearchItems.length
  ) {

    return;

  }


  const result =
    globalSearchItems[
      globalSearchSelectedIndex
    ];


  if (
    !result
  ) {

    return;

  }


  // ==================================================
  // ABRIR CLIENTE
  // ==================================================

  if (
    result.type ===
    "cliente"
  ) {


    closeGlobalSearch();


    dashboardAttentionFilter =
      null;


    selectedClientId =
      Number(
        result.id
      );


    showPage(
      "dashboard"
    );


    await refreshCurrentPage(
      "dashboard"
    );


    return;

  }


  // ==================================================
  // ABRIR CONTEÚDO
  // ==================================================

  if (
    result.type ===
    "conteudo"
  ) {


    const contentId =
      Number(
        result.id
      );


    closeGlobalSearch();


    if (
      typeof openContentEdit ===
      "function"
    ) {


      openContentEdit(
        contentId
      );


    } else {


      console.error(
        "Função openContentEdit não encontrada."
      );


      showToast(
        "Não foi possível abrir este conteúdo."
      );

    }

  }

}


// ======================================================
// CLIQUE NO BOTÃO BUSCAR
// ======================================================

if (
  globalSearchButton
) {


  globalSearchButton.addEventListener(
    "click",
    () => {

      openGlobalSearch();

    }
  );

}


// ======================================================
// DIGITAÇÃO NA BUSCA
// ======================================================

if (
  globalSearchInput
) {


  globalSearchInput.addEventListener(
    "input",
    (event) => {


      renderGlobalSearchResults(
        event.target.value
      );

    }
  );

}


// ======================================================
// FECHAR PELO OVERLAY
// ======================================================

if (
  globalSearchModal
) {


  globalSearchModal

    .querySelectorAll(
      "[data-global-search-close]"
    )

    .forEach(
      (element) => {


        element.addEventListener(
          "click",
          () => {

            closeGlobalSearch();

          }
        );


      }
    );

}


// ======================================================
// ATALHOS DE TECLADO
// ======================================================

document.addEventListener(
  "keydown",
  async (event) => {


    // ==================================================
    // CTRL + K / CMD + K
    // ==================================================

    if (

      (
        event.ctrlKey ||
        event.metaKey
      ) &&

      event.key
        .toLowerCase() ===
        "k"

    ) {


      event.preventDefault();


      event.stopPropagation();


      openGlobalSearch();


      return;

    }


    const searchIsOpen =
      globalSearchModal
        ?.classList
        .contains(
          "open"
        );


    if (
      !searchIsOpen
    ) {

      return;

    }


    // ==================================================
    // ESC FECHA
    // ==================================================

    if (
      event.key ===
      "Escape"
    ) {


      event.preventDefault();


      closeGlobalSearch();


      return;

    }


    // ==================================================
    // SETA PARA BAIXO
    // ==================================================

    if (
      event.key ===
      "ArrowDown"
    ) {


      event.preventDefault();


      if (
        !globalSearchItems.length
      ) {

        return;

      }


      globalSearchSelectedIndex++;


      if (
        globalSearchSelectedIndex >=
        globalSearchItems.length
      ) {

        globalSearchSelectedIndex =
          0;

      }


      updateGlobalSearchSelection();


      return;

    }


    // ==================================================
    // SETA PARA CIMA
    // ==================================================

    if (
      event.key ===
      "ArrowUp"
    ) {


      event.preventDefault();


      if (
        !globalSearchItems.length
      ) {

        return;

      }


      globalSearchSelectedIndex--;


      if (
        globalSearchSelectedIndex <
        0
      ) {

        globalSearchSelectedIndex =
          globalSearchItems.length -
          1;

      }


      updateGlobalSearchSelection();


      return;

    }


    // ==================================================
    // ENTER ABRE O RESULTADO
    // ==================================================

    if (
      event.key ===
      "Enter"
    ) {


      if (
        !globalSearchItems.length
      ) {

        return;

      }


      event.preventDefault();


      await openSelectedGlobalSearchResult();

    }


  },
  true
);


// ======================================================
// FIM DA BUSCA GERAL
// ======================================================
// ======================================================
// CONFIGURAÇÕES DO CONTENTFLOW
// ======================================================


// ======================================================
// ELEMENTOS
// ======================================================

const settingsAgencyForm =
  document.getElementById(
    "agency-settings-form"
  );


const settingsAgencyName =
  document.getElementById(
    "settings-agency-name"
  );


const settingsUserName =
  document.getElementById(
    "settings-user-name"
  );


const settingsUserEmail =
  document.getElementById(
    "settings-user-email"
  );


const settingsProfileAvatar =
  document.getElementById(
    "settings-profile-avatar"
  );


const settingsChangePhoto =
  document.getElementById(
    "settings-change-photo"
  );


const passwordSettingsForm =
  document.getElementById(
    "password-settings-form"
  );


const settingsCurrentPassword =
  document.getElementById(
    "settings-current-password"
  );


const settingsNewPassword =
  document.getElementById(
    "settings-new-password"
  );


const settingsConfirmPassword =
  document.getElementById(
    "settings-confirm-password"
  );


// ======================================================
// PEGAR NOME SALVO DA AGÊNCIA
// ======================================================

function getSavedAgencyName() {

  return (
    localStorage.getItem(
      "contentflow-agency-name"
    ) ||
    "Delta Produtora"
  );

}


// ======================================================
// ATUALIZAR NOME DA AGÊNCIA NO SISTEMA
// ======================================================

function applyAgencyName(
  name
) {

  const finalName =
    String(
      name ||
      "Delta Produtora"
    ).trim();


  const brandTitle =
    document.querySelector(
      ".brand h1"
    );


  const loggedUserName =
    document.getElementById(
      "logged-user-name"
    );


  if (
    brandTitle
  ) {

    brandTitle.textContent =
      finalName;

  }


  if (
    loggedUserName
  ) {

    loggedUserName.textContent =
      finalName;

  }


  if (
    settingsAgencyName
  ) {

    settingsAgencyName.value =
      finalName;

  }


  const systemRows =
    document.querySelectorAll(
      "#configuracoes .settings-info-row"
    );


  systemRows.forEach(
    (row) => {

      const label =
        row
          .querySelector("span")
          ?.textContent
          ?.trim()
          ?.toLowerCase();


      if (
        label ===
        "workspace"
      ) {

        const value =
          row.querySelector(
            "strong"
          );


        if (
          value
        ) {

          value.textContent =
            finalName;

        }

      }

    }
  );

}


// ======================================================
// CARREGAR USUÁRIO NAS CONFIGURAÇÕES
// ======================================================

function loadSettingsUser() {

  try {

    const savedUser =
      JSON.parse(
        localStorage.getItem(
          "contentflow-user"
        ) ||
        "null"
      );


    if (
      settingsUserName
    ) {

      settingsUserName.textContent =
        savedUser?.nome ||
        "Gabriel";

    }


    if (
      settingsUserEmail
    ) {

      settingsUserEmail.textContent =
        savedUser?.email ||
        "gabriel@delta.com";

    }

  } catch (error) {

    console.error(
      "Erro ao carregar usuário nas configurações:",
      error
    );

  }

}


// ======================================================
// CARREGAR FOTO NAS CONFIGURAÇÕES
// ======================================================

function loadSettingsProfilePhoto() {

  if (
    !settingsProfileAvatar
  ) {

    return;

  }


  const savedPhoto =
    localStorage.getItem(
      "contentflow-profile-photo"
    );


  if (
    savedPhoto
  ) {

    settingsProfileAvatar.innerHTML = `

      <img
        src="${savedPhoto}"
        alt="Foto de perfil"
      >

    `;

    return;

  }


  settingsProfileAvatar.textContent =
    "GX";

}


// ======================================================
// SINCRONIZAR FOTO
// ======================================================

function syncSettingsProfilePhoto() {

  const savedPhoto =
    localStorage.getItem(
      "contentflow-profile-photo"
    );


  if (
    savedPhoto &&
    settingsProfileAvatar
  ) {

    settingsProfileAvatar.innerHTML = `

      <img
        src="${savedPhoto}"
        alt="Foto de perfil"
      >

    `;

  } else if (
    settingsProfileAvatar
  ) {

    settingsProfileAvatar.textContent =
      "GX";

  }

}


// ======================================================
// BOTÃO ALTERAR FOTO
// ======================================================

if (
  settingsChangePhoto &&
  profilePhotoInput
) {

  settingsChangePhoto.addEventListener(
    "click",
    () => {

      profilePhotoInput.click();

    }
  );

}


// ======================================================
// ATUALIZAR FOTO QUANDO ESCOLHER UMA NOVA
// ======================================================

if (
  profilePhotoInput
) {

  profilePhotoInput.addEventListener(
    "change",
    () => {

      setTimeout(
        () => {

          syncSettingsProfilePhoto();

        },
        200
      );

    }
  );

}


// ======================================================
// SALVAR PERFIL DA AGÊNCIA
// ======================================================

if (
  settingsAgencyForm
) {

  settingsAgencyForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();


      const agencyName =
        settingsAgencyName
          ?.value
          .trim();


      if (
        !agencyName
      ) {

        showToast(
          "Digite o nome da agência."
        );

        return;

      }


      localStorage.setItem(
        "contentflow-agency-name",
        agencyName
      );


      applyAgencyName(
        agencyName
      );


      updateDashboardHeading();


      showToast(
        "Configurações salvas com sucesso."
      );

    }
  );

}


// ======================================================
// SEGURANÇA / ALTERAÇÃO DE SENHA
// ======================================================

if (
  passwordSettingsForm
) {

  passwordSettingsForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();


      const currentPassword =
        settingsCurrentPassword
          ?.value
          .trim() ||
        "";


      const newPassword =
        settingsNewPassword
          ?.value
          .trim() ||
        "";


      const confirmPassword =
        settingsConfirmPassword
          ?.value
          .trim() ||
        "";


      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {

        showToast(
          "Preencha todos os campos de senha."
        );

        return;

      }


      if (
        newPassword.length <
        6
      ) {

        showToast(
          "A nova senha deve ter pelo menos 6 caracteres."
        );

        return;

      }


      if (
        newPassword !==
        confirmPassword
      ) {

        showToast(
          "As novas senhas não coincidem."
        );

        return;

      }


      showToast(
        "A alteração real da senha será conectada ao servidor."
      );

    }
  );

}


// ======================================================
// CARREGAR CONFIGURAÇÕES
// ======================================================

function loadContentFlowSettings() {

  const agencyName =
    getSavedAgencyName();


  applyAgencyName(
    agencyName
  );


  loadSettingsUser();


  loadSettingsProfilePhoto();

}


// ======================================================
// EXECUTAR CONFIGURAÇÕES
// ======================================================

loadContentFlowSettings();


// ======================================================
// FIM DAS CONFIGURAÇÕES
// ======================================================