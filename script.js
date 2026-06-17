const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
let transitions = {};
let finalStates = new Set();
let stateCount = 1;
let words = [];
let currentState = 0;
let currentInput = "";
let errorState = false;

function addTransition(fromState, character, toState) {
  if (!transitions[fromState]) transitions[fromState] = {};
  transitions[fromState][character] = toState;
}

function addWord() {
  const wordInput = document.getElementById("wordInput");
  const errorMessage = document.getElementById("errMsg");
  const word = wordInput.value.replace(/[^a-z]/g, "").toLowerCase();

  errorMessage.textContent = "";

  if (!word) {
    errorMessage.textContent =
      "Digite uma palavra válida (somente letras minúsculas).";
    return;
  }
  if (words.includes(word)) {
    errorMessage.textContent = `"${word}" já está no autômato.`;
    wordInput.value = "";
    return;
  }

  words.push(word);
  rebuildAFD();
  wordInput.value = "";
  renderWordChips();
  buildTable();
  resetHighlights();
  highlightState(0, "current");
}

function rebuildAFD() {
  transitions = {};
  finalStates = new Set();
  stateCount = 1;

  words.forEach((word) => {
    let state = 0;
    for (const character of word) {
      if (transitions[state] && transitions[state][character] !== undefined) {
        state = transitions[state][character];
      } else {
        const newState = stateCount++;
        addTransition(state, character, newState);
        state = newState;
      }
    }
    finalStates.add(state);
  });
}

function renderWordChips() {
  const chipsContainer = document.getElementById("wordChips");
  chipsContainer.innerHTML = words
    .map((word) => `<span class="word-chip">${word}</span>`)
    .join("");
}

function buildTable() {
  const tableElement = document.getElementById("afdTable");
  tableElement.innerHTML = "";

  const tableWrapper = document.querySelector(".table-wrap");
  if (tableWrapper.hidden === true) {
    tableWrapper.hidden = false;
  }

  const headerRow = document.createElement("tr");
  const emptyHeaderCell = document.createElement("th");
  emptyHeaderCell.textContent = "";
  headerRow.appendChild(emptyHeaderCell);

  ALPHABET.forEach((character) => {
    const headerCell = document.createElement("th");
    headerCell.textContent = character;
    headerRow.appendChild(headerCell);
  });
  tableElement.appendChild(headerRow);

  for (let state = 0; state < stateCount; state++) {
    const tableRow = document.createElement("tr");

    const stateLabelCell = document.createElement("td");
    stateLabelCell.className = "state-label";
    stateLabelCell.id = `sl-${state}`;
    stateLabelCell.textContent = finalStates.has(state)
      ? `q${state}*`
      : `q${state}`;
    tableRow.appendChild(stateLabelCell);

    ALPHABET.forEach((character) => {
      const transitionCell = document.createElement("td");
      transitionCell.id = `c-${state}-${character}`;

      if (transitions[state] && transitions[state][character] !== undefined) {
        transitionCell.textContent = `q${transitions[state][character]}`;
        transitionCell.className = "transition";
      }

      tableRow.appendChild(transitionCell);
    });

    tableElement.appendChild(tableRow);
  }
}

function resetHighlights() {
  for (let state = 0; state < stateCount; state++) {
    const stateLabelCell = document.getElementById(`sl-${state}`);
    if (stateLabelCell) stateLabelCell.className = "state-label";

    ALPHABET.forEach((character) => {
      const transitionCell = document.getElementById(`c-${state}-${character}`);
      if (!transitionCell) return;

      if (transitions[state] && transitions[state][character] !== undefined)
        transitionCell.className = "transition";
      else transitionCell.className = "";
    });
  }
}

function highlightState(state, type) {
  const stateLabelCell = document.getElementById(`sl-${state}`);
  if (!stateLabelCell) return;

  if (type === "current") stateLabelCell.className = "state-label active-state";
  else if (type === "final")
    stateLabelCell.className = "state-label final-state";
  else if (type === "error")
    stateLabelCell.className = "state-label error-state";
}

function highlightCell(fromState, character) {
  const transitionCell = document.getElementById(`c-${fromState}-${character}`);
  if (transitionCell) transitionCell.className = "transition current";
}

function updateDisplay() {
  resetHighlights();
  const resultBox = document.getElementById("resultBox");

  if (currentInput.length === 0) {
    highlightState(0, "current");
    resultBox.className = "result-box";
    resultBox.textContent = "aguardando";
  } else if (errorState) {
    resultBox.className = "result-box err";
    resultBox.textContent = "Inválido";
  } else {
    highlightState(currentState, "current");

    if (currentInput.length > 0) {
      const lastCharacter = currentInput[currentInput.length - 1];
      let previousState = 0;

      for (let i = 0; i < currentInput.length - 1; i++) {
        const character = currentInput[i];
        if (
          transitions[previousState] &&
          transitions[previousState][character] !== undefined
        )
          previousState = transitions[previousState][character];
      }

      highlightCell(previousState, lastCharacter);
    }

    resultBox.className = "result-box typing";
    resultBox.textContent = `q${currentState}`;
  }
}

function processToken(token) {
  if (!token) return;

  let state = 0;
  let isValid = true;

  for (const character of token) {
    if (transitions[state] && transitions[state][character] !== undefined)
      state = transitions[state][character];
    else {
      isValid = false;
      break;
    }
  }

  const isAccepted = isValid && finalStates.has(state);
  const tokenChip = document.createElement("span");
  tokenChip.className = `token-chip ${isAccepted ? "chip-ok" : "chip-err"}`;
  tokenChip.textContent = `${token} ${isAccepted ? "" : ""}`;
  document.getElementById("tokensList").appendChild(tokenChip);

  resetHighlights();
  const resultBox = document.getElementById("resultBox");

  if (isAccepted) {
    highlightState(state, "final");
    resultBox.className = "result-box ok";
    resultBox.textContent = "Reconhecido";
  } else {
    highlightState(state, "error");
    resultBox.className = "result-box err";
    resultBox.textContent = "Rejeitado";
  }
}

document.getElementById("lexInput").addEventListener("keydown", function (e) {
  if (e.key === " ") {
    e.preventDefault();
    const token = currentInput.trim();
    if (token.length > 0) processToken(token);
    currentInput = "";
    currentState = 0;
    errorState = false;
    this.value = "";
  }
});

document.getElementById("lexInput").addEventListener("input", function () {
  const filteredInput = this.value.replace(/[^a-z]/g, "");
  if (filteredInput !== this.value) this.value = filteredInput;
  currentInput = filteredInput;
  currentState = 0;
  errorState = false;

  for (const character of currentInput) {
    if (
      transitions[currentState] &&
      transitions[currentState][character] !== undefined
    )
      currentState = transitions[currentState][character];
    else {
      errorState = true;
      break;
    }
  }

  updateDisplay();
});

document.getElementById("wordInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") addWord();
});

function resetAll() {
  transitions = {};
  finalStates = new Set();
  stateCount = 1;
  words = [];
  currentState = 0;
  currentInput = "";
  errorState = false;

  document.getElementById("wordInput").value = "";
  document.getElementById("lexInput").value = "";
  document.getElementById("wordChips").innerHTML = "";
  document.getElementById("tokensList").innerHTML = "";
  document.getElementById("errMsg").textContent = "";
  document.getElementById("resultBox").className = "result-box";
  document.getElementById("resultBox").textContent = "aguardando";
  document.querySelector(".table-wrap").hidden = true;
  document.getElementById("afdTable").innerHTML = "";
}
