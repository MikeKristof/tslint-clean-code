import * as ts from 'typescript';
import * as Lint from 'tslint';

import { ErrorTolerantWalker } from './utils/ErrorTolerantWalker';
import { ExtendedMetadata } from './utils/ExtendedMetadata';

export const FAILURE_STRING: string = 'Flag (boolean) arguments are not allowed: ';

/**
 * Implementation of the newspaper-order rule.
 */
export class Rule extends Lint.Rules.AbstractRule {

    public static metadata: ExtendedMetadata = {
        ruleName: 'no-flag-args',
        type: 'maintainability',
        description: 'Passing a boolean into a function is a truly terrible practice. ' +
        'It immediately complicates the signature of the method, loudly proclaiming that this function does more than one thing.',
        options: null,
        optionsDescription: '',
        typescriptOnly: true,
        issueClass: 'Non-SDL',
        issueType: 'Warning',
        severity: 'Important',
        level: 'Opportunity for Excellence',
        group: 'Correctness',
        recommendation: 'true,',
        commonWeaknessEnumeration: '398, 710'
    };

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoFlagArgsRuleWalker(sourceFile, this.getOptions()));
    }
}

class NoFlagArgsRuleWalker extends ErrorTolerantWalker {

    protected visitParameterDeclaration(node: ts.ParameterDeclaration): void {
        const { type } = node;
        const isBooleanParameter = (type && type.kind === ts.SyntaxKind.BooleanKeyword);
        if (isBooleanParameter) {
            const failureMessage = this.makeFailureMessage(node, FAILURE_STRING);
            this.addFailureAt(node.getStart(), node.getWidth(), failureMessage);
        }
        super.visitParameterDeclaration(node);
    }

    private makeFailureMessage(node: ts.ParameterDeclaration, failureString: string): string {
        const paramName = node.name.getText();
        const pascalCaseParamName = this.toPascalCase(paramName);
        const functionName: string | undefined = node.parent.name && node.parent.name.getText();
        const recommendation = functionName ? (
            '\nSplit the function into two, such as ' +
            `${functionName}When${pascalCaseParamName}` + ' and ' +
            `${functionName}WhenNot${pascalCaseParamName}.`
        ) : '\nSplit the function into two.';
        return failureString + paramName + recommendation;
    }

    private toPascalCase(str: string) {
        if (typeof str !== 'string' || str.length === 0) {
            return str;
        }
        return str[0].toUpperCase() + str.slice(1);
    }

}
