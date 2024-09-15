def str_acceptor(states, final_states, transitions_list, input_string):
    initial_state = states[0]
    pda_stack = []
    pda_stack.append("$")

    next_states = []
    next_states.append([initial_state, input_string, pda_stack])

    current_state = initial_state
    possible_final_states = []
    try:
        while next_states:
            next_s = next_states.pop(0)
            current_state = next_s[0]
            current_input_str = next_s[1]
            current_stack = list(next_s[2])

            # Process lambda transitions
            lambda_transitions = [
                transition for transition in transitions_list
                if transition["state_1"] == current_state
                   and (transition["pop_symbol"] == current_stack[-1] or transition["pop_symbol"] == "#")
                   and transition["input_symbol"] == "#"
            ]
            for transition in lambda_transitions:
                new_stack = list(current_stack)
                if transition["pop_symbol"] != "#":
                    new_stack.pop()
                if transition["push_symbol"] != "#":
                    new_stack.append(transition["push_symbol"])
                next_states.append([transition["state_2"], current_input_str, new_stack])

            # Process input symbols
            if current_input_str:
                for transition in transitions_list:
                    if transition["state_1"] == current_state and (
                            transition["pop_symbol"] == current_stack[-1] or transition["pop_symbol"] == "#"
                    ) and transition["input_symbol"] == current_input_str[0]:
                        new_input_str = current_input_str[1:]
                        new_stack = list(current_stack)
                        if transition["pop_symbol"] != "#":
                            new_stack.pop()
                        if transition["push_symbol"] != "#":
                            new_stack.append(transition["push_symbol"])
                        next_states.append([transition["state_2"], new_input_str, new_stack])

    except:
        return "Rejected"

    for final_state in final_states:
        if final_state == current_state:
            return "Accepted"

    return "Rejected"


# main:
states = input().replace("{", "").replace("}", "").split(",")

pda_alphabet = input().replace("{", "").replace("}", "").split(",")

stack_alphabet = input().replace("{", "").replace("}", "").split(",")

final_states = input().replace("{", "").replace("}", "").split(",")

transitions_num = int(input())

transitions_list = []
for i in range(transitions_num):
    temp = input().replace("(", "").replace(")", "").split(",")
    transitions_list.append({
        "state_1": temp[0],
        "input_symbol": temp[1],
        "pop_symbol": temp[2],
        "push_symbol": temp[3],
        "state_2": temp[4]
    })

input_string = input()

print(str_acceptor(states, final_states, transitions_list, input_string))
