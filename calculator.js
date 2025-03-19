class ExpressionNode {
  constructor(value, left=null, right=null) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

function precedence(op) {
  if (op === '+' || op === '-') return 1;
  if (op === '*' || op === '/') return 2;
  return 0;
}

/**
 * Converting something like "3+4*2/(1.5-2)" to ["3", "+", "4", "*", "2", "/", "(", "1.5", "-", "2", ")"]
 */
function tokenizeInfix(expression) {
  const tokens = expression.split(/([\+\-\*\/\(\)])/gm);
  return tokens.filter(token => token.trim().length > 0);
}

function infixToPostfix(tokens) {
  const outputQueue = [];
  const opStack = [];
  for (let token of tokens) {
    if (!isNaN(token) || token.includes(".")) {
      outputQueue.push(token);
    } else if (token === '(') {
      opStack.push(token);
    } else if (token === ')') {
      while (opStack.length && opStack[opStack.length - 1] !== '(') {
        outputQueue.push(opStack.pop());
      }
      if (opStack.length && opStack[opStack.length - 1] === '(') {
        opStack.pop();
      }
    } else {
      while (
        opStack.length &&
        precedence(opStack[opStack.length - 1]) >= precedence(token)
      ) {
        outputQueue.push(opStack.pop());
      }
      opStack.push(token);
    }
  };
  while (opStack.length) {
    outputQueue.push(opStack.pop());
  }
  return outputQueue;
}

function buildExpressionTree(postfixTokens) {
  const stack = [];
  for (let token of postfixTokens) {
    if (!isNaN(token) || token.includes(".")) {
      stack.push(new ExpressionNode(token));
    } else {
      const right = stack.pop();
      const left = stack.pop();
      const node = new ExpressionNode(token, left, right);
      stack.push(node);
    }
  };
  return stack.pop();
}

function evaluateExpressionTree(root) {
  if (!root) return 0;
  if (!root.left && !root.right) return parseFloat(root.value);

  const leftVal = evaluateExpressionTree(root.left);
  const rightVal = evaluateExpressionTree(root.right);
  switch (root.value) {
    case '+': return leftVal + rightVal;
    case '-': return leftVal - rightVal;
    case '*': return leftVal * rightVal;
    case '/': return leftVal / rightVal;
  }
  return 0;
}

const numbersArr = Array.from(document.getElementsByClassName("number"));
const operatorsArr = Array.from(document.getElementsByClassName("operator"));
const parenthesisArr = Array.from(document.getElementsByClassName("parenthesis"));
const decimalBtn = document.getElementsByClassName("decimal")[0];
const equalsBtn = document.getElementsByClassName("equals")[0];
const spriteDiv = document.getElementsByClassName("dancingSprite")[0];

const numberStrs = "0123456789".split("");

const calculator = {
  displayString: "0",

  updateDisplay() {
    document.getElementById("display").innerText = this.displayString;
  },

  appendStringNum(newChar) {
    if (this.displayString === "0") this.displayString = "";
    this.displayString += newChar;
    this.updateDisplay();
  },

  appendStringOperator(newChar) {
    const lastChar = this.displayString[this.displayString.length - 1];
    if (numberStrs.includes(lastChar) || lastChar === ")") {
      this.displayString += newChar;
      this.updateDisplay();
    }
  },

  appendStringParenthesis(newChar) {
    if (newChar === ")") {
      const openCount = (this.displayString.match(/\(/g) || []).length;
      const closeCount = (this.displayString.match(/\)/g) || []).length;
      if (closeCount >= openCount) return;
      const lastChar = this.displayString.slice(-1);
      if (/[\+\-\*\(\/]/.test(lastChar)) return;
    }
    if (this.displayString === "0") {
      this.displayString = "";
    }
    this.displayString += newChar;
    this.updateDisplay();
  },

  appendDecimal() {
    const tokens = this.displayString.split(/[\+\-\*\/\(\)]/);
    const lastToken = tokens[tokens.length - 1];
    if (!lastToken.includes(".")) {
      this.displayString += ".";
      this.updateDisplay();
    }
  },

  calculateResult() {
    try {
      const tokens = tokenizeInfix(this.displayString);
      const postfix = infixToPostfix(tokens);
      const root = buildExpressionTree(postfix);
      let result = evaluateExpressionTree(root);

      if (!isFinite(result)) this.displayString = "Error";
      else this.displayString = result.toString();

    } catch (err) {
      this.displayString = "Error";
    }
    this.updateDisplay();
  }
};

// Attach event listeners
numbersArr.forEach(btn => {
  btn.addEventListener("click", () => {
    calculator.appendStringNum(btn.innerText);
  });
});
operatorsArr.forEach(btn => {
  btn.addEventListener("click", () => {
    calculator.appendStringOperator(btn.innerText);
  });
});
parenthesisArr.forEach(btn => {
  btn.addEventListener("click", () => {
    calculator.appendStringParenthesis(btn.innerText);
  });
});
decimalBtn.addEventListener("click", () => {
  calculator.appendDecimal();
});
equalsBtn.addEventListener("click", () => {
  calculator.calculateResult();
});

// Reset the display
spriteDiv.addEventListener("click", () => {
  calculator.displayString = "0";
  calculator.updateDisplay();
  
});