{
    /*const astModule = */require('./ast')(location, options.file);
    // const {
    //     AST, 
    //     CodeFile,
    //     Entity,
    //     RootEntity,
    //     IncludeEntity,
    //     UseEntity, 
    //     ParameterEntity,
    //     StatementEntity, 
    //     ValueEntity,
    //     ReferenceValue,
    //     NumberValue, 
    //     BooleanValue,
    //     StringValue,
    //     VectorValue,
    //     RangeValue,
    //     ParameterListEntity,
    //     VariableEntity,
    //     ExpressionEntity,
    //     ModuleEntity
    // } = astModule;

    const ast = new AST();


    console.log('Parsing...');
}

start = ws? statements:statement* ws?  { 
    return ast.addEntites(statements); 
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
// Comments
comment "Comment"
    = '/*' head:[^*]* '*'+ tail:([^/*] [^*]* '*'+)* '/' { 
        return new CommentEntity(head.join('') + _.map(tail, (element) => {
            return element[0] + element[1].join('');
        }), true);
    }
    / '//' text:[^\n]* '\n' { return new CommentEntity(text.join('')); }

// --------------------------------------------------------------------------------------------------
// Includes
include "Include"
    = 'include' ws? includeOpen path:includeFile includeClose eos { return new IncludeEntity(null,path); }
    / 'use' ws? includeOpen path:includeFile includeClose eos { return new UseEntity(null,path); }

includeOpen = ws? '<' ws?
includeClose = ws? '>' ws?

includeFile = ws? path:[\.A-Za-z0-9\-_/]+ ws? { return path.join(''); }


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
        return null/*new Entity('Action', {name, params, modifier}, operators)*/;
    }
    / modifier:actionModifiers? name:name params:parameterList operators:(actionOperators)* block:block { 
        return null/*new Entity('OperatorAction', {name, params, operators, modifier}, block)*/;
    }

actionOperators
    = modifier:actionModifiers? name:name params:parameterList { 
            let data = {
                name, 
                params
            };
            if(modifier)
                data.modifier = modifier.modifier;
            return null/*new Entity('ActionOperator', data)*/;
        }

actionModifiers "Modifiers"
    = ws? '#' ws? { 
            return null/*new Entity('ActionModifier', 'highlight')*/;
         }
    / ws? '%' ws? { 
            return null/*new Entity('ActionModifier', 'transparent')*/;
        }
    / ws? '!' ws? {
            return null/*new Entity('ActionModifier', 'showOnly')*/;
          }
    / ws? '*' ws? { 
            return null/*new Entity('ActionModifier', 'disable')*/;
        }

// --------------------------------------------------------------------------------------------------
// Variables
variable "Variable definition"
    = name:name assign expression:expression  eos { 
            return new VariableEntity(name, expression);
             }


// --------------------------------------------------------------------------------------------------
// Types

// Float
float  "Float"
    =  ws? neg:'-'? ws? value:[0-9\.]+ { return new NumberValue(parseFloat(value.join(''),10), neg); }

// String
string "String"
    =  quotationMark value:chars* quotationMark { return new StringValue(value.join('')); }
chars
  = [^\0-\x1F\x22\x5C]
quotationMark "Quotation mark"
  = ws? '"' ws?

// Vector
vector "Vector"
    =  ws? neg:'-'? ws? vectorBracketOpen values:vectorList vectorBracketClose {  return new VectorValue(values, neg); }
vectorBracketOpen "Vector open bracket"
    = ws? '[' ws?
vectorBracketClose "Vector close bracket"
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
    / vector

// --------------------------------------------------------------------------------------------------
// Names (Varaibles, Functions, Actions, Modules)
name "Name"
     =  head:[A-Za-z] tail:[A-Za-z0-9_]* ws? { return head + (tail.join('') || ''); }
     /  head:'$' tail:[A-Za-z0-9_]+ ws? { return head + (tail.join('') || ''); }

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

// termOperator = ws? operator:[-+*/] ws?


termOperator "Mathematical operator"
    = op:'+' ws? { return 'Add'; }
    / op:'-' ws? { return 'Subract'; }
    / op:'*' ws? { return 'Multiply'; }
    / op:'/' ws? { return 'Divide'; }
    / op:'%' ws? { return 'Modulo'; }

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
            return new ParameterList(_.concat([],head, tail));
        else
            return new ParameterList([head]);
    }

parameterListItem 
    = name:name assign value:expression { return {name, value}; }
    / value:expression { return {value}; }
parameterOpen = ws? '(' ws?
parameterClose = ws? ')' ws?

// Parameter definitions  (Functions, Modules)
parameterDefinitionList 
    = parameterOpen  head:parameterDefinitionListItem?  tail:(comma parameterDefinitionListItem)* parameterClose { 
        if(tail.length > 0)
            return new ParameterDefinitionList(_.concat([],head, tail));
        else
            return new ParameterDefinitionList([head]);
    }

parameterDefinitionListItem 
    = name:name assign value:value { return {name,value}; }
    / name

// --------------------------------------------------------------------------------------------------
// Blocks
block = blockOpen block:statement* blockClose {return block;}
blockOpen = ws? '{' ws?
blockClose = ws? '}' ws?

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