{
    const _ = require('lodash');
    require('../ast')(location, options.file);
}

RootNode = WhiteSpace? statements:StatementNode* WhiteSpace? { 
    return new RootNode(statements); 
}

// --------------------------------------------------------------------------------------------------
// Statements
StatementNode
    = statement:CommentNode WhiteSpace? { return statement; }
    / statement:ModuleNode WhiteSpace? { return statement; }
    / statement:IncludeNode WhiteSpace? { return statement; }
    / statement:FunctionNode WhiteSpace? { return statement; }
    / statement:VariableNode WhiteSpace? { return statement; }  
    / statement:ActionNode WhiteSpace? { return statement; } 

// --------------------------------------------------------------------------------------------------
// Blocks
BlockNode = CurlyBraceOpen children:StatementNode* CurlyBraceClose { return new BlockNode(children); }

// --------------------------------------------------------------------------------------------------
// Comments
CommentNode
    = '/*' head:[^*]* '*'+ tail:([^/*] [^*]* '*'+)* '/' { 
        return new CommentNode(head.toString() + _.map(tail, (element) => {
            return element[0] + element[1].toString();
        }), true);
    }
    / '//' ' '? text:[^\n]* '\n' { return new CommentNode(text.toString()); }

// --------------------------------------------------------------------------------------------------
// Includes
IncludeNode "Include"
    = 'include' WhiteSpace? AngleBraceOpen path:IncludeFile AngleBraceClose EndOfStatement { return new IncludeNode(path); }
    / 'use' WhiteSpace? AngleBraceOpen path:IncludeFile AngleBraceClose EndOfStatement { return new UseNode(path); }

IncludeFile = WhiteSpace? path:[\.A-Za-z0-9\-_/]+ WhiteSpace? { return path.toString(); }


// --------------------------------------------------------------------------------------------------
// Modules
ModuleNode
    = 'module' WhiteSpace? name:name params:parameterDefinitionList block:BlockNode { return new ModuleNode(name, params, block); }

// --------------------------------------------------------------------------------------------------
// Functions
FunctionNode 
    = 'function' WhiteSpace? name:name params:parameterDefinitionList Assignment expression:expression EndOfStatement { return null/*new FunctionNode('Function', {name, params, expression})*/; }

// --------------------------------------------------------------------------------------------------
// Actions
ActionNode
    = modifier:actionModifiers? name:name params:parameterList operators:(actionOperators)* EndOfStatement { 
        return new ActionNode(name, params, modifier, operators);
    }
    / modifier:actionModifiers? name:name params:parameterList operators:(actionOperators)* WhiteSpace? block:BlockNode { 
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
ForLoopNode
    = 'for' WhiteSpace? '(' WhiteSpace? params:ForLoopParameterList ')' WhiteSpace? block:BlockNode EndOfStatement { 
        return new ForLoopNode(params, modifier, operators);
    }

ForLoopParameterList
    = [^)]+ { return new ForLoopParameterListNode([]); }

// --------------------------------------------------------------------------------------------------
// Variables
VariableNode
    = name:name Assignment value:expression  EndOfStatement { return new VariableNode(name, value); }


// --------------------------------------------------------------------------------------------------
// Types

// Float
Float
    =  WhiteSpace? neg:'-'? WhiteSpace? value:[0-9\.]+ { return new NumberValue(parseFloat(value.toString(),10), neg); }

// String
String
    =  QuotationMark value:Characters* QuotationMark { return new StringValue(value.toString()); }

// Range
Range
    = SquareBraceOpen definition:rangeDefinition SquareBraceClose {  return new RangeValue(definition.start, definition.middle, definition.tail); }
rangeDefinition = CommentNode? start:expression ':'  middle:expression tail:(':' expression)? { return { start, middle, tail: tail }; }

// Vector
Vector
    =  neg:'-'? WhiteSpace? SquareBraceOpen values:vectorList SquareBraceClose {  return new VectorValue(values, neg); }
vectorList = CommentNode? head:expression?  tail:(vectorListTail)* { return _.concat({value:head}, tail); }
vectorListTail = Comma CommentNode? value:expression {return value;}

// Reference
Reference
    = WhiteSpace? neg:'-'? WhiteSpace? ref:name {  return new ReferenceValue(ref, neg, true); }

// --------------------------------------------------------------------------------------------------
// Values
value 
    = Reference
    / Float
    / String
    / Range
    / Vector

// --------------------------------------------------------------------------------------------------
// Names (Varaibles, Functions, Actions, Modules)
name "Name"
     =  head:[A-Za-z] tail:[A-Za-z0-9_]* WhiteSpace? { return head + (tail.toString() || ''); }
     /  head:'$' tail:[A-Za-z0-9_]+ WhiteSpace? { return head + (tail.toString() || ''); }

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
    = op:[+\-*/%] WhiteSpace? { return op[0]; }


factor 
    = neg:'-'? value:value { return new FactorNode(value, neg?true:false); }
    / neg:'-'? name { return new FactorNode(name, neg?true:false); }
    / neg:'-'? RoundBraceOpen value:expression RoundBraceClose  { return new FactorNode(value, neg?true:false); }

// --------------------------------------------------------------------------------------------------
// Parameters (Actions)
parameterList 
    = RoundBraceOpen head:parameterListItem?  tail:(Comma parameterListItem)* RoundBraceClose { 
        if(tail.length > 0)
            return new ParameterListNode(_.concat(head, tail));
        else
            return new ParameterListNode([head]);
    }
parameterListItem 
    = name:(name Assignment)? value:expression { 
            if(_.isArray(name))
                return new ParameterNode(new VariableNode(name[0], value)); 
            else
                return new ParameterNode(value);
        }

// Parameter definitions  (Functions, Modules)
parameterDefinitionList 
    = RoundBraceOpen  head:parameterDefinitionListItem?  tail:(Comma parameterDefinitionListItem)* RoundBraceClose { 
        if(tail.length > 0)
            return new ParameterListNode(_.concat(head, tail), true);
        else
            return new ParameterListNode([head], true);
    }

parameterDefinitionListItem 
    = name:(name Assignment)? value:expression { 
            if(_.isArray(name))
                return new ParameterNode(new VariableNode(name[0], value)); 
            else
                return new ParameterNode(value);
        }

// --------------------------------------------------------------------------------------------------
// Useful stuff
Assignment 
    =  '=' WhiteSpace?

WhiteSpace
    = [ \t\r\n\f]+

EndOfStatement
    = ';' WhiteSpace?

RoundBraceOpen
    = '(' WhiteSpace?

RoundBraceClose 
    = ')' WhiteSpace?

CurlyBraceOpen 
    = '{' WhiteSpace?

CurlyBraceClose 
    = '}' WhiteSpace?

SquareBraceOpen
    = '[' WhiteSpace?

SquareBraceClose
    = ']' WhiteSpace?

AngleBraceOpen 
    = WhiteSpace? '<' WhiteSpace?
    
AngleBraceClose 
    = WhiteSpace? '>' WhiteSpace?

Characters
  = [^\0-\x1F\x22\x5C]
QuotationMark
  = '"' WhiteSpace?

Comma
    = ',' WhiteSpace?

