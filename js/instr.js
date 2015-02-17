var INSTR = {};

INSTR[0] = function () {
	STAT = 'HLT';
	//print("Program halted");
};
INSTR[1] = function () {
	//NOP
};
INSTR[2] = function () {
	REG[this.rB] = REG[this.rA];
};
INSTR[3] = function () {
	REG[this.rB] = this.V;
};
INSTR[4] = function () {
	var valA = REG[this.rA],
		valB = REG[this.rB],
		valE = valB + this.D;
	ST(valE, valA, 4);
};
INSTR[5] = function () {
	var valB = REG[this.rB],
		valE = valB + this.D;
	REG[this.rA] = LD(valE);
};
INSTR[6] = function () {
	var valA = REG[this.rA],
		valB = REG[this.rB];
	switch(this.fn) {
		case 0:
			REG[this.rB] += REG[this.rA];
			break;
		case 1:
			REG[this.rB] -= REG[this.rA];
			break;
		case 2:
			REG[this.rB] = REG[this.rA] & REG[this.rB];
			break;
		case 3:
			REG[this.rB] = REG[this.rA] ^ REG[this.rB];
			break;
	}
	SF = REG[this.rB] < 0 ? 1 : 0;
	ZF = REG[this.rB] === 0 ? 1 : 0;
	OF = 0;
};
INSTR[7] = function ()  {
	switch(this.fn) {
		case 0:
			// JMP
			PC = this.Dest;
			break;
		case 1:
			// JLE
			if (SF === 1 || ZF === 1) {
				PC = this.Dest;
			}
			break;
		case 2:
			// JL
			if (SF === 1) {
				PC = this.Dest;
			}
			break;
		case 3:
			// JE
			if (ZF === 1) { 
				PC = this.Dest;
			}
			break;
		case 4:
			// JNE
			if (ZF === 0) { 
				PC = this.Dest;
			}
			break;
		case 5:
			// JGE
			if (ZF === 0 || ZF === 1) { 
				PC = this.Dest;
			}
			break;
		case 6:
			// JG
			if (SF === 0 && ZF === 0) { 
				PC = this.Dest;
			}
			break;
	}
};
INSTR[8] = function () {
	var valB = REG[4],
		valE = valB - 4;
	ST(valE, PC, 4);
	REG[4] = valE;
	PC = this.Dest;
};
INSTR[9] = function () {
	var valA = REG[4],
		valB = REG[4],
		valE = valB + 4,
		valM = LD(valA);
		REG[4] = valE;
		PC = valM;
};
INSTR[10] = function () {
	var valA = REG[this.rA],
		valB = REG[4],
		valE = valB - 4;
	ST(valE, valA, 4);
	REG[4] = valE;
};
INSTR[11] = function () {
	var valA = REG[4],
		valB = REG[4],
		valE = valB + 4,
		valM = LD(valA);
	REG[4] = valE;
	REG[this.rA] = valM;
};