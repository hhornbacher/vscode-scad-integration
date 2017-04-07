{
    require('../ast')(location, options.file, options.code);
}

RootNode "RootNode" 
    = WhiteSpace? statements:StatementNode* WhiteSpace? { 
    return new RootNode(statements); 
}

// --------------------------------------------------------------------------------------------------
// Statements
StatementNode "StatementNode"
    = statement:CommentNode WhiteSpace? { return statement; } 
    / statement:ModuleNode WhiteSpace? { return statement; }
    / statement:IncludeNode WhiteSpace? { return statement; }
    / statement:FunctionNode WhiteSpace? { return statement; }
    / statement:VariableNode WhiteSpace? { return statement; }  
    / statement:ActionNode WhiteSpace? { return statement; } 

// --------------------------------------------------------------------------------------------------
// Blocks
BlockNode "BlockNode" 
    = CurlyBraceOpen children:StatementNode* CurlyBraceClose { return new BlockNode(children); }

// --------------------------------------------------------------------------------------------------
// Comments
CommentNode "CommentNode"
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

IncludeFile "IncludeFile" 
    = WhiteSpace? path:[\.A-Za-z0-9\-_/]+ WhiteSpace? { return path.toString(); }


// --------------------------------------------------------------------------------------------------
// Modules
ModuleNode "ModuleNode"
    = 'module' WhiteSpace? name:Name params:ParameterDefinitionList block:BlockNode { return new ModuleNode(name, params, block); }

// --------------------------------------------------------------------------------------------------
// Functions
FunctionNode "FunctionNode" 
    = 'function' WhiteSpace? name:Name params:ParameterDefinitionList Assignment expression:ExpressionNode EndOfStatement { return null/*new FunctionNode('Function', {name, params, expression})*/; }

// --------------------------------------------------------------------------------------------------
// Actions
ActionNode "ActionNode"
    = modifier:ActionModifiers? name:Name params:ParameterList operators:(ActionOperators)* EndOfStatement { 
        return new ActionNode(name, params, modifier, operators);
    }
    / modifier:ActionModifiers? name:Name params:ParameterList operators:(ActionOperators)* WhiteSpace? block:BlockNode { 
        return new ActionNode(name, params, modifier, operators, block);
    }

ActionOperators "ActionOperators"
    = modifier:ActionModifiers? name:Name params:ParameterList { return new ActionNode(name, params, modifier); }

ActionModifiers "ActionModifiers"
    = modifier:[#%!*] { 
            return modifier;
         }

// --------------------------------------------------------------------------------------------------
// For loops
ForLoopNode "ForLoopNode"
    = 'for' WhiteSpace? '(' WhiteSpace? params:ForLoopParameterList ')' WhiteSpace? block:BlockNode EndOfStatement { 
        return new ForLoopNode(params, modifier, operators);
    }

ForLoopParameterList "ForLoopParameterList"
    = [^)]+ { return new ForLoopParameterListNode([]); }

// --------------------------------------------------------------------------------------------------
// Variables
VariableNode "VariableNode"
    = name:Name Assignment value:ExpressionNode  EndOfStatement { return new VariableNode(name, value); }


// --------------------------------------------------------------------------------------------------
// Types

// Float
Float "Float"
    =  WhiteSpace? neg:'-'? WhiteSpace? value:[0-9\.]+ { return new NumberValue(parseFloat(value.toString(),10), neg); }

// String
String "String"
    =  QuotationMark value:Characters* QuotationMark { return new StringValue(value.toString()); }

// Range
Range "Range"
    = SquareBraceOpen definition:RangeDefinition SquareBraceClose {  return new RangeValue(definition.start, definition.middle, definition.tail); }
RangeDefinition = start:ExpressionNode ':'  middle:ExpressionNode tail:(':' ExpressionNode)? { return { start, middle, tail: tail }; }

// Vector
Vector "Vector"
    =  neg:'-'? WhiteSpace? SquareBraceOpen values:VectorList SquareBraceClose {  return new VectorValue(values, neg); }
VectorList = head:ExpressionNode?  tail:(VectorListTail)* { return _.concat({value:head}, tail); }
VectorListTail = Comma value:ExpressionNode {return value;}

