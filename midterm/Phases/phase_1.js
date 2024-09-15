const data = require("./../samples/phase1-sample/in/input1.json");

// parsing json

const states = data.states.replace(/'|{|}/g, "").split(",");
const input_symbols = data.input_symbols.replace(/'|{|}/g, "").split(",");
const initial_state = data.initial_state;
const final_states = data.final_states.replace(/'|{|}/g, "").split(",");
let transitions = Object.entries(data.transitions);

// convert transition object of json to transition table

let transTable = [];
let column = [null, "", "", ""];

transitions = transitions.map((i) => {
  i[1] = Object.entries(i[1]);
  i[1] = i[1].map((j) => {
    j[1] = j[1].replace(/'|{|}/g, "").split(",");
    return j;
  });
  column[0] = i[0];
  i[1].forEach((element) => {
    if (element[0] === "") element[0] = "λ";
    if (element[0] === "λ") column[3] += element[1];
    else if (element[0] === input_symbols[0]) column[1] += element[1];
    else if (element[0] === input_symbols[1]) column[2] += element[1];
  });
  transTable.push(column);
  column = [null, "", "", ""];
  i = i[1];
  return i;
});

console.table(transTable);

// convert epsilon NFA to NFA

const closureTable = [];

transTable.forEach((state) => {
  let closure = [];
  closure.push(state[0], state[1], state[2]);
  if (state[3] !== "") {
    let epsilonMove = state[3].split(",");
    for (let epsilon of epsilonMove) {
      if (
        final_states.find((st) => st === epsilon) !== undefined &&
        final_states.find((st) => st === state[0]) === undefined
      )
        final_states.push(state[0]);
      while (epsilon !== "") {
        for (let epsilonState of transTable) {
          if (epsilonState[0] === epsilon) {
            closure[0] += "," + epsilon;
            if (closure[1] === "") closure[1] += epsilonState[1];
            else if (epsilonState[1] !== "")
              closure[1] += "," + epsilonState[1];
            if (closure[2] === "") closure[2] += epsilonState[2];
            else if (epsilonState[2] !== "")
              closure[2] += "," + epsilonState[2];
            epsilon = epsilonState[3];
            break;
          }
        }
      }
    }
    closure[0] = closure[0].split(",").sort();
    let ns = "";
    for (let x of closure[0]) ns += x;
    closure[0] = ns;
    const xs = state[0];
    transTable.map((x) => {
      if (x[0].search(xs) !== -1) x[0] = x[0].replace(xs, ns);
      if (x[1].search(xs) !== -1) x[1] = x[1].replace(xs, ns);
      if (x[2].search(xs) !== -1) x[2] = x[2].replace(xs, ns);
      if (x[3].search(xs) !== -1) x[3] = x[3].replace(xs, ns);
      return x;
    });
    closureTable.map((x) => {
      if (x[0].search(xs) !== -1) x[0] = x[0].replace(xs, ns);
      if (x[1].search(xs) !== -1) x[1] = x[1].replace(xs, ns);
      if (x[2].search(xs) !== -1) x[2] = x[2].replace(xs, ns);
      return x;
    });
  }
  closureTable.push(closure);
});

console.table(closureTable);

// convert nfa to dfa

transTable = [];
let newState = [];

const convert = (state) => {
  let st = [state[0]];
  let ns = "";
  state[1] = state[1].split(",").sort();
  for (let x of state[1]) {
    if (ns.search(x) === -1) ns += x;
  }
  if (state[1].length > 1) {
    if (!transTable.find((x) => x[0] === ns) && ns !== state[0])
      newState.push(ns);
  }
  if (ns === "") st.push("TRAP");
  else st.push(ns);
  ns = "";
  state[2] = state[2].split(",").sort();
  for (let x of state[2]) {
    if (ns.search(x) === -1) ns += x;
  }
  if (state[2].length > 1) {
    if (!transTable.find((x) => x[1] === ns) && ns !== state[0])
      newState.push(ns);
  }
  if (ns === "") st.push("TRAP");
  else st.push(ns);

  transTable.push(st);
};

let remain = [];

const transform = (state) => {

  convert(state);

  while (newState.length !== 0) {
    const i = newState.length - 1;
    let trans = [newState[i]];
    let flag = false;
    for (let x of transTable) {
      if (x[0] === trans[0]) {
        flag = true;
        break;
      }
    }
    if (!flag) {
      let a = "",
        b = "";
      for (let i = 0; i < trans[0].length; i += 2) {
        let q = "";
        for (let j = trans[0].length; j >= i + 2; j -= 2) {
          q = trans[0].substring(i, j);
          if (closureTable.find((x) => x[0] === q)) break;
        }
        for (let x of closureTable) {
          if (x[0] === q) {
            if (x[1] !== "") {
              if (a === "") a += x[1];
              else a += "," + x[1];
            }
            if (x[2] !== "") {
              if (b === "") b += x[2];
              else b += "," + x[2];
            }
            break;
          }
        }
      }
      trans.push(a, b);
      newState.pop();
      convert(trans);
    } else newState.pop();
  }
}

for (let state of closureTable) {
  if (
    state[0] !== "q0" &&
    !transTable.find((x) => {
      if (state[0] === x[0]) return true;
      if (x[1] !== "TRAP" && state[0] === x[1]) return true;
      if (x[2] !== "TRAP" && state[0] === x[2]) return true;
      return false;
    })
  ) {
    remain.push(state);
    continue;
  }

  transform(state);
}

while(remain.length !== 0) {
  let i = remain.length-1;
  if(transTable.find(x => x[1] === remain[i][1] || x[2] === remain[i][2]))
    transform(remain[i]);
  remain.pop();
}

for(let t of transTable) {
  if(t[1] === "TRAP" || t[2] === "TRAP") {
    transTable.push(["TRAP", "TRAP", "TRAP"]);
    break;
  }
}

if(transTable.length === 0)
  transTable = closureTable;

console.table(transTable);

console.table(transTable);

newState = "{";
let newFinalState = "{";
let newTransitions = {};
let newInputSymbol = data.input_symbols;
let newInitialState = data.initial_state;
transTable.forEach(x => {
  newState += '\'' + x[0] + '\',';
  for(let y of final_states) {
    if(x[0].includes(y)) {
      newFinalState += '\'' + x[0] + '\',';
      break;
    }
  }
  let no = {};
  no[input_symbols[0]] = x[1];
  no[input_symbols[1]] = x[2];
  newTransitions[x[0]] = no;
});

newFinalState = newFinalState.slice(0,-1) + "}";
newState = newState.slice(0,-1) + "}";

console.log(newState);
console.log(newFinalState);
console.log(newTransitions);

const json = require('fs');

const jsonData = JSON.stringify({
  "states": newState,
  "input_symbols":newInputSymbol,
  "transitions": newTransitions,
  "initial_state": newInitialState,
  "final_states": newFinalState
}, null, 2);

json.writeFile('Phases/phase_1.json', jsonData, (err) => {
  if (err) throw err;
  console.log('Data written to file');
});