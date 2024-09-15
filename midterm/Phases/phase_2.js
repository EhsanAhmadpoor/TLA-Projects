const data = require("./../samples/phase2-sample/in/input1.json");

// parsing json

let states = data.states.replace(/'|{|}/g, "").split(",");
const input_symbols = data.input_symbols.replace(/'|{|}/g, "").split(",");
const initial_state = data.initial_state;
const final_states = data.final_states.replace(/'|{|}/g, "").split(",");
let transitions = Object.entries(data.transitions);

// convert transition object of json to transition table

let transTable = [];
let column = [null, "", ""];

transitions = transitions.map((i) => {
  i[1] = Object.entries(i[1]);
  i[1] = i[1].map((j) => {
    j[1] = j[1].replace(/'|{|}/g, "").split(",");
    return j;
  });
  column[0] = i[0];
  i[1].forEach((element) => {
    if (element[0] === input_symbols[0]) column[1] += element[1];
    else if (element[0] === input_symbols[1]) column[2] += element[1];
  });
  transTable.push(column);
  column = [null, "", ""];
  i = i[1];
  return i;
});

// remove unreachable states

let reachableState = [];

for (let i of transTable) {
  if (i[0] === "q0") {
    reachableState.push("q0");
    continue;
  }
  for (let j of transTable) {
    if (i[0] !== j[0]) {
      if (i[0] === j[1] || i[0] === j[2]) {
        reachableState.push(i[0]);
        break;
      }
    }
  }
}

transTable = transTable.filter((s) => reachableState.includes(s[0]));
states = states.filter((s) => reachableState.includes(s));

// 0 Equivalence

let equStates = states;
let oldEqu = [[], []];
let newEqu = [];

for (let i of states) {
  if (final_states.includes(i)) oldEqu[1].push(i);
  else oldEqu[0].push(i);
}

// find all equivalence

const findIndex = (array, element) => {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      if (array[i][j] === element) {
        return i;
      }
    }
  }
  return null;
};

const arraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].length !== arr2[i].length) return false;
    for (let j = 0; j < arr1[i].length; j++) {
      if (arr1[i][j] !== arr2[i][j]) return false;
    }
  }
  return true;
};

const table = [...transTable];

while (!arraysEqual(oldEqu, newEqu)) {
  if (newEqu.length !== 0) oldEqu = newEqu;
  newEqu = [];
  let trans = [...table];
  newEqu.push([trans[0]]);
  for (let t of trans) {
    if (t === trans[0]) continue;
    let flag = false;
    for (let eq of newEqu) {
      if (
        findIndex(oldEqu, t[1]) === findIndex(oldEqu, eq[0][1]) &&
        findIndex(oldEqu, t[2]) === findIndex(oldEqu, eq[0][2])
      ) {
        eq.push(t);
        flag = true;
        break;
      }
    }
    if (!flag) {
      newEqu.push([t]);
    }
  }
  newEqu = newEqu.map((arr) => {
    arr = arr.map((s) => {
      s = s[0];
      return s;
    });
    return arr;
  });
  delete trans;
  console.log("================\n");
  console.table(oldEqu);
  console.table(newEqu);
}

console.table(transTable);

// dfa minimization

let finalEqu = [...newEqu];
let miniDFA = [];
for (let i = 0; i < finalEqu.length; i++) {
  let state = finalEqu[i].join("");
  let symb1 = "";
  let symb2 = "";
  for (let st of transTable) {
    if (state.includes(st[0])) {
      if (state.includes(st[1])) symb1 = state;
      else symb1 = st[1];
      if (state.includes(st[2])) symb2 = state;
      else symb2 = st[2];
    }
  }
  miniDFA.push([state, symb1, symb2]);
  console.log(state, symb1, symb2);
}
for (let md of miniDFA) {
  let state = md[0];
  for (let m of miniDFA) {
    if (state.includes(m[1])) m[1] = state;
    if (state.includes(m[2])) m[2] = state;
  }
}
console.table(miniDFA);

// create output json

newState = "{";
let newFinalState = "{";
let newTransitions = {};
let newInputSymbol = data.input_symbols;
let newInitialState = data.initial_state;
miniDFA.forEach(x => {
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

const json = require('fs');

const jsonData = JSON.stringify({
  "states": newState,
  "input_symbols":newInputSymbol,
  "transitions": newTransitions,
  "initial_state": newInitialState,
  "final_states": newFinalState
}, null, 2);

json.writeFile('Phases/phase_2.json', jsonData, (err) => {
  if (err) throw err;
  console.log('Data written to file');
});