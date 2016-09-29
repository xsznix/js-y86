// Constants
var MEM_SIZE = 0x2000;

// Registers and memory
var PC 		= 0,
	REG		= new Uint32Array(8),
	STAT	= 'AOK',
	MEMORY 	= new Uint8Array(MEM_SIZE),
	SF = 0, ZF = 0, OF = 0,
	ERR = '';

// Bounds check the register array
function getRegister (idx) {
	if (idx < 0 || idx > 8) {
		STAT = 'INS';
		throw new Error('Invalid register ID: 0x' + idx.toString(16));
	}
	return REG[idx];
}

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
	ERR = '';
}

// Load
function LD (addr, mem) {
	mem = mem || MEMORY;
	var result;
	if (addr < 0 || addr + 4 > MEM_SIZE) {
		STAT = 'ADR';
		throw new Error("Invalid address 0x" + addr.toString(16));
	}
	result  = mem[addr];
	result |= mem[addr + 1] << 8;
	result |= mem[addr + 2] << 16;
	result |= mem[addr + 3] << 24;
	return result;
}

// Store
function ST(addr, data, bytes){
	var result, i;
	if (addr < 0 || addr + bytes > MEM_SIZE) {
		STAT = 'ADR';
		throw new Error("Invalid address 0x" + addr.toString(16));
	}
	if (typeof bytes === 'undefined') {
		bytes = Math.ceil(Math.log(data + 1) / Math.log(16) / 2);
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

function getRegCode (num) {
	var code = num2reg.indexOf(num);
	if (code === -1)
		throw new Error('Not a register: "' + num + '"');
	else
		return code.toString(16);
}

function evalArgs(list, args, symbols){
	var item, result = {};
	for (i in list) {
		item = list[i];
		if (item === 'rA') {
			result['rA'] = getRegCode(args[i]);
		}
		else if (item === 'rB') {
			result['rB'] = getRegCode(args[i]);
		}
		else if (item === 'V' || item === 'D') {
			if (symbols.hasOwnProperty(args[i])) {
				result['V'] = toBigEndian(padHex(symbols[args[i]], 8));
				result['D'] = result['V'];
			} else {
				try {
					result['V'] = toBigEndian(padHex(parseNumberLiteral(args[i].replace('$', '')) >>> 0, 8));
				} catch (e) {
					// Use 'not a symbol' instead of the more cryptic 'not a number'
					throw new Error('Undefined symbol: ' + args[i]);
				}
				result['D'] = result['V'];
			}
		} else if (item === 'Dest') {
			try {
				result['Dest'] = toBigEndian(padHex(symbols[args[i]].toString(16), 8));	
			} catch (e) {
				throw new Error('Undefined symbol: ' + args[i]);
			}
		} else if (item === 'D(rB)') { 
		    // improve syntax to allow D(rB), D and (rB) with D as symbol or number.
		    // D 
		    try {                   
			var varD = args[i].replace(/\(.*/, ''); // returns arg[i] if it fails       
			if (symbols.hasOwnProperty(varD)) varD = symbols[varD];
			var resD = toBigEndian(padHex(parseNumberLiteral(varD) >>> 0, 8));
			result['D'] = resD;
		    } catch (e) { /* D is not used and will be consider as zero */ }               
   		    // (rB) 
		    try {                   
			var varR = args[i].replace(/^.*\((.*)\)/, '$1'); // returns arg[i] if it fails      
			var resR = getRegCode(varR);
			result['rB'] = resR;
		    } catch (e) { result['rB'] = 'f'; /* rB is not used and will be consider as zero */ }
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
		throw new Error('Invalid instruction "' + instr + '"');
	}
	return result;
}

// Remove comments and fix spacing in code
function normalizeSource (lines) {
	_.each(lines, function (line, i) {
		line = line.replace(/#.*/gi, '');
		line = line.replace(/\/\*.*\*\//gi, '');
		line = line.replace(/^\s+/gi, '');
		line = line.replace(/\s+$/gi, '');
		line = line.replace(/\s+/gi, ' ');
		lines[i] = line;
	});
}

function ASSEMBLE (raw, errorsOnly) {
	errorsOnly = !!errorsOnly;

	var lines = raw.split('\n'), line,
		symbols = {},
		result = new Array(lines.length),
		inst, icode,
		sym, next = 0,
		counter = 0;
		raw = raw.split('\n'),
		errors = [];

	// Clean up raw e.g. remove comments, fix spacing
	normalizeSource(lines);

	// Last line must be blank in Linux simulator
	if (lines[lines.length - 1].trim() !== '')
		errors.push([lines.length, 'Last line must be blank.']);

	// Create symbol table and mark memory addresses
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
				try {
					counter = parseNumberLiteral(dir[2]);
				} catch (e) {
					errors.push([i + 1, e.message]);
				}
			} else if (dir[1] === '.align') {
				try {
					var alignTo = parseNumberLiteral(dir[2]);
				} catch (e) {
					errors.push([i + 1, e.message]);
				}
				counter = Math.ceil(counter / alignTo) * alignTo;
			} else if (dir[1] === '.long') {
				counter += 4;
			} else {
				errors.push([i + 1, 'Unknown directive: ' + dir[1]]);
			}
		}

		// Move counter
		inst = line.match(/(^[a-z]+)/i);
		if (inst) {
			icode = inst2num[inst[1]];
			counter += INSTRUCTION_LEN[icode];
		}
	});

	// Assemble instructions and long directives
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
					errors.push([i + 1, 'Error while parsing .long directive: undefined symbol ' + dir[1]]);
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
			try {
				result[i][1] = ENCODE(line, symbols);
			} catch (e) {
				errors.push([i + 1, e.message]);
			}
		}
	});

	if (errorsOnly)
		return { errors: errors }

	var objectCode = _.map(result, function (line) {
		// 0xXXXX: XXXXXX...
		var compiledPart = '  ';
		if (line[0].length)
			compiledPart += line[0] + ': ' + line[1];
		
		// pad to fit 22 characters
		var padding = new Array(24 - compiledPart.length).join(' ');

		return compiledPart + padding + '| ' + line[2];
	}).join('\n');

	return {
		obj: objectCode,
		errors: errors
	}
}

// Initialize the VM with some object code
function INIT (obj) {
	MEMORY = toByteArray(obj);
	STAT = 'AOK';
	ERR = '';
	RESET();
}

var STEP_INTERVAL = null, RUN_DONE_CALLBACK;

// Run 256 instructions
function RUN_STEP () {
	for (var i = 0; i < 256; i++) {
		if (PC < MEM_SIZE && STAT === 'AOK')
			STEP();
		else {
			PAUSE();
			break;
		}
	}
}

// Returns true if the machine is currently running
function IS_RUNNING () {
	return STEP_INTERVAL !== null;
}

// Stops machine execution.
function PAUSE () {
	clearInterval(STEP_INTERVAL);
	STEP_INTERVAL = null;
	if (STAT === 'AOK')
		STAT = 'DBG';
	if (RUN_DONE_CALLBACK)
		RUN_DONE_CALLBACK();
	RUN_DONE_CALLBACK = null;
}

// Run until hitting a breakpoint, halting, or erroring
function RUN (cb) {
	// Resume from breakpoint, if applicable
	if (STAT === 'DBG')
		STAT = 'AOK';

	// Use fastest available interval the browser can provide
	STEP_INTERVAL = setInterval(RUN_STEP, 0);
	RUN_DONE_CALLBACK = cb;
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
	try {
		INSTR[icode].call(args);
	} catch (e) {
		ERR = e.message;
	}
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
