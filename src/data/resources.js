// conceptId -> [notes, example code, search keywords]
const RESOURCES = {
  var: [
    'Variables store values. Python infers the type: int, float, str, bool. The / operator always returns a float; // returns an integer.',
    'x = 7 / 2   # 3.5 (float)\ny = 7 // 2  # 3 (int)',
    'variable type int float string bool assignment',
  ],
  loop: [
    'A for loop repeats over a sequence; range(n) yields 0 to n-1. A while loop repeats while its condition is true, so the condition must change. break exits; continue skips to the next iteration.',
    'for i in range(1, 4):\n    print(i)  # 1 2 3',
    'loop for while range iterate break continue',
  ],
  fn: [
    'A function groups reusable steps. Arguments go in; return sends a value back (None if absent). Variables created inside are local.',
    'def double(x):\n    return x * 2\nprint(double(double(2)))  # 8',
    'function def return argument parameter scope local',
  ],
  arr: [
    'A list stores ordered items. Indexes start at 0; the last is len(a) - 1. Out-of-range access raises IndexError. Slices like a[1:] copy part of the list.',
    'a = [1, 2, 3]\na.append(4)\nprint(a[-1], a[1:])',
    'array list index slice append element',
  ],
  rec: [
    'Recursion solves a problem by calling the same function on a smaller input. Every recursive function needs a base case that stops the calls and a recursive step that moves toward it. Without a base case you get RecursionError.',
    'def fact(n):\n    if n == 0:        # base case\n        return 1\n    return n * fact(n - 1)  # recursive step\n# fact(3) -> 3 * 2 * 1 * 1 = 6',
    'recursion recursive base case factorial stack itself',
  ],
  dbg: [
    'Debugging is finding why code behaves differently from what you expect. Read the error message, trace values with print or a debugger, and change one thing at a time. Syntax errors stop code from running; logic errors give wrong results.',
    'if x == 5:   # "=" would be a SyntaxError\n    print("five")',
    'debug bug error syntax logic trace traceback',
  ],
};
Object.assign(RESOURCES, {
  op: [
    'Operators combine values. + - * / do arithmetic; // floors, % gives the remainder, ** is exponent. Precedence: ** first, then * / // %, then + -.',
    'print(7 % 3)   # 1\nprint(2 ** 3)  # 8\nprint(5 // 2)  # 2',
    'operator modulo remainder exponent floor expression precedence',
  ],
  cond: [
    'Conditionals choose what runs. Use if, elif and else. Conditions are boolean expressions combined with and, or, not. Values like 0 and empty strings are falsy.',
    'if score >= 50:\n    print("pass")\nelif score >= 40:\n    print("retry")\nelse:\n    print("fail")',
    'conditional if elif else boolean condition truthy',
  ],
  io: [
    'input() reads text from the user and always returns a string, so convert it with int() or float(). print() writes output; end="" avoids the newline.',
    'n = int(input("Number: "))\nprint("Double:", n * 2)',
    'input output print read user',
  ],
  str: [
    'Strings are sequences of characters. Index from 0, slice with s[a:b], join with +, and use len(s) for length. Strings cannot be changed in place.',
    's = "python"\nprint(s[0], s[1:3], len(s))',
    'string text character slice concatenate len',
  ],
  dict: [
    'A dictionary maps keys to values. Read with d[key]; a missing key raises KeyError, so use d.get(key) for a safe default. keys(), values() and items() help you loop.',
    'd = {"a": 1}\nprint(d["a"], d.get("z", 0))',
    'dictionary dict key value keys items get',
  ],
  file: [
    'Open files with open(name, mode). Modes: "r" read, "w" write (erases), "a" append. Use with open(...) as f so the file always closes.',
    'with open("data.txt") as f:\n    for line in f:\n        print(line.strip())',
    'file open read write append mode close',
  ],
  exc: [
    'Exceptions are runtime errors. Wrap risky code in try, handle it with except, and use finally for cleanup that must always run.',
    'try:\n    n = int("abc")\nexcept ValueError:\n    print("not a number")\nfinally:\n    print("done")',
    'exception try except finally error handle',
  ],
  srch: [
    'Linear search checks items one by one (up to n checks). Binary search halves a sorted list each step, so it needs far fewer checks.',
    'def linear(a, x):\n    for i, v in enumerate(a):\n        if v == x:\n            return i\n    return -1',
    'search linear binary find sorted',
  ],
  sort: [
    'Sorting orders items. Bubble sort swaps neighbours repeatedly. In Python, sorted(a) returns a new list while a.sort() changes the list and returns None.',
    'a = [3, 1, 2]\nprint(sorted(a))  # [1, 2, 3]\na.sort()          # a is now sorted',
    'sort sorted bubble order swap',
  ],
});
export default RESOURCES;
