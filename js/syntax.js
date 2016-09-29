var SYNTAX = {};

SYNTAX['halt'] = [];
SYNTAX['nop'] = [];

SYNTAX['rrmovl'] = ['rA', 'rB'];
SYNTAX['cmovle'] = ['rA', 'rB'];
SYNTAX['cmovl'] = ['rA', 'rB'];
SYNTAX['cmove'] = ['rA', 'rB'];
SYNTAX['cmovne'] = ['rA', 'rB'];
SYNTAX['cmovge'] = ['rA', 'rB'];
SYNTAX['cmovg'] = ['rA', 'rB'];

SYNTAX['irmovl'] = ['V', 'rB'];
SYNTAX['rmmovl'] = ['rA', 'D(rB)'];
SYNTAX['mrmovl'] = ['D(rB)', 'rA'];

SYNTAX['addl'] = ['rA', 'rB'];
SYNTAX['subl'] = ['rA', 'rB'];
SYNTAX['xorl'] = ['rA', 'rB'];
SYNTAX['andl'] = ['rA', 'rB'];

SYNTAX['jmp'] = ['Dest'];
SYNTAX['jle'] = ['Dest'];
SYNTAX['jl'] = ['Dest'];
SYNTAX['je'] = ['Dest'];
SYNTAX['jne'] = ['Dest'];
SYNTAX['jge'] = ['Dest'];
SYNTAX['jg'] = ['Dest'];

SYNTAX['call'] = ['Dest'];
SYNTAX['ret'] = [];
SYNTAX['pushl'] = ['rA'];
SYNTAX['popl'] = ['rA'];

SYNTAX['iaddl'] = ['V', 'rB'];
SYNTAX['isubl'] = ['V', 'rB'];
SYNTAX['ixorl'] = ['V', 'rB'];
SYNTAX['iandl'] = ['V', 'rB'];

SYNTAX['brk'] = [];
SYNTAX['brkle'] = [];
SYNTAX['brkl'] = [];
SYNTAX['brke'] = [];
SYNTAX['brkne'] = [];
SYNTAX['brkge'] = [];
SYNTAX['brkg'] = [];

