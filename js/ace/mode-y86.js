define("ace/mode/y86_highlight_rules",
		["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],
		function(require, exports, module) {
	"use strict";

	var oop = require("../lib/oop");
	var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

	var Y86HighlightRules = function() {
	    
	    var instructions = '';

	    this.$rules = {
	        "start" : [{
	            "token": "comment",
	            "regex": /#.*/
	        }, {
	            "token": ["storage.type", "directive"],
	            "regex": /\.(pos|align|long)/
	        }, {
	            "token": ["entity.name.function", "symbol"],
	            "regex": /\w+:/
	        }, {
	            "token": "keyword.control",
	            "regex": /halt|nop|rrmovl|cmovle|cmovl|cmove|cmovne|cmovge|cmovg|irmovl|rmmovl|mrmovl|addl|subl|xorl|andl|jmp|jle|jl|je|jne|jge|jg|call|ret|pushl|popl|brk|brkle|brkl|brke|brkne|brkge|brkg/
	        }, {
	            "token": ["variable.language", "register"],
	            "regex": /%(eax|ebx|ecx|edx|ebp|esp|esi|edu)/
	        }, {
	            "token": "constant.number",
	            "regex": /\$?\-?([0-9]+|\0\x[0-9a-f]+)/
	        }]

	    };
	};
	oop.inherits(Y86HighlightRules, TextHighlightRules);

	exports.Y86HighlightRules = Y86HighlightRules;

});

define("ace/mode/y86",
		["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/y86_highlight_rules"],
		function(require, exports, module) {
	"use strict";

	var oop = require("../lib/oop");
	var TextMode = require("./text").Mode;
	var Y86HighlightRules = require("./y86_highlight_rules").Y86HighlightRules;

	var Mode = function() {
	    this.HighlightRules = Y86HighlightRules;
	};
	oop.inherits(Mode, TextMode);

	exports.Mode = Mode;
});
