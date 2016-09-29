js-y86
======

js-y86 is an assembler and simulator written in Javascript.

It supports:

* All of the original y86 instructions plus cmovX
* Breakpoints via `brk`
* Step-by-step execution
* Inspect the contents of the registers, flags, and memory after every instruction
* Manually pause if you get stuck in an infinite loop
* Syntax highlighting
* See your (hopefully useful) compile errors as you type

This [current version](https://github.com/orel33/js-y86/) includes some minor but useful modifications:

* Add new y86 instructions (iaddl, isubl, iandl, ixorl), that is arithmetic operation with an immediate value
* Update the syntax of instructions mrmovl and rmmovl to allow both D(rB), D and (rB) with D as tag or number. 

It is a GutHub fork of a this [previous version](https://github.com/xsznix/js-y86/).




