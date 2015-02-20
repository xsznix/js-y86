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
				result['V'] = toBigEndian(padHex(parseNumberLiteral(args[i].replace('$', '')) >>> 0));
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
		line = line.replace(/\/\*.*\*\//gi, '');
		line = line.replace(/^\s+/gi, '');
		line = line.replace(/\s+$/gi, '');
		line = line.replace(/\s+/gi, ' ');
		lines[i] = line;
	}

	// Create symbol table and mark memory addresses
	try {
		_.each(lines, function (line, i) {
			result[i] = ['', '', raw[i]];
			
			// Ignore empty lines
			if (line === '')
				return;

			// Add line number
			result[i][0] = ['0x' + padHex(counter, 4)];

			// Look for symbol and add to symbols
			sym = line.match(/(^.*?):/i);
			if (sym) {
				symbols[sym[1]] = counter;
				// Delete symbol from line
				lines[i] = line = line.replace(/^.*?:\s*/i, '');
			}

			// Look for directive
			dir = line.match(/(^\..*?) (.*)/i);
			if (dir) {
				if (dir[1] === '.pos') {
					counter = parseNumberLiteral(dir[2]);
				} else if (dir[1] === '.align') {
					var alignTo = parseNumberLiteral(dir[2]);
					counter = Math.ceil(counter / alignTo) * alignTo;
				} else if (dir[1] === '.long') {
					counter += 4;
				} else {
					throw new Error('Unknown directive on line ' + i + ': ' + dir[1]);
				}
			}

			// Move counter
			inst = line.match(/(^[a-z]+)/i);
			if (inst) {
				icode = inst2num[inst[1]];
				counter += INSTRUCTION_LEN[icode];
			}
		});
	} catch (e) {
		return 'Error: ' + e.message;
	}

	// Assemble instructions and long directives
	try {
		_.each(lines, function (line, i) {
			// Ignore empty lines
			if (line.trim() === '')
				return;

			// Long directives
			dir = line.match(/^\.long (.*)/i);
			if (dir) {
				var value;
				try {
					// Try to parse the value as a number literal first...
					value = parseNumberLiteral(dir[1]);
				} catch (e) {
					// ...and if that fails, try to find it in the symbol table
					if (symbols.hasOwnProperty(dir[1]))
						value = symbols[dir[1]];
					else
						throw new Error('Error while parsing .long directive: unknown symbol ' + dir[1] + ' on line ' + i);
				}
				result[i][1] = toBigEndian(padHex(value >>> 0, 8));
				counter += 4;
				return;
			}

			// Ignore other directives
			if (line[0] === '.')
				return;

			// Instructions
			inst = line.match(/^([a-z]+)(.*)/i);
			if (inst) {
				result[i][1] = ENCODE(line, symbols);
			}
			if (ERR !== 'AOK') {
				throw new Error('Invalid instruction "' + line + '" on line ' + i);
			}
		});
	} catch (e) {
		return 'Error: ' + e.message;
	}

	return _.map(result, function (line) {
		// 0xXXXX: XXXXXX...
		var compiledPart = '  ';
		if (line[0].length)
			compiledPart += line[0] + ': ' + line[1];
		
		// pad to fit 22 characters
		var padding = new Array(23 - compiledPart.length).join(' ');

		return compiledPart + padding + '| ' + line[2];
	}).join('\n');
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
