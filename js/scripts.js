// === Seletores ===
const buttons = document.querySelectorAll(".btn");
const toggleThemeButton = document.querySelector("#toggle-theme");
const currentOperationText = document.querySelector("#current-operations");
const previousOperationText = document.querySelector("#previous-operations");
const historyList = document.querySelector("#history-list");
const clearHistoryButton = document.querySelector("#clear-history");

// === Classe Principal da Calculadora ===
class Calculator {
  constructor(previousDisplay, currentDisplay, historyList) {
    this.previousDisplay = previousDisplay;
    this.currentDisplay = currentDisplay;
    this.historyList = historyList;
    this.reset();
  }

  // Reinicia os valores da calculadora
  reset() {
    this.current = "";
    this.previous = "";
    this.operator = null;
    this.updateDisplay();
  }

  // Adiciona dígito ao número atual
  addDigit(digit) {
    if (digit === "." && this.current.includes(".")) return;
    this.current += digit;
    this.updateDisplay();
  }

  // Atualiza os visores com os dados atuais
  updateDisplay(
    result = null,
    operator = null,
    current = null,
    previous = null
  ) {
    if (result === null) {
      this.currentDisplay.innerText = this.current || "0";
      this.previousDisplay.innerText = this.previous + (this.operator || "");
    } else {
      this.previous = result.toString();
      this.current = "";
      this.operator = null;

      this.previousDisplay.innerText = "";
      this.currentDisplay.innerText = this.previous;

      // Exibe erro temporariamente
      if (result === "Erro") {
        this.currentDisplay.classList.add("error");
        setTimeout(() => {
          this.currentDisplay.classList.remove("error");
        }, 1000);
      }

      // Adiciona ao histórico, se aplicável
      if (previous !== null && current !== null && operator) {
        this.addToHistory(previous, operator, current, result);
      }
    }
  }

  // Define a operação atual ou resolve anterior
  setOperation(operator) {
    if (!this.previous) {
      this.previous = this.current;
      this.operator = operator;
      this.current = "";
      this.updateDisplay();
    } else {
      this.processEqual();
      this.operator = operator;
    }
  }

  // Altera o operador se o usuário quiser trocar antes de digitar o próximo número
  changeOperation(operator) {
    const validOps = ["+", "-", "*", "/"];
    if (!validOps.includes(operator)) return;
    this.operator = operator;
    this.previousDisplay.innerText = this.previous + " " + operator;
  }

  // Remove último caractere do número atual
  deleteLast() {
    this.current = this.current.slice(0, -1);
    this.updateDisplay();
  }

  // Limpa apenas o número atual
  clearEntry() {
    this.current = "";
    this.updateDisplay();
  }

  // Inverte o sinal do número atual
  invertSignal() {
    if (!this.current) return;
    this.current = this.current.startsWith("-")
      ? this.current.slice(1)
      : "-" + this.current;
    this.updateDisplay();
  }

  // Converte o valor atual para porcentagem, com base na operação anterior (se houver)
  convertPercentage() {
    const currentValue = parseFloat(this.current);
    const previousValue = parseFloat(this.previous);

    if (isNaN(currentValue)) return;

    let percentage = currentValue;

    if (["+", "-"].includes(this.operator) && !isNaN(previousValue)) {
      percentage = (previousValue * currentValue) / 100;
    } else if (["*", "/"].includes(this.operator)) {
      percentage = currentValue / 100;
    } else {
      percentage = currentValue / 100;
    }

    this.current = percentage.toString();
    this.updateDisplay();
  }

  // Processa qualquer operação recebida
  processOperation(op) {
    if (!this.current && op !== "C") {
      if (this.previous) this.changeOperation(op);
      return;
    }

    const operations = {
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

    if (operations[op]) operations[op]();
  }

  // Realiza o cálculo
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

  // Adiciona operação ao histórico
  addToHistory(prev, operator, curr, result) {
    const li = document.createElement("li");
    li.textContent = `${prev} ${operator} ${curr} = ${result}`;
    this.historyList.appendChild(li);
    this.historyList.scrollTop = this.historyList.scrollHeight;
  }
}

// === Inicialização ===
const calculator = new Calculator(
  previousOperationText,
  currentOperationText,
  historyList
);

// === Eventos: Clique nos botões ===
buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const value = e.target.innerText;

    if (!isNaN(value) || value === ".") {
      calculator.addDigit(value);
    } else {
      calculator.processOperation(value);
    }

    e.target.focus();
  });
});

// === Alternância de Tema (claro/escuro) ===
toggleThemeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

// === Limpar Histórico ===
clearHistoryButton.addEventListener("click", () => {
  historyList.innerHTML = "";
});

// === Suporte ao Teclado Físico ===
document.addEventListener("keydown", (e) => {
  const key = e.key;

  const match = [...buttons].find(
    (btn) => btn.innerText === key || (key === "Enter" && btn.id === "equal")
  );
  if (match) match.focus();

  if (!isNaN(key) || key === ".") {
    calculator.addDigit(key);
  } else if (["+", "-", "*", "/"].includes(key)) {
    calculator.processOperation(key);
  } else if (["Enter", "="].includes(key)) {
    calculator.processOperation("=");
  } else if (key === "Backspace") {
    calculator.processOperation("DEL");
  } else if (key === "Escape") {
    calculator.processOperation("C");
  } else if (key === "%") {
    calculator.processOperation("%");
  } else if (key === "F9") {
    calculator.processOperation("+/-");
  }
});
