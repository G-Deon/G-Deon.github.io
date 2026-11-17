const gramatica = {
  inicial: "S",
  regras: {
    S: [
      ["c", "A", "b"],
      ["a", "C", "c"],
    ],
    A: [
      ["a", "B", "c"],
      ["b", "S", "b"],
    ],
    B: [["a", "B", "c"], ["b", "A", "a"], ["ε"]],
    C: [
      ["b", "A", "a"],
      ["a", "C", "b"],
    ],
  },
};

let first = {
  S: ["a", "c"],
  A: ["a", "b"],
  B: ["a", "b", "ε"],
  C: ["a", "b"],
};

let follow = {
  S: ["$", "b"],
  A: ["a", "b"],
  B: ["c"],
  C: ["b", "c"],
};

let tabela = {
  S: { a: ["a", "C", "c"], c: ["c", "A", "b"] },
  A: { a: ["a", "B", "c"], b: ["b", "S", "b"] },
  B: { a: ["a", "B", "c"], b: ["b", "A", "a"], c: ["ε"] },
  C: { a: ["a", "C", "b"], b: ["b", "A", "a"] },
};

const el = {
  historico: document.getElementById("historico"),
  sentenca: document.getElementById("sentenca"),
  status: document.getElementById("status"),
  passos: document.querySelector("#tabela-passos tbody"),
  resultado: document.getElementById("resultado"),
  btnAnalisar: document.getElementById("btn-analisar"),
  btnGerar: document.getElementById("btn-gerar"),
  btnReiniciar: document.getElementById("btn-reiniciar"),
  btnPasso: document.getElementById("btn-passo"),
};

let passosAtuais = [];
let aceitaAtual = false;
let passoIndex = 0;

const terminadora = { S: 0, A: 0, B: 2, C: 0 };
const CHANCE_ERRO = 1 / 5;

function derivar(simbolo, profundidade) {
  if (!(simbolo in gramatica.regras)) return simbolo === "ε" ? "" : simbolo;

  const opcoes = gramatica.regras[simbolo];
  const escolha =
    profundidade >= 4
      ? opcoes[terminadora[simbolo]]
      : opcoes[Math.floor(Math.random() * opcoes.length)];

  return escolha.map((s) => derivar(s, profundidade + 1)).join("");
}

function gerarSentenca() {
  const letras = ["a", "b", "c"];
  const s = derivar(gramatica.inicial, 0).split("");

  if (Math.random() < CHANCE_ERRO) {
    const pos = Math.floor(Math.random() * s.length);
    const letra = letras[Math.floor(Math.random() * letras.length)];
    const tipo = Math.floor(Math.random() * 3);

    if (tipo === 0) s.splice(pos, 0, letra);
    if (tipo === 1) s[pos] = letra;
    if (tipo === 2) s.splice(pos, 1);
  }

  return s.join("");
}

function analisar(sentenca) {
  const tokens = sentenca.replace(/\s+/g, "").split("");
  tokens.push("$");

  const pilha = ["$", gramatica.inicial];
  const passos = [];
  let i = 0;

  while (true) {
    const topo = pilha[pilha.length - 1];
    const atual = tokens[i];
    const registro = { pilha: [...pilha], entrada: tokens.slice(i) };

    if (topo === "$" && atual === "$") {
      passos.push({
        ...registro,
        acao: `Aceito em ${passos.length + 1} passos`,
      });
      return { aceita: true, passos };
    }

    if (topo in gramatica.regras) {
      const producao = tabela[topo][atual];

      if (!producao) {
        passos.push({
          ...registro,
          acao: `Erro em ${passos.length + 1} passos`,
        });
        return { aceita: false, passos };
      }

      passos.push({ ...registro, acao: `${topo} → ${producao.join("")}` });
      pilha.pop();

      if (producao[0] !== "ε") {
        for (let k = producao.length - 1; k >= 0; k--) {
          pilha.push(producao[k]);
        }
      }
    } else if (topo === atual) {
      passos.push({ ...registro, acao: `Ler ${atual}` });
      pilha.pop();
      i++;
    } else {
      passos.push({
        ...registro,
        acao: `Erro em ${passos.length + 1} passos, esperado ${topo}, encontrado ${atual}`,
      });
      return { aceita: false, passos };
    }
  }
}

function renderPassos(passos) {
  el.passos.innerHTML = "";
  passos.forEach((p, n) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.pilha.join(" ")}</td>
      <td>${p.entrada.join(" ")}</td>
      <td>${p.acao}</td>`;
    if (n === passos.length - 1) tr.className = "active";
    el.passos.appendChild(tr);
  });
}

function adicionarHistorico(sentenca, aceita) {
  const texto = sentenca.replace(/\s+/g, "");
  if (texto === "") return;

  const jaExiste = [...el.historico.children].some(
    (chip) => chip.textContent === texto,
  );
  if (jaExiste) return;

  const chip = document.createElement("span");
  chip.className = "chip " + (aceita ? "ok" : "err");
  chip.textContent = texto;
  el.historico.appendChild(chip);
}

function mostrarResultado(aceita) {
  adicionarHistorico(el.sentenca.value, aceita);
  el.status.textContent = aceita ? "aceita" : "rejeitada";
  el.status.className = "status " + (aceita ? "ok" : "err");

  el.resultado.textContent = aceita
    ? "Sentença aceita."
    : "Sentença rejeitada.";
  el.resultado.className = "result " + (aceita ? "ok" : "err");
}

function resetarPassos() {
  passosAtuais = [];
  passoIndex = 0;
  el.btnPasso.textContent = "Passo a passo";
  el.btnPasso.disabled = false;
}

function reiniciar() {
  resetarPassos();
  el.historico.innerHTML = "";
  el.sentenca.value = "";
  el.passos.innerHTML = "";
  el.status.textContent = "aguardando";
  el.status.className = "status";
  el.resultado.textContent = "";
  el.resultado.className = "result";
}

el.btnAnalisar.addEventListener("click", () => {
  resetarPassos();
  const { aceita, passos } = analisar(el.sentenca.value);
  renderPassos(passos);
  mostrarResultado(aceita);
});

el.btnPasso.addEventListener("click", () => {
  if (passoIndex === 0) {
    const r = analisar(el.sentenca.value);
    passosAtuais = r.passos;
    aceitaAtual = r.aceita;
    el.resultado.textContent = "";
    el.resultado.className = "result";
  }

  passoIndex++;
  renderPassos(passosAtuais.slice(0, passoIndex));

  if (passoIndex === passosAtuais.length) {
    mostrarResultado(aceitaAtual);
    el.btnPasso.textContent = "Passo a passo";
    el.btnPasso.disabled = true;
  } else {
    el.status.textContent = "analisando";
    el.status.className = "status";
    el.btnPasso.textContent = "Próximo passo";
  }
});

el.sentenca.addEventListener("input", resetarPassos);

el.btnGerar.addEventListener("click", () => {
  resetarPassos();
  el.sentenca.value = gerarSentenca();
});

el.btnReiniciar.addEventListener("click", reiniciar);

function iniciar() {
  reiniciar();
}

iniciar();
