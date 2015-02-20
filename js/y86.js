// Constants
var MEM_SIZE = 0x10000;

// Registers and memory
var PC 		= 0,
	REG		= new Uint32Array(8),
	STAT	= 'AOK',
	MEMORY 	= new Uint8Array(MEM_SIZE),
	SF = 0, ZF = 0, OF = 0,
	ERR = 'AOK';

// Uint32Arrays are not actually arrays
Uint8Array.prototype.slice = function () {
	return Array.prototype.slice.apply(this, arguments);
}

// Print
function print (x) {
	console.log(x);
}

// Reset
function RESET() {
	PC 	= 0;
	REG	= new Uint32Array(8);
	STAT = 'AOK';
	SF = 0; ZF = 0; OF = 0;
	ERR = 'AOK';
}

// Load
function LD (addr) {
	var result;
	if (addr > MEMORY.length || addr < 0) {
		STAT = 'ADR';
		print("Invalid address. PC = " + addr);
		return 0;
	}
	result  = MEMORY[addr];
	result |= MEMORY[addr + 1] << 8;
	result |= MEMORY[addr + 2] << 16;
	result |= MEMORY[addr + 3] << 24;
	return result;
}

// Store
function ST(addr, data, bytes){
	var result, i;
	if (addr < 0) {
		STAT = 'ADR';
	}
	if (typeof bytes === 'undefined') {
		bytes = Math.ceil(Math.log(data + 1) / Math.log(16) / 2);
		print('No Bytes, using ' + bytes)
	}
	for (i = 0; i < bytes; i++){
		MEMORY[addr + i] = data & 0xFF;
		data = data >> 8;
	}
	return addr;
}

// Decode instruction
function DECODE (bytearr) {
	var args = {
			icode: 	bytearr[0] >> 4,
			fn: 	bytearr[0] & 0x0F
		},
		len = bytearr.length;

	if (len > 1) {
		args['rA'] = (bytearr[1] >> 4) & 0x0F;
		args['rB'] = bytearr[1] & 0x0F;
	}
	if (len === 5) {
		var temp = bytearr[1];
		temp |= bytearr[2] << 8;
		temp |= bytearr[3] << 16;
		temp |= bytearr[4] << 24;
		args['Dest'] = temp;
	} else if (len === 6) {
		var temp = bytearr[2];
		temp |= bytearr[3] << 8;
		temp |= bytearr[4] << 16;
		temp |= bytearr[5] << 24;
		args['D'] = temp;
		args['V'] = temp;
	}
	return args;
}

