var SYNTAX = {};

SYNTAX['halt'] = [];
SYNTAX['nop'] = [];
SYNTAX['rrmovl'] = ['rA', 'rB'];
SYNTAX['irmovl'] = ['V', 'rB'];
SYNTAX['rmmovl'] = ['rA', 'D(rB)'];
SYNTAX['mrmovl'] = ['D(rB)', 'rA'];

SYNTAX['addl'] = ['rA', 'rB'];
SYNTAX['subl'] = ['rA', 'rB'];
SYNTAX['xorl'] = ['rA', 'rB'];
SYNTAX['andl'] = ['rA', 'rB'];

SYNTAX['jmp'] = ['Dest'];
SYNTAX['jg'] = ['Dest'];
SYNTAX['jge'] = ['Dest'];
SYNTAX['je'] = ['Dest'];
SYNTAX['jne'] = ['Dest'];
SYNTAX['jl'] = ['Dest'];
SYNTAX['jle'] = ['Dest'];

SYNTAX['call'] = ['Dest'];
SYNTAX['ret'] = [];
SYNTAX['pushl'] = ['rA'];
SYNTAX['popl'] = ['rA'];

SYNTAX['brk'] = [];
SYNTAX['brkg'] = [];
SYNTAX['brkge'] = [];
SYNTAX['brke'] = [];
SYNTAX['brkne'] = [];
SYNTAX['brkl'] = [];
SYNTAX['brkle'] = [];