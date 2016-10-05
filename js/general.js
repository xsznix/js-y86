// General constants and functions
var INSTRUCTION_LEN = [1, 1, 2, 6,
                       6, 6, 2, 5,
                       5, 1, 2, 2,
                       6, 1, 1, 1],
	num2reg = ['%eax', '%ecx', '%edx', '%ebx','%esp', '%ebp', '%esi', '%edi'],
	inst2num = {
		'halt': 0,
		'nop': 1,

		'rrmovl': 2,
		'cmovle': 2,
		'cmovl': 2,
		'cmove': 2,
		'cmovne': 2,
		'cmovge': 2,
		'cmovg': 2,

		'irmovl': 3,
		'rmmovl': 4,
		'mrmovl': 5,

		'addl': 6,
		'subl': 6,
		'andl': 6,
		'xorl': 6,

		'jmp': 7,
		'jle': 7,
		'jl': 7,
		'je': 7,
		'jne': 7,
		'jge': 7,
		'jg': 7,

		'call': 8,
		'ret': 9,
		'pushl': 10,
		'popl': 11,

	        'iaddl': 12,
	        'isubl': 12,
	        'iandl': 12,
                'ixorl': 12,  

		'brk': 15,
		'brkle': 15,
		'brkl': 15,
		'brke': 15,
		'brkne': 15,
		'brkge': 15,
		'brkg': 15
	},
	inst2fn = {
		'addl': 0,
		'subl': 1,
		'andl': 2,
		'xorl': 3,

		'rrmovl': 0,
		'cmovle': 1,
		'cmovl': 2,
		'cmove': 3,
		'cmovne': 4,
		'cmovge': 5,
		'cmovg': 6,

		'jmp': 0,
		'jle': 1,
		'jl': 2,
		'je': 3,
		'jne': 4,
		'jge': 5,
		'jg': 6,

	        'iaddl': 0,
	        'isubl': 1,
	        'iandl': 2,
                'ixorl': 3,  
	    
		'brk': 0,
		'brkle': 1,
		'brkl': 2,
		'brke': 3,
		'brkne': 4,
		'brkge': 5,
		'brkg': 6
	};

function print(x){
	return console.log(x);
}

function printRegisters(registers){
	print(reg2str(registers));
}

function reg2str(registers){
	var result = ''
	for (r in registers) {
		if (r.length === 1) {
			result += (num2reg[r] + ': ' + registers[r].toString(16));
		} else {
			result += (r + ': ' + registers[r].toString(16));
		}
		result += '\n';
	}
	return result;
}

function printMemory(){
	var i = 0,
		str = '';
	for(b in MEMORY){
		if (i % 4 === 0 && i > 0) {
			print('PC = ' + (i - 4) + ' | ' + str);
			str = '';
		}
		str += num2hex(MEMORY[b]);
		i++;
	} 
	//print(MEMORY);
}

function num2hex(num){
	var result = num.toString(16);
	return result.length % 2 === 1 ? '0' + result : result;
}

function toBigEndian(hexstr){
	var i, result = '';
	if(hexstr.length % 2 === 1){
		hexstr = '0' + hexstr;
	}
	for (i = hexstr.length; i > 0; i -= 2){
		result += hexstr.substr(i - 2, 2);
	}
	return result;
}

function toLittleEndian(hexstr){
	return toBigEndian(hexstr);
}

function hexstr2num(h){
	return parseInt(x, 16);
}

// Parse a number that is either in base 10 or in base 16 with '0x' in front.
function parseNumberLiteral (str) {
	if (isNaN(str))
		throw new Error('Not a number: ' + str);
	else if (str.length > 2 && str.substr(0, 2) === '0x')
		return parseInt(str, 16);
	else
		return parseInt(str, 10);
}

function padHex(num, width){
	var result = num ? num.toString(16) : '0';
	while (result.length < width) {
		result = '0' + result;
	}
	return result;
}