// Reference
Reference "Reference"
    = WhiteSpace? neg:'-'? WhiteSpace? ref:Name {  return new ReferenceValue(ref, neg, true); }

// --------------------------------------------------------------------------------------------------
// Values
Value "Value" 
    = Reference
    / Float
    / String
    / Range
    / Vector

// --------------------------------------------------------------------------------------------------
// Names (Varaibles, Functions, Actions, Modules)
Name "Name"
     =  head:[A-Za-z] tail:[A-Za-z0-9_]* WhiteSpace? { return head + (tail.toString() || ''); }
     /  head:'$' tail:[A-Za-z0-9_]+ WhiteSpace? { return head + (tail.toString() || ''); }

// --------------------------------------------------------------------------------------------------
// Terms
ExpressionNode "ExpressionNode"
    = head:TermNode tail:(TermOperator TermNode)* { 
        if(tail.length > 0)
            return new ExpressionNode(_.concat([head], tail));
        else
            return new ExpressionNode([head]);
         }

TermNode "TermNode"
    = head:FactorNode tail:(TermOperator FactorNode)* {
        if(tail.length > 0)
            return new TermNode(_.concat([head], tail));
        else
            return new TermNode([head]);
          }

TermOperator "TermOperator"
    = op:[+\-*/%] WhiteSpace? { return op[0]; }


FactorNode "FactorNode" 
    = neg:'-'? value:Value { return new FactorNode(value, neg?true:false); }
    / neg:'-'? name:Name { return new FactorNode(name, neg?true:false, {_name:name}); }
    / neg:'-'? RoundBraceOpen value:ExpressionNode RoundBraceClose  { return new FactorNode(value, neg?true:false); }

// --------------------------------------------------------------------------------------------------
// Parameters (Actions)
ParameterList "ParameterList" 
    = RoundBraceOpen head:ParameterListItem?  tail:(Comma ParameterListItem)* RoundBraceClose { 
        if(tail.length > 0)
            return new ParameterListNode(_.concat(head, tail));
        else
            return new ParameterListNode([head]);
    }
ParameterListItem "ParameterListItem" 
    = name:(Name Assignment)? value:ExpressionNode { 
            if(_.isArray(name))
                return new ParameterNode(new VariableNode(name[0], value)); 
            else
                return new ParameterNode(value);
        }

// Parameter definitions  (Functions, Modules)
ParameterDefinitionList "ParameterDefinitionList" 
    = RoundBraceOpen  head:ParameterDefinitionListItem?  tail:(Comma ParameterDefinitionListItem)* RoundBraceClose { 
        if(tail.length > 0)
            return new ParameterListNode(_.concat(head, tail), true);
        else
            return new ParameterListNode([head], true);
    }

ParameterDefinitionListItem "ParameterDefinitionListItem" 
    = name:(Name Assignment)? value:ExpressionNode { 
            if(_.isArray(name))
                return new ParameterNode(new VariableNode(name[0], value)); 
            else
                return new ParameterNode(value);
        }

// --------------------------------------------------------------------------------------------------
// Useful stuff
Assignment "Assignment" 
    =  '=' WhiteSpace?

WhiteSpace "WhiteSpace"
    = [ \t\r\n\f]+

EndOfStatement "EndOfStatement"
    = ';' WhiteSpace?

RoundBraceOpen "RoundBraceOpen"
    = '(' WhiteSpace?

RoundBraceClose "RoundBraceClose" 
    = ')' WhiteSpace?

CurlyBraceOpen "CurlyBraceOpen" 
    = '{' WhiteSpace?

CurlyBraceClose "CurlyBraceClose" 
    = '}' WhiteSpace?

SquareBraceOpen "SquareBraceOpen"
    = '[' WhiteSpace?

SquareBraceClose "SquareBraceClose"
    = ']' WhiteSpace?

AngleBraceOpen "AngleBraceOpen" 
    = WhiteSpace? '<' WhiteSpace?
    
AngleBraceClose "AngleBraceClose" 
    = WhiteSpace? '>' WhiteSpace?

Characters "Characters"
  = [^\0-\x1F\x22\x5C]

QuotationMark "QuotationMark"
  = '"' WhiteSpace?

Comma "Comma"
    = ',' WhiteSpace?

