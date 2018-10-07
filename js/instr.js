var INSTR = {};

INSTR[0] = function () {
	STAT = 'HLT';
	//print("Program halted");
};
INSTR[1] = function () {
	//NOP
};
INSTR[2] = function () {
	switch(this.fn) {
		case 0:
			// RRMOVL
			REG[this.rB] = getRegister(this.rA);
			break;
		case 1:
			// CMOVLE
			if (SF ^ OF === 1 || ZF === 1) {
				REG[this.rB] = getRegister(this.rA);
			}
			break;
		case 2:
			// CMOVL
			if (SF ^ OF === 1) {
				REG[this.rB] = getRegister(this.rA);
			}
			break;
		case 3:
			// CMOVE
			if (ZF === 1) {
				REG[this.rB] = getRegister(this.rA);
			}
			break;
		case 4:
			// CMOVNE
			if (ZF === 0) {
				REG[this.rB] = getRegister(this.rA);
			}
			break;
		case 5:
			// CMOVGE
			if (SF ^ OF === 0) {
				REG[this.rB] = getRegister(this.rA);
			}
			break;
		case 6:
			// CMOVG
			if (SF ^ OF === 0 && ZF === 0) {
				REG[this.rB] = getRegister(this.rA);
			}
			break;
	}
};
INSTR[3] = function () {
	REG[this.rB] = this.V;
};
INSTR[4] = function () {
        var valA = getRegister(this.rA);
        var valB = 0; // valB is zero if rB is not used
        if(this.rB != 15) valB = getRegister(this.rB);
        var valE = valB + this.D;
	ST(valE, valA, 4);
};
INSTR[5] = function () {
        var valB = 0; // valB is zero if rB is not used
        if(this.rB != 15) valB = getRegister(this.rB);
        var valE = valB + this.D;
	REG[this.rA] = LD(valE);
};
INSTR[6] = function () {
	var valA = getRegister(this.rA),
		valB = getRegister(this.rB),
		sgnA, sgnB, sgnR, signBit = 0x80000000;
	switch(this.fn) {
		case 0:
			sgnA = !!(valA & signBit);
			sgnB = !!(valB & signBit);
			REG[this.rB] += getRegister(this.rA);
			sgnR = !!(getRegister(this.rB) & signBit);
			OF = +(sgnA && sgnB && !sgnR ||
			       !sgnA && !sgnB && sgnR)
			break;
		case 1:
			sgnA = !!(valA & signBit);
			sgnB = !!(valB & signBit);
			REG[this.rB] -= getRegister(this.rA);
			sgnR = !!(getRegister(this.rB) & signBit);
			OF = +(!sgnA && sgnB && !sgnR ||
			       sgnA && !sgnB && sgnR)
			break;
		case 2:
			REG[this.rB] = getRegister(this.rA) & getRegister(this.rB);
			break;
		case 3:
			REG[this.rB] = getRegister(this.rA) ^ getRegister(this.rB);
			break;
	}
	SF = getRegister(this.rB) & 0x80000000 ? 1 : 0;
	ZF = getRegister(this.rB) === 0 ? 1 : 0;
};
INSTR[7] = function ()  {
	switch(this.fn) {
		case 0:
			// JMP
			PC = this.Dest;
			break;
		case 1:
			// JLE
			if (SF ^ OF === 1 || ZF === 1) {
				PC = this.Dest;
			}
			break;
		case 2:
			// JL
			if (SF ^ OF === 1) {
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
			if (SF ^ OF === 0) {
				PC = this.Dest;
			}
			break;
		case 6:
			// JG
			if (SF ^ OF === 0 && ZF === 0) {
				PC = this.Dest;
			}
			break;
	}
};
INSTR[8] = function () {
	var valB = getRegister(4),
		valE = valB - 4;
	ST(valE, PC, 4);
	REG[4] = valE;
	PC = this.Dest;
};
INSTR[9] = function () {
	var valA = getRegister(4),
		valB = getRegister(4),
		valE = valB + 4,
		valM = LD(valA);
		REG[4] = valE;
		PC = valM;
};
INSTR[10] = function () {
	var valA = getRegister(this.rA),
		valB = getRegister(4),
		valE = valB - 4;
	ST(valE, valA, 4);
	REG[4] = valE;
};
INSTR[11] = function () {
	var valA = getRegister(4),
		valB = getRegister(4),
		valE = valB + 4,
		valM = LD(valA);
	REG[4] = valE;
	REG[this.rA] = valM;
};

INSTR[12] = function () { // iaddl, isubl, iandl, ixorl
    var valA = this.V;
    var valB = getRegister(this.rB);
    var sgnA, sgnB, sgnR, signBit = 0x80000000;
    switch(this.fn) {
    case 0:
	sgnA = !!(valA & signBit);
	sgnB = !!(valB & signBit);
	REG[this.rB] += valA;
	sgnR = !!(getRegister(this.rB) & signBit);
	OF = +(sgnA && sgnB && !sgnR ||
	       !sgnA && !sgnB && sgnR)
	break;
    case 1:
	sgnA = !!(valA & signBit);
	sgnB = !!(valB & signBit);
	REG[this.rB] -= valA;
	sgnR = !!(getRegister(this.rB) & signBit);
	OF = +(!sgnA && sgnB && !sgnR ||
	       sgnA && !sgnB && sgnR)
	break;
    case 2:
	REG[this.rB] = valA & getRegister(this.rB);
	break;
    case 3:
	REG[this.rB] = valA ^ getRegister(this.rB);
	break;
    }
    SF = getRegister(this.rB) & 0x80000000 ? 1 : 0;
    ZF = getRegister(this.rB) === 0 ? 1 : 0;
};

INSTR[15] = function () {
	switch(this.fn) {
		case 0:
			// BRK
			STAT = 'DBG';
			break;
		case 1:
			// BRKLE
			if (SF ^ OF === 1 || ZF === 1) {
				STAT = 'DBG';
			}
			break;
		case 2:
			// BRKL
			if (SF ^ OF === 1) {
				STAT = 'DBG';
			}
			break;
		case 3:
			// BRKE
			if (ZF === 1) {
				STAT = 'DBG';
			}
			break;
		case 4:
			// BRKNE
			if (ZF === 0) {
				STAT = 'DBG';
			}
			break;
		case 5:
			// BRKGE
			if (SF ^ OF === 0) {
				STAT = 'DBG';
			}
			break;
		case 6:
			// BRKG
			if (SF ^ OF === 0 && ZF === 0) {
				STAT = 'DBG';
			}
			break;
	}
};
