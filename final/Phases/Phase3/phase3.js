const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Line 1: Store states in an array
let states = [];

// Line 2: Store alphabet in an array
let alphabet = [];

// Line 3: Store stack alphabet in an array
let stackAlphabet = [];

// Line 4 : Store final states in an array
let finalStates = [];

// Line 5: Get the number of transitions (n)
let n = 0;
let transitions = [];

// Function to create a transition object
function createTransitionObject(fromState, toState, inputSymbol, popSymbol, pushSymbol) {
  return {
    from_state: fromState,
    to_state: toState,
    input_symbol: inputSymbol,
    pop_symbol: popSymbol,
    push_symbol: pushSymbol,
  };
}

// Function to handle user input for transitions
function handleTransitionsInput() {
  let count = 0;
  rl.on('line', (input) => {
    if (count === 0) {
      n = parseInt(input);
      // Read transitions
      count++;
    } else if (count <= n) {
      const regex = /\(([^)]+)\),\(([^)]+)\)/g;
      const matches = regex.exec(input);
      if (matches && matches.length === 3) {
        const [, firstPart, secondPart] = matches;
        const [fromState, inputSymbol, popSymbol] = firstPart.split(',');
        const [pushSymbol, toState] = secondPart.split(',');

        transitions.push(
          createTransitionObject(
            fromState.trim(),
            toState.trim(),
            inputSymbol.trim(),
            popSymbol.trim(),
            pushSymbol.trim()
          )
        );
      }

      count++;
      if (count > n) {
        // Close the readline interface
        rl.close();
      }
    }
  });
}

// Start the input process
rl.on('line', (input) => {
  if (states.length === 0) {
    states = input.slice(1, -1).split(',');
  } else if (alphabet.length === 0) {
    alphabet = input.slice(1, -1).split(',');
  } else if (stackAlphabet.length === 0) {
    stackAlphabet = input.slice(1, -1).split(',');
  } else if (finalStates.length === 0){
    finalStates = input.slice(1,-1).split(',');
    // Handle transitions input
    handleTransitionsInput();
  }
});

// Add a new state "qnew" to the states array
function addNewState() {
  states.push('qnew');
}

// Remove all final states and add transitions to "qnew"
function removeFinalStates() {
  finalStates.forEach((finalState) => {
    const transition = {
      from_state: finalState,
      to_state: 'qnew',
      input_symbol: '#',
      pop_symbol: '#',
      push_symbol: '#',
    };
    transitions.push(transition);
  });
  transitions.forEach((transition) => {
    if(finalStates.includes(transition.to_state)){
      if(transition.pop_symbol === "$"){
        if(transition.push_symbol.charAt(transition.push_symbol.length-1) !== "$"){
          if(transition.push_symbol === "#"){
            transition.push_symbol = "$";
          }
          else{
            transition.push_symbol += "$";
          }
        }
      }
    }
  })
  finalStates = [];
}

// Empty the stack for each stackAlphabet (except '$') in "qnew"
function emptyStack() {
  stackAlphabet.forEach((stackSymbol) => {
    if (stackSymbol !== '$') {
      const transition = {
        from_state: 'qnew',
        to_state: 'qnew',
        input_symbol: '#',
        pop_symbol: stackSymbol,
        push_symbol: '#',
      };
      transitions.push(transition);
    }
  });
}

// Add a new final state "qfinal" to the final states array
function addFinalState() {
  states.push('qfinal');
  finalStates.push('qfinal');
}

// Add a transition from "qnew" to "qfinal"
function addTransitionToFinalState() {
  const transition = {
    from_state: 'qnew',
    to_state: 'qfinal',
    input_symbol: '#',
    pop_symbol: '$',
    push_symbol: '#',
  };
  transitions.push(transition);
}

//replace σ, λ → y with σ, τ → yτ (∀τ ∈ Γ)
function replaceLambdaPopTransitions(){
  transitions.forEach((transition) => {
    if(transition.pop_symbol === "#"){
      let index = transitions.indexOf(transition);
      stackAlphabet.forEach((alph) => {
        transitions.push(
          {
            from_state : transition.from_state,
            to_state : transition.to_state,
            input_symbol : transition.input_symbol,
            pop_symbol : alph,
            push_symbol : transition.push_symbol+alph
          }
        );
      })
      transitions.splice(index,1);
    }
  })
}

// replace σ, A → B with σ, A → XB and λ, X → λ (X ∈Γ −{$})
function replaceOneToOne(){
  transitions.forEach((transition) => {
    if(transition.from_state.length === 1 && transition.to_state.length === 1 && transition.from_state.length !== "#" && transition.to_state.length !== "#"){
      if(!states.includes("q"+transition.from_state.substring(1,transition.from_state.length-1)+"_"+transition.to_state.substring(1,transition.to_state.length-1))){
        states.push("q"+transition.from_state.substring(1,transition.from_state.length-1)+"_"+transition.to_state.substring(1,transition.to_state.length-1));
      }
      let index = transitions.indexOf(transition);
      stackAlphabet.forEach((alph) => {
        if(alph !== "$"){
          transitions.push(
            {
              from_state :transition.from_state ,
              to_state : "q"+transition.from_state.substring(1,transition.from_state.length-1)+"_"+transition.to_state.substring(1,transition.to_state.length-1) ,
              input_symbol : transition.input_symbol ,
              pop_symbol : transition.pop_symbol,
              push_symbol : alph+transition.push_symbol 
            }
          );
          transitions.push(
            {
              from_state :"q"+transition.from_state.substring(1,transition.from_state.length-1)+"_"+transition.to_state.substring(1,transition.to_state.length-1) ,
              to_state : transition.to_state ,
              input_symbol : "#" ,
              pop_symbol : alph ,
              push_symbol : "#"
            }
          )
        }
      })
      transitions.splice(index , 1);
    }
  })
}

function replaceTransitionsWithPushStringOfLengthMoreThanTwo(){
  transitions.forEach((transition) => {
    if(transition.push_symbol.length >2){
      count = 1;
      states.push("q"+count+"("+transition.from_state.substring(1,transition.from_state.length-1)+")_("+transition.to_state.substring(1,transition.to_state.length-1)+")");
      stackAlphabet.forEach((alph)=> {
        transitions.push(
          {
            from_state : "q"+count+"("+transition.from_state.substring(1,transition.from_state.length-1)+")_("+transition.to_state.substring(1,transition.to_state.length-1)+")",
            to_state : transition.to_state,
            input_symbol : "#",
            pop_symbol : alph,
            push_symbol : transition.push_symbol[0]+alph
          }
        )
      })
      y = transition.push_symbol;
      push_index = 0;
      pop_index = 1;
      previous_new_state = "q"+count+"("+transition.from_state.substring(1,transition.from_state.length-1)+")_("+transition.to_state.substring(1,transition.to_state.length-1)+")";
      count++;
      for( ; push_index < y.length-2 ; push_index++ ,pop_index++){
        states.push("q"+count+"("+transition.from_state.substring(1,transition.from_state.length-1)+")_("+transition.to_state.substring(1,transition.to_state.length-1)+")");
        transitions.push(
          {
            from_state : "qnew_state_again",
            to_state : previous_new_state,
            input_symbol : "#",
            pop_symbol : y[pop_index],
            push_index : y[push_symbol]+y[push_symbol+1]
          }
        )
        previous_new_state = "q"+count+"("+transition.from_state.substring(1,transition.from_state.length-1)+")_("+transition.to_state.substring(1,transition.to_state.length-1)+")";
        count++;
      }
      transitions.push(
        {
          from_state : transition.from_state,
          to_state : previous_new_state ,
          input_symbol : transition.input_symbol,
          pop_symbol : transition.pop_symbol,
          push_symbol : y[y.length-2] + y[y.length-1]
        }
      )
      transitions.splice(transitions.indexOf(transition), 1);
    }
  })
}

function hasUniqueFinalStateAndEmptiesStack(){
  if(finalStates.length > 1){
    return false;
  }
  transitions.forEach((transition) => {
    if(transition.to_state === finalStates[0]){
      if(transition.pop_symbol !== "$"){
        return false;
      }
    }
  })
  return true;
}
let grammar = {};

function constructTerminalTransitions() {
  transitions.forEach((transition) => {
    if (transition.push_symbol === "#") {
      const before = "<" + transition.from_state + transition.pop_symbol + transition.to_state + ">";
      const after = transition.input_symbol;

      if (grammar[before]) {
        grammar[before].push(after);
      } else {
        grammar[before] = [after];
      }
    }
  });
}


function constructMixedTransitions() {
  transitions.forEach((transition) => {
    if (transition.pop_symbol.length === 1 && transition.push_symbol.length === 2) {
      states.forEach((alph1) => {
        states.forEach((alph2) => {
          const before = "<" + transition.from_state + transition.pop_symbol + alph1 + ">";
          const after = transition.input_symbol + "<" + transition.to_state + transition.push_symbol[0] + alph2 + "><" + alph2 + transition.push_symbol[1] + alph1 + ">";

          if (grammar[before]) {
            grammar[before].push(after);
          } else {
            grammar[before] = [after];
          }
        });
      });
    }
  });
}


// Function to remove repeated transitions
function removeRepeatedTransitions() {
  let uniqueTransitions = [];

  transitions.forEach((transition) => {
    // Check if the transition is already present in the uniqueTransitions array
    const isDuplicate = uniqueTransitions.some((uniqueTransition) =>
      compareTransitions(transition, uniqueTransition)
    );

    // If the transition is not a duplicate, add it to the uniqueTransitions array
    if (!isDuplicate) {
      uniqueTransitions.push(transition);
    }
  });

  transitions = uniqueTransitions;
}

// Function to compare transitions for equality
function compareTransitions(transition1, transition2) {
  return (
    transition1.from_state === transition2.from_state &&
    transition1.to_state === transition2.to_state &&
    transition1.input_symbol === transition2.input_symbol &&
    transition1.pop_symbol === transition2.pop_symbol &&
    transition1.push_symbol === transition2.push_symbol
  );
}

rl.on('close', () => {
  //remove repeated transitions
  removeRepeatedTransitions();

  //empty stack and make a unique final state
  if(!hasUniqueFinalStateAndEmptiesStack()){
    addNewState();
    removeFinalStates();
    emptyStack();
    addFinalState();
    addTransitionToFinalState();
  }
  
  //remove repeated transitions
  removeRepeatedTransitions();

  //remove σ, λ → y 
  replaceLambdaPopTransitions();

  //remove repeated transitions
  removeRepeatedTransitions();

  //replace σ, A → B with σ, A → XB and λ,X → λ
  replaceOneToOne();

  //remove repeated transitions
  removeRepeatedTransitions();

  //replace σ, A → By with σ, A → y and λ, X → BX
  replaceTransitionsWithPushStringOfLengthMoreThanTwo();

  //remove repeated transitions
  removeRepeatedTransitions();

  //construct the grammar 
  constructTerminalTransitions();
  constructMixedTransitions();
  // Print the modified transitions
  console.log("================");
  console.log(grammar);
});