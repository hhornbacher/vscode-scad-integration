{
    const _ = require('lodash');
    require('../ast')(location, options.file);
}

RootNode = whiteSpace? statements:statement* whiteSpace? { 
    return new RootNode(statements); 
}

// --------------------------------------------------------------------------------------------------
// Statements
statement "Statement"
    = statement:comment whiteSpace? { return statement; }
    / statement:module whiteSpace? { return statement; }
    / statement:include whiteSpace? { return statement; }
    / statement:function whiteSpace? { return statement; }
    / statement:variable whiteSpace? { return statement; }  
    / statement:action whiteSpace? { return statement; } 

// --------------------------------------------------------------------------------------------------
// Blocks
block = blockOpen children:statement* blockClose { return new BlockNode(children); }
blockOpen = whiteSpace? '{' whiteSpace?
blockClose = whiteSpace? '}' whiteSpace?

// --------------------------------------------------------------------------------------------------
// Comments
comment "Comment"
    = '/*' head:[^*]* '*'+ tail:([^/*] [^*]* '*'+)* '/' { 
        return new CommentNode(head.toString() + _.map(tail, (element) => {
            return element[0] + element[1].toString();
        }), true);
    }
    / '//' ' '? text:[^\n]* '\n' { return new CommentNode(text.toString()); }

// --------------------------------------------------------------------------------------------------
// Includes
include "Include"
    = 'include' whiteSpace? includeOpen path:includeFile includeClose endOfStatement { return new IncludeNode(path); }
    / 'use' whiteSpace? includeOpen path:includeFile includeClose endOfStatement { return new UseNode(path); }

includeOpen = whiteSpace? '<' whiteSpace?
includeClose = whiteSpace? '>' whiteSpace?

includeFile = whiteSpace? path:[\.A-Za-z0-9\-_/]+ whiteSpace? { return path.toString(); }


// --------------------------------------------------------------------------------------------------
// Modules
module
    = 'module' whiteSpace? name:name params:parameterDefinitionList block:block { return new ModuleNode(name, params, block); }

// --------------------------------------------------------------------------------------------------
// Functions
function 
    = 'function' whiteSpace? name:name params:parameterDefinitionList assign expression:expression endOfStatement { return null/*new FunctionNode('Function', {name, params, expression})*/; }

// --------------------------------------------------------------------------------------------------
// Actions
action
    = modifier:actionModifiers? name:name params:parameterList operators:(actionOperators)* endOfStatement { 
        return new ActionNode(name, params, modifier, operators);
    }
    / modifier:actionModifiers? name:name params:parameterList operators:(actionOperators)* whiteSpace? block:block { 
        return new ActionNode(name, params, modifier, operators, block);
    }

actionOperators
    = modifier:actionModifiers? name:name params:parameterList { return new ActionNode(name, params, modifier); }

actionModifiers "Modifiers"
    = modifier:[#%!*] { 
            return modifier;
         }
// --------------------------------------------------------------------------------------------------
// For loops
forLoop
    = 'for' whiteSpace? '(' whiteSpace? params:forLoopParameterList ')' whiteSpace? block:block endOfStatement { 
        return new ForLoopNode(params, modifier, operators);
    }

forLoopParameterList
    = [^)]+ { return new ForLoopParameterListNode([]); }

// --------------------------------------------------------------------------------------------------
// Variables
variable "Variable definition"
    = name:name assign value:expression  endOfStatement { 
            return new VariableNode(name, value);
             }


// --------------------------------------------------------------------------------------------------
// Types

// Float
float  "Float"
    =  whiteSpace? neg:'-'? whiteSpace? value:[0-9\.]+ { return new NumberValue(parseFloat(value.toString(),10), neg); }

// String
string "String"
    =  quotationMark value:chars* quotationMark { return new StringValue(value.toString()); }
chars
  = [^\0-\x1F\x22\x5C]
quotationMark
  = '"' whiteSpace?

// Range
range "Range"
    = rangeBracketOpen definition:rangeDefinition rangeBracketClose {  return new RangeValue(definition.start, definition.middle, definition.tail); }
rangeBracketOpen
    = '[' whiteSpace?
rangeBracketClose
    = ']' whiteSpace?
rangeDefinition = comment? start:expression ':'  middle:expression tail:(':' expression)? { return { start, middle, tail: tail }; }

// Vector
vector "Vector"
    =  whiteSpace? neg:'-'? whiteSpace? vectorBracketOpen values:vectorList vectorBracketClose {  return new VectorValue(values, neg); }
vectorBracketOpen
    = whiteSpace? '[' whiteSpace?
vectorBracketClose
    = whiteSpace? ']' whiteSpace?
vectorList = comment? head:expression?  tail:(vectorListTail)* { return _.concat({value:head}, tail); }
vectorListTail = comma comment? value:expression {return value;}

// Reference
reference "Reference"
    = whiteSpace? neg:'-'? whiteSpace? ref:name {  return new ReferenceValue(ref, neg, true); }

// --------------------------------------------------------------------------------------------------
// Values
value 
    = reference
    / float
    / string
    / range
    / vector

// --------------------------------------------------------------------------------------------------
// Names (Varaibles, Functions, Actions, Modules)
name "Name"
     =  head:[A-Za-z] tail:[A-Za-z0-9_]* whiteSpace? { return head + (tail.toString() || ''); }
     /  head:'$' tail:[A-Za-z0-9_]+ whiteSpace? { return head + (tail.toString() || ''); }

// --------------------------------------------------------------------------------------------------
// Terms
expression "Expression"
    = head:term tail:(termOperator term)* { 
        if(tail.length > 0)
            return new ExpressionNode(_.concat([head], tail));
        else
            return new ExpressionNode([head]);
         }

term "Term"
    = head:factor tail:(termOperator factor)* {
        if(tail.length > 0)
            return new TermNode(_.concat([head], tail));
        else
            return new TermNode([head]);
          }

termOperator "Mathematical operator"
    = op:[+\-*/%] whiteSpace? { return op[0]; }


factor 
    = neg:'-'? value:value { return new FactorNode(value, neg?true:false); }
    / neg:'-'? name { return new FactorNode(name, neg?true:false); }
    / neg:'-'? termGroupOpen value:expression termGroupClose  { return new FactorNode(value, neg?true:false); }
termGroupOpen = '(' whiteSpace?
termGroupClose = ')' whiteSpace?

// --------------------------------------------------------------------------------------------------
// Parameters (Actions)
parameterList 
    = parameterOpen head:parameterListItem?  tail:(comma parameterListItem)* parameterClose { 
        if(tail.length > 0)
            return new ParameterListNode(_.concat(head, tail));
        else
            return new ParameterListNode([head]);
    }
parameterListItem 
    = name:(name assign)? value:expression { 
            if(_.isArray(name))
                return new ParameterNode(new VariableNode(name[0], value)); 
            else
                return new ParameterNode(value);
        }
parameterOpen = '(' whiteSpace?
parameterClose = ')' whiteSpace?

// Parameter definitions  (Functions, Modules)
parameterDefinitionList 
    = parameterOpen  head:parameterDefinitionListItem?  tail:(comma parameterDefinitionListItem)* parameterClose { 
        if(tail.length > 0)
            return new ParameterListNode(_.concat(head, tail), true);
        else
            return new ParameterListNode([head], true);
    }

parameterDefinitionListItem 
    = name:(name assign)? value:expression { 
            if(_.isArray(name))
                return new ParameterNode(new VariableNode(name[0], value)); 
            else
                return new ParameterNode(value);
        }

// --------------------------------------------------------------------------------------------------
// Assignment
assign =  '=' whiteSpace?

// --------------------------------------------------------------------------------------------------
// Macros
whiteSpace
    = [ \t\r\n\f]+

endOfStatement
    = whiteSpace? ';'

comma
    = ',' whiteSpace?
