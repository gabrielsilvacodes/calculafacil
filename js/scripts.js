// === Seletores ===
const buttons = document.querySelectorAll(".btn");

const numberButtons = document.querySelectorAll(".number");
const operatorButtons = document.querySelectorAll(".operator");
const equalButton = document.querySelector("#equal");
const clearButton = document.querySelector("#clear");
const deleteButton = document.querySelector("#del");
const clearEntryButton = document.querySelector("#ce");
const toggleThemeButton = document.querySelector("#toggle-theme");
const currentOperationText = document.querySelector("#current-operations");
const previousOperationText = document.querySelector("#previous-operations");
const historyList = document.querySelector("#history-list");

// === Classe principal ===
class Calculator {
  constructor(previousOperationText, currentOperationText, historyList) {
    this.previousOperationText = previousOperationText;
    this.currentOperationText = currentOperationText;
    this.historyList = historyList;
    this.currentOperation = "";
    this.previousOperation = "";
    this.operator = null;
  }

  addDigit(digit) {
    if (digit === "." && this.currentOperation.includes(".")) return;

    this.currentOperation += digit;
    this.updateScreen();
  }

  processOperation(operation) {
    // Trocar operador se o atual estiver vazio
    if (this.currentOperation === "" && operation !== "C") {
      if (this.previousOperation !== "") {
        this.changeOperation(operation);
      }
      return;
    }

    switch (operation) {
      case "+":
      case "-":
      case "*":
      case "/":
        // Se não houver operação anterior, define estado
        if (this.previousOperation === "") {
          this.previousOperation = this.currentOperation;
          this.operator = operation;
          this.currentOperation = "";
          this.updateScreen();
        } else {
          // Se já houver, resolve e atualiza
          this.processEqualOperator();
          this.operator = operation;
        }
        break;

      case "=":
        this.processEqualOperator();
        break;

      case "DEL":
        this.processDelOperator();
        break;

      case "CE":
        this.processClearCurrentOperation();
        break;

      case "C":
        this.processClearOperation();
        break;

      default:
        return;
    }
  }

  updateScreen(
    operationValue = null,
    operation = null,
    current = null,
    previous = null
  ) {
    if (operationValue === null) {
      this.currentOperationText.innerText = this.currentOperation || "0";
      this.previousOperationText.innerText =
        this.previousOperation + (this.operator || "");
    } else {
      this.previousOperation = operationValue.toString();
      this.currentOperation = "";
      this.operator = null;

      this.previousOperationText.innerText = "";
      this.currentOperationText.innerText = this.previousOperation;

      // Histórico
      if (previous !== null && current !== null && operation) {
        const li = document.createElement("li");
        li.textContent = `${previous} ${operation} ${current} = ${operationValue}`;
        this.historyList.appendChild(li);
        this.historyList.scrollTop = this.historyList.scrollHeight;
      }
    }
  }

  changeOperation(operation) {
    const mathOperations = ["*", "/", "+", "-"];
    if (!mathOperations.includes(operation)) return;

    this.operator = operation;
    this.previousOperationText.innerText =
      this.previousOperation + " " + operation;
  }

  processDelOperator() {
    this.currentOperation = this.currentOperation.slice(0, -1);
    this.updateScreen();
  }

  processClearCurrentOperation() {
    this.currentOperation = "";
    this.updateScreen();
  }

  processClearOperation() {
    this.currentOperation = "";
    this.previousOperation = "";
    this.operator = null;
    this.updateScreen();
  }

  processEqualOperator() {
    if (!this.operator || this.currentOperation === "") return;

    const previous = parseFloat(this.previousOperation);
    const current = parseFloat(this.currentOperation);

    if (isNaN(previous) || isNaN(current)) return;

    let result;

    switch (this.operator) {
      case "+":
        result = previous + current;
        break;
      case "-":
        result = previous - current;
        break;
      case "*":
        result = previous * current;
        break;
      case "/":
        result = current === 0 ? "Erro" : previous / current;
        break;
      default:
        return;
    }

    this.updateScreen(result, this.operator, current, previous);
  }
}

// === Inicialização ===
const calc = new Calculator(
  previousOperationText,
  currentOperationText,
  historyList
);

// === Eventos dos botões ===
buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const value = e.target.innerText;

    if (!isNaN(value) || value === ".") {
      calc.addDigit(value);
    } else {
      calc.processOperation(value);
    }
  });
});

// === Alternância de tema ===
toggleThemeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});