function evalArgs(list, args, symbols){
	var item, result = {};
	for (i in list) {
		item = list[i];
		if (item === 'rA') {
			result['rA'] = num2reg.indexOf(args[i]).toString(16);
		}
		else if (item === 'rB') {
			result['rB'] = num2reg.indexOf(args[i]).toString(16);
		}
		else if (item === 'V' || item === 'D') {
			if (symbols.hasOwnProperty(args[i])) {
				result['V'] = toBigEndian(padHex(symbols[args[i]], 8));
				result['D'] = result['V'];
			} else {
				args[i] = args[i].replace(/^\$/, '');

				// If negative number...
				if (args[i][0] === '-') {
					args[i] = 0 - parseNumberLiteral(args[i].substr(1));
					args[i] = (args[i] >> 24 & 0xFF).toString(16) + (args[i] & 0x00FFFFFF).toString(16);
					result['V'] = toBigEndian(padHex(args[i], 8));
				} else {
					result['V'] = toBigEndian(padHex(parseNumberLiteral(args[i]), 8));
				}
				result['D'] = result['V'];
			}
		} else if (item === 'Dest') {
			result['Dest'] = toBigEndian(padHex(symbols[args[i]].toString(16), 8));
		} else if (item === 'D(rB)') {
			result['D'] = toBigEndian(padHex(parseNumberLiteral(args[i].replace(/\(.*/, '')), 8));
			result['rB'] = num2reg.indexOf(args[i].replace(/^.*\((.*)\)/, '$1'));
		}
	}
	return result;
}

function ENCODE(instr, symbols) {
	var result = '',
		args = [],
		vars = {},
		icode;

	instr = instr.replace(/\s*,\s*/i, ',');
	args = instr.split(' ');
	instr = args.splice(0, 1)[0];
	args = args[0] ? args[0].split(',') : new Array();

	vars = evalArgs(SYNTAX[instr], args, symbols);
	icode = inst2num[instr];
	if (inst2fn.hasOwnProperty(instr)) {
		vars['fn'] = inst2fn[instr];
	}
	
	if (icode in ASSEM) {
		result = ASSEM[icode].call(vars);
	} else {
		//print('Invalid instruction ' + instr);
		ERR = 'INS';
		return '';
	}
	return result;
}

function ASSEMBLE (raw) {
	var lines = raw.split('\n'), line,
		symbols = {},
		result = new Array(lines.length),
		inst, icode,
		sym, next = 0,
		counter = 0;
		raw = raw.split('\n');
	RESET();
	// Clean up raw e.g. remove comments, fix spacing
	for (i in lines) {
		line = lines[i];
		line = line.replace(/#.*/gi, '');
		line = line.replace(/^\s+/gi, '');
		line = line.replace(/\s+$/gi, '');
		line = line.replace(/\s+/gi, ' ');
		lines[i] = line;
	}
	// Create symbol table and do directives
	for (i in lines) {
		line = lines[i];
		if (line === '') {
			result[i] = ' ';
			continue;
		}

		try {
			// Look for symbol and add to symbols
			sym = line.match(/(^.*?):/);
			if (sym) {
				symbols[sym[1]] = counter;
				line = line.replace(/^.*?:\s*/i, '');
				//print('SYMBOL ' + sym[1] + ' at ' + counter);
			}
			// Look for directive
			dir = line.match(/(^\..*?) (.*)/i);
			if (dir) {
				if (dir[1] === '.pos') {
					counter = parseNumberLiteral(dir[2]);
				} else if (dir[1] === '.align') {
					counter = Math.ceil(counter / 4) * 4;
				}
			}
			// Add to result str
			result[i] = ' 0x' + padHex(counter, 3) + ': ';		
			if (dir) {
				if (dir[1] === '.long') {
					result[i] += toBigEndian(padHex(parseNumberLiteral(dir[2]), 8)) + ' ';
					counter += 4;
				}
				line = line.replace(/(^\..*?) (.*)/i, '');
			}
			// Move counter
			inst = line.match(/(^[a-z]+)/i);
			lines[i] = line;
			if (inst) {
				icode = inst2num[inst[1]];
				counter += INSTRUCTION_LEN[icode];
			}
			step = 0;
		} catch (e) {
			return 'Error while parsing symbols and directives on line ' + i + ': ' + e;
		}
	}
	// Assemble each instructions
	counter = 0;
	for (i in lines) {
		try {
			line = lines[i];
			inst = line.match(/^([a-z]+)(.*)/i);
			if (inst) {
				result[i] += ENCODE(line, symbols) + ' ';
			}
			if (ERR !== 'AOK') {
				//print('Invalid instruction at ' + counter);
				return 'Invalid instruction "' + line + '" on line ' + (counter + 1);
			}
			result[counter] += '|' + (raw[counter] !== '' ? ' ' + raw[counter] : '');
		} catch (e) {
			return 'Error while assembling instructions on line ' + i + ': ' + e;
		}
		counter++;
	}
	result = result.join('\n');
	return result;
}

// Initialize the VM with some object code
function INIT (obj) {
	MEMORY = toByteArray(obj);
	STAT = 'AOK';
	RESET();
}

// Run until hitting a breakpoint, halting, or erroring
function RUN () {
	// Resume from breakpoint, if applicable
	if (STAT === 'DBG')
		STAT = 'AOK';

	while (PC < MEM_SIZE && STAT === 'AOK') {
		STEP();
	}

	return STAT;
}

// TODO: eventually, this will become a five-part pipeline
function STEP () {
	// Fetch
	var icode = MEMORY[PC] >> 4;
	var ilen = INSTRUCTION_LEN[icode];
	var instr = MEMORY.slice(PC, PC + ilen);

	PC += ilen;

	// Decode
	var args = DECODE(instr);

	// Execute + Memory + Write Back ???
	INSTR[icode].call(args);
}

function hex2arr (str) {
	var result = [], i;
	for (i = 0; i < str.length; i += 2) {
		result.push(parseInt(str[i] + str[i + 1], 16));
	}
	return result;
}

// Object file string to byte array
function toByteArray(str) {
	var lines = str.split('\n'),
		line, addr, size, bytearr;

	// Get size of program, pad with 32 bytes at end
	// for (i in lines) {
	// 	line = lines[i];
	// 	addr = line.match(/^\s*0x([\da-f]+)/i);
	// 	if (addr) {
	// 		size = parseInt(addr[1], 16) + 32;
	// 	}
	// }
	// Init array with 0's
	bytearr = new Uint8Array(MEM_SIZE);

	// Set instructions at correct locations
	for (i in lines) {
		line = lines[i];
		match = line.match(/\s*(0x([0-9a-f]+):\s*)?([0-9a-f]*)\s*\|.*/i);
		if (!match) {
			throw 'Invalid instruction format on line ' + i + ': "' + lines[i] + '"';
		}
		instr = hex2arr(match[3]);
		icode = parseInt(instr[0], 16);
		if (instr !== '') {
			addr = parseInt(match[2], 16);
			for (var i = 0; i < instr.length; i++) {
				bytearr[addr + i] = instr[i];
			}
		}
	}
	return bytearr;
}
