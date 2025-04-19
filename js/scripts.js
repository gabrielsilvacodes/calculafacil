// === Seletores ===
const buttons = document.querySelectorAll(".btn");
const toggleThemeButton = document.querySelector("#toggle-theme");
const currentOperationText = document.querySelector("#current-operations");
const previousOperationText = document.querySelector("#previous-operations");
const historyList = document.querySelector("#history-list");
const clearHistoryButton = document.querySelector("#clear-history");

// === Classe Principal ===
class Calculator {
  constructor(previousOpEl, currentOpEl, historyListEl) {
    this.previousOpEl = previousOpEl;
    this.currentOpEl = currentOpEl;
    this.historyListEl = historyListEl;
    this.reset();
  }

  reset() {
    this.current = "";
    this.previous = "";
    this.operator = null;
    this.updateDisplay();
  }

  addDigit(digit) {
    if (digit === "." && this.current.includes(".")) return;
    this.current += digit;
    this.updateDisplay();
  }

  updateDisplay(result = null, op = null, current = null, previous = null) {
    if (result === null) {
      this.currentOpEl.innerText = this.current || "0";
      this.previousOpEl.innerText = this.previous + (this.operator || "");
    } else {
      this.previous = result.toString();
      this.current = "";
      this.operator = null;

      this.previousOpEl.innerText = "";
      this.currentOpEl.innerText = this.previous;

      if (result === "Erro") {
        this.currentOpEl.classList.add("error");
        setTimeout(() => this.currentOpEl.classList.remove("error"), 1000);
      }

      if (previous !== null && current !== null && op) {
        this.addToHistory(previous, op, current, result);
      }
    }
  }

  setOperation(op) {
    if (!this.previous) {
      this.previous = this.current;
      this.operator = op;
      this.current = "";
      this.updateDisplay();
    } else {
      this.processEqual();
      this.operator = op;
    }
  }

  changeOperation(op) {
    const validOps = ["+", "-", "*", "/"];
    if (!validOps.includes(op)) return;
    this.operator = op;
    this.previousOpEl.innerText = this.previous + " " + op;
  }

  deleteLast() {
    this.current = this.current.slice(0, -1);
    this.updateDisplay();
  }

  clearEntry() {
    this.current = "";
    this.updateDisplay();
  }

  invertSignal() {
    if (!this.current) return;
    this.current = this.current.startsWith("-")
      ? this.current.slice(1)
      : "-" + this.current;
    this.updateDisplay();
  }

  convertPercentage() {
    const curr = parseFloat(this.current);
    const prev = parseFloat(this.previous);

    if (isNaN(curr)) return;

    const isAddSub = ["+", "-"].includes(this.operator);
    const isMulDiv = ["*", "/"].includes(this.operator);

    const percent =
      this.operator && !isNaN(prev)
        ? isAddSub
          ? (prev * curr) / 100
          : curr / 100
        : curr / 100;

    this.current = percent.toString();
    this.updateDisplay();
  }

  processOperation(op) {
    if (!this.current && op !== "C") {
      if (this.previous) this.changeOperation(op);
      return;
    }

    const actions = {
      "+": () => this.setOperation("+"),
      "-": () => this.setOperation("-"),
      "*": () => this.setOperation("*"),
      "/": () => this.setOperation("/"),
      "=": () => this.processEqual(),
      DEL: () => this.deleteLast(),
      CE: () => this.clearEntry(),
      C: () => this.reset(),
      "+/-": () => this.invertSignal(),
      "%": () => this.convertPercentage(),
    };

    if (actions[op]) actions[op]();
  }

  processEqual() {
    if (!this.operator || !this.current) return;

    const prev = parseFloat(this.previous);
    const curr = parseFloat(this.current);

    if (isNaN(prev) || isNaN(curr)) return;

    let result;

    switch (this.operator) {
      case "+":
        result = prev + curr;
        break;
      case "-":
        result = prev - curr;
        break;
      case "*":
        result = prev * curr;
        break;
      case "/":
        result = curr === 0 ? "Erro" : prev / curr;
        break;
    }

    const formatted = Number.isFinite(result)
      ? parseFloat(result.toFixed(2))
      : result;

    this.updateDisplay(formatted, this.operator, curr, prev);
  }

  addToHistory(prev, op, curr, result) {
    const li = document.createElement("li");
    li.textContent = `${prev} ${op} ${curr} = ${result}`;
    this.historyListEl.appendChild(li);
    this.historyListEl.scrollTop = this.historyListEl.scrollHeight;
  }
}

// === Inicialização ===
const calc = new Calculator(
  previousOperationText,
  currentOperationText,
  historyList
);

// === Eventos: Botões ===
buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const value = e.target.innerText;
    isNaN(value) && value !== "."
      ? calc.processOperation(value)
      : calc.addDigit(value);
    e.target.focus(); // acessibilidade: manter botão visível ao digitar
  });
});

// === Tema claro/escuro ===
toggleThemeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

// === Limpar histórico ===
clearHistoryButton.addEventListener("click", () => {
  historyList.innerHTML = "";
});

// === Teclado físico ===
document.addEventListener("keydown", (e) => {
  const key = e.key;
  const match = [...buttons].find(
    (btn) => btn.innerText === key || (key === "Enter" && btn.id === "equal")
  );
  match?.focus();

  if (!isNaN(key) || key === ".") {
    calc.addDigit(key);
  } else if (["+", "-", "*", "/"].includes(key)) {
    calc.processOperation(key);
  } else if (["Enter", "="].includes(key)) {
    calc.processOperation("=");
  } else if (key === "Backspace") {
    calc.processOperation("DEL");
  } else if (key === "Escape") {
    calc.processOperation("C");
  } else if (key === "%") {
    calc.processOperation("%");
  } else if (key === "F9") {
    calc.processOperation("+/-");
  }
});
