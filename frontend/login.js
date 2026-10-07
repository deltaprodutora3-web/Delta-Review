const API_URL = "http://localhost:3000";

const loginForm =
  document.getElementById("login-form");

const emailInput =
  document.getElementById("login-email");

const passwordInput =
  document.getElementById("login-password");

const passwordToggle =
  document.getElementById("password-toggle");

const loginButton =
  document.getElementById("login-button");

const loginButtonText =
  document.getElementById("login-button-text");

const loginMessage =
  document.getElementById("login-message");

const forgotPasswordButton =
  document.getElementById("forgot-password-button");


// ======================================================
// VERIFICAÇÃO DE LOGIN
// Durante o desenvolvimento, permitimos abrir
// a página de login mesmo com usuário logado.
// ======================================================

const usuarioLogado =
  localStorage.getItem("contentflow-user");

// ======================================================
// MOSTRAR / ESCONDER SENHA
// ======================================================

if (
  passwordToggle &&
  passwordInput
) {

  passwordToggle.addEventListener(
    "click",
    () => {

      const isPassword =
        passwordInput.type === "password";


      passwordInput.type =
        isPassword
          ? "text"
          : "password";


      passwordToggle.setAttribute(
        "aria-label",
        isPassword
          ? "Ocultar senha"
          : "Mostrar senha"
      );


      passwordToggle.textContent =
        isPassword
          ? "◌"
          : "◉";

    }
  );

}


// ======================================================
// MENSAGENS
// ======================================================

function showMessage(
  message,
  type = "error"
) {

  if (!loginMessage) {
    return;
  }


  loginMessage.textContent =
    message;


  loginMessage.classList.add(
    "show"
  );


  if (
    type === "success"
  ) {

    loginMessage.classList.add(
      "success"
    );

  } else {

    loginMessage.classList.remove(
      "success"
    );

  }

}


function clearMessage() {

  if (!loginMessage) {
    return;
  }


  loginMessage.textContent =
    "";


  loginMessage.classList.remove(
    "show",
    "success"
  );

}


// ======================================================
// ESTADO DO BOTÃO
// ======================================================

function setLoading(
  loading
) {

  if (
    !loginButton ||
    !loginButtonText
  ) {
    return;
  }


  loginButton.disabled =
    loading;


  loginButtonText.textContent =
    loading
      ? "Entrando..."
      : "Entrar no ContentFlow";

}


// ======================================================
// LOGIN
// ======================================================

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      clearMessage();


      const email =
        emailInput.value
          .trim()
          .toLowerCase();


      const senha =
        passwordInput.value;


      if (
        !email ||
        !senha
      ) {

        showMessage(
          "Preencha seu e-mail e senha."
        );

        return;

      }


      setLoading(
        true
      );


      try {

        const response =
          await fetch(
            `${API_URL}/auth/login`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  email,
                  senha
                })
            }
          );


        const data =
          await response.json();


        if (
          !response.ok
        ) {

          showMessage(
            data.erro ||
            "Não foi possível realizar o login."
          );

          return;

        }


        // ==================================================
        // SALVAR USUÁRIO LOGADO
        // ==================================================

        localStorage.setItem(
          "contentflow-user",
          JSON.stringify(
            data.usuario
          )
        );


        localStorage.setItem(
          "contentflow-authenticated",
          "true"
        );


        showMessage(
          "Login realizado com sucesso.",
          "success"
        );


        // ==================================================
        // REDIRECIONAR PARA O SISTEMA
        // ==================================================

        setTimeout(
          () => {

            window.location.href =
              "./index.html";

          },
          500
        );


      } catch (error) {

        console.error(
          "Erro no login:",
          error
        );


        showMessage(
          "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
        );


      } finally {

        setLoading(
          false
        );

      }

    }
  );

}


// ======================================================
// ESQUECI A SENHA
// Ainda não temos recuperação por e-mail.
// ======================================================

if (
  forgotPasswordButton
) {

  forgotPasswordButton.addEventListener(
    "click",
    () => {

      showMessage(
        "Recuperação de senha será adicionada futuramente."
      );

    }
  );

}