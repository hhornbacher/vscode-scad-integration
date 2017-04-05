start = ws? statements:statement* ws?  { 
    return new RootEntity(statements); 
     }

// --------------------------------------------------------------------------------------------------
// Statements
statement "Statement"
    = statement:comment ws? { return statement; }
    / statement:module ws? { return statement; }
    / statement:include ws? { return statement; }
    / statement:function ws? { return statement; }
    / statement:variable ws? { return statement; }  
    / statement:action ws? { return statement; }

// --------------------------------------------------------------------------------------------------
// Blocks
block = blockOpen children:statement* blockClose { return new BlockEntity(children); }
blockOpen = ws? '{' ws?
blockClose = ws? '}' ws?

// --------------------------------------------------------------------------------------------------
// Comments
comment "Comment"
    = '/*' head:[^*]* '*'+ tail:([^/*] [^*]* '*'+)* '/' { 
        return new CommentEntity(head.toString() + _.map(tail, (element) => {
            return element[0] + element[1].toString();
        }), true);
    }
    / '//' ' '? text:[^\n]* '\n' { return new CommentEntity(text.toString()); }

// --------------------------------------------------------------------------------------------------
// Includes
include "Include"
    = 'include' ws? includeOpen path:includeFile includeClose eos { return new IncludeEntity(path); }
    / 'use' ws? includeOpen path:includeFile includeClose eos { return new UseEntity(path); }

includeOpen = ws? '<' ws?
includeClose = ws? '>' ws?

includeFile = ws? path:[\.A-Za-z0-9\-_/]+ ws? { return path.toString(); }


// --------------------------------------------------------------------------------------------------
// Modules
module
    = 'module' ws? name:name params:parameterDefinitionList block:block { return new ModuleEntity(name, params, block); }

// --------------------------------------------------------------------------------------------------
// Functions
function 
    = 'function' ws? name:name params:parameterDefinitionList assign expression:expression eos { return null/*new FunctionEntity('Function', {name, params, expression})*/; }

// --------------------------------------------------------------------------------------------------
// Actions
action
    = modifier:actionModifiers? name:name params:parameterList operators:(actionOperators)* eos { 
        return new ActionEntity(name, params, modifier, operators);
    }
    / modifier:actionModifiers? name:name params:parameterList operators:(actionOperators)* block:block { 
        return new ActionEntity(name, params, modifier, operators, block);
    }

actionOperators
    = modifier:actionModifiers? name:name params:parameterList { return new ActionEntity(name, params, modifier); }

actionModifiers "Modifiers"
    = modifier:[#%!*] ws? { 
            return modifier;
         }
// --------------------------------------------------------------------------------------------------
// For loops
forLoop
    = 'for' ws? '(' ws? params:forLoopParameterList ')' ws? block:block eos { 
        return new ForLoopEntity(params, modifier, operators);
    }

forLoopParameterList
    = [^)]+ { return new ForLoopParameterListEntity([]); }

// --------------------------------------------------------------------------------------------------
// Variables
variable "Variable definition"
    = name:name assign value:expression  eos { 
            return new VariableEntity(name, value);
             }


// --------------------------------------------------------------------------------------------------
// Types

// Float
float  "Float"
    =  ws? neg:'-'? ws? value:[0-9\.]+ { return new NumberValue(parseFloat(value.toString(),10), neg); }

// String
string "String"
    =  quotationMark value:chars* quotationMark { return new StringValue(value.toString()); }
chars
  = [^\0-\x1F\x22\x5C]
quotationMark
  = '"' ws?

// Range
range "Range"
    = rangeBracketOpen definition:rangeDefinition rangeBracketClose {  return new RangeValue(definition.start, definition.middle, definition.tail); }
rangeBracketOpen
    = '[' ws?
rangeBracketClose
    = ']' ws?
rangeDefinition = comment? start:expression ':'  middle:expression tail:(':' expression)? { return { start, middle, tail: tail }; }

// Vector
vector "Vector"
    =  ws? neg:'-'? ws? vectorBracketOpen values:vectorList vectorBracketClose {  return new VectorValue(values, neg); }
vectorBracketOpen
    = ws? '[' ws?
vectorBracketClose
    = ws? ']' ws?
vectorList = comment? head:expression?  tail:(vectorListTail)* { return _.concat({value:head}, tail); }
vectorListTail = comma comment? value:expression {return value;}

// Reference
reference "Reference"
    = ws? neg:'-'? ws? ref:name {  return new ReferenceValue(ref, neg, true); }

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
     =  head:[A-Za-z] tail:[A-Za-z0-9_]* ws? { return head + (tail.toString() || ''); }
     /  head:'$' tail:[A-Za-z0-9_]+ ws? { return head + (tail.toString() || ''); }

// --------------------------------------------------------------------------------------------------
// Terms
expression "Expression"
    = head:term tail:(termOperator term)* { 
        if(tail.length > 0)
            return new ExpressionEntity( _.concat([], head, tail));
        else
            return new ExpressionEntity([head]);
         }

term "Term"
    = head:factor tail:(termOperator factor )* {
        if(tail.length > 0)
            return new TermEntity(_.concat([], head, tail));
        else
            return new TermEntity([head]);
          }

termOperator "Mathematical operator"
    = op:[+\-*/%] ws? { return op[0]; }


termGroupOpen = ws? '(' ws?
termGroupClose = ws? ')' ws?
factor 
    = neg:'-'? termGroupOpen value:expression termGroupClose  { return new FactorEntity(value, neg?true:false); }
    / value
    / name

// --------------------------------------------------------------------------------------------------
// Parameters (Actions)
parameterList 
    = parameterOpen  head:parameterListItem?  tail:(comma parameterListItem)* parameterClose { 
        if(tail.length > 0)
            return new ParameterListEntity(_.concat(head, tail));
        else
            return new ParameterListEntity([head]);
    }
parameterListItem 
    = name:(name assign)? value:expression { 
            if(_.isArray(name))
                return new ParameterEntity(new VariableEntity(name[0], value)); 
            else
                return new ParameterEntity(value);
        }
parameterOpen = '(' ws?
parameterClose = ')' ws?

// Parameter definitions  (Functions, Modules)
parameterDefinitionList 
    = parameterOpen  head:parameterDefinitionListItem?  tail:(comma parameterDefinitionListItem)* parameterClose { 
        if(tail.length > 0)
            return new ParameterListEntity(_.concat(head, tail), true);
        else
            return new ParameterListEntity([head], true);
    }

parameterDefinitionListItem 
    = name:(name assign)? value:expression { 
            if(_.isArray(name))
                return new ParameterEntity(new VariableEntity(name[0], value)); 
            else
                return new ParameterEntity(value);
        }

// --------------------------------------------------------------------------------------------------
// Assignment
assign =  '=' ws?

// --------------------------------------------------------------------------------------------------
// Macros
ws "White space"
    = [ \t\r\n\f]+

eos "End of statement"
    = ws? ';'

comma "Comma"
    = ws? ',' ws?
