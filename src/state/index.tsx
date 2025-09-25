import { AngleUnit } from "#/calculator";
type CalculatorContext = {
	buffer: BufferHandle;
	memory: MemoryHandle;
	clearAll(): void;
	angleUnit: AngleUnit;
	radsOn(): void;
	degsOn(): void;
	crunch(saveToInd?: boolean): Decimal | undefined;
};
			import Decimal from "decimal.js";
			import { createContext, PropsWithChildren, useContext, useState } from "react";
			import useBuffer, { BufferHandle } from "./internal-buffer";
			import useMemory, { MemoryHandle } from "./internal-memory";
			import { evaluate } from "mathjs";

const CalculatorContextObject = createContext<CalculatorContext | null>(null);

export function useCalculator() {
	const handle = useContext(CalculatorContextObject);
	if (!handle) throw Error("Programmer Error: Calculator Context was used outside its Provider");
	return handle;
}

export default function CalculatorProvider({ children }: PropsWithChildren) {
	const [angleUnit, setAngleUnit] = useState<AngleUnit>("deg");
       const buffer = useBuffer();
	const memory = useMemory();

	function clearAll() {
		buffer.empty();
		memory.empty();
	}

	function crunch(saveToInd = false) {
		buffer.clean();
		let value: Decimal | undefined;
		try {
			const expr = latexToMathjs(buffer.value);
			const result = evaluate(expr);
			value = new Decimal(result);
			buffer.setErr(false);
		} catch {
			buffer.setErr(true);
			return;
		}
		if (value !== undefined) {
			memory.setAns(value);
			if (saveToInd) memory.setInd(value);
		}
		return value;
	}

       function latexToMathjs(input: string): string {
           return input.trim()
               // Unicode minus to standard minus
               .replace(/−/g, '-')
               // Unicode fractions to decimals
               .replace(/½/g, '0.5')
               .replace(/¼/g, '0.25')
               .replace(/¾/g, '0.75')
               // Unicode sqrt to mathjs sqrt()
               .replace(/√\s*([0-9.]+)/g, 'sqrt($1)')
               // Robust fraction: allow spaces, nested braces, and wrap in parentheses for mathjs
               .replace(/\\frac\s*\{([^}]*)\}\s*\{([^}]*)\}/g, '(( $1 )/( $2 ))')
               // Robust sqrt: allow spaces, nested braces
               .replace(/\\sqrt\s*\{([^}]*)\}/g, 'sqrt(($1))')
               // Nth root
               .replace(/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g, 'nthRoot(($2), ($1))')
               // Powers
               .replace(/([a-zA-Z0-9]+)\^\{([^}]*)\}/g, '($1)^($2)')
               // Subscripts
               .replace(/([a-zA-Z0-9]+)_\{([^}]*)\}/g, '$1')
               // Operators
               .replace(/\\cdot|\\times/g, '*')
               .replace(/\\div/g, '/')
               .replace(/\\pm/g, '+')
               .replace(/\\leq/g, '<=')
               .replace(/\\geq/g, '>=')
               .replace(/\\neq|\\ne/g, '!=')
               .replace(/\\wedge/g, 'and')
               .replace(/\\vee/g, 'or')
               // Functions
               .replace(/\\sin/g, 'sin')
               .replace(/\\cos/g, 'cos')
               .replace(/\\tan/g, 'tan')
               .replace(/\\arcsin/g, 'asin')
               .replace(/\\arccos/g, 'acos')
               .replace(/\\arctan/g, 'atan')
               .replace(/\\ln/g, 'log')
               .replace(/\\log/g, 'log10')
               .replace(/\\exp/g, 'exp')
               // Constants
               .replace(/\\infty/g, 'Infinity')
               .replace(/\\pi/g, 'pi')
               // Greek letters
               .replace(/\\theta/g, 'theta')
               .replace(/\\alpha/g, 'alpha')
               .replace(/\\beta/g, 'beta')
               .replace(/\\gamma/g, 'gamma')
               // Absolute value
               .replace(/\|([^|]+)\|/g, 'abs($1)')
               // Parentheses/brackets/braces
               .replace(/\\left\(/g, '(')
               .replace(/\\right\)/g, ')')
               .replace(/\\left\[/g, '[')
               .replace(/\\right\]/g, ']')
               .replace(/\\left\{/g, '{')
               .replace(/\\right\}/g, '}')
               // Vectors
               .replace(/\\vec\{([^}]*)\}/g, '$1')
               // Ellipsis
               .replace(/\\cdots|\\ldots/g, '...')
               // Quantifiers
               .replace(/\\forall|\\exists/g, '')
               // Sums
               .replace(/\\sum_\{([^}]*)=([^}]*)\}\^\{([^}]*)\} ([^ ]+)/g, 'sum($1, $2, $3, $4)')
               // Products
               .replace(/\\prod_\{([^}]*)=([^}]*)\}\^\{([^}]*)\} ([^ ]+)/g, 'prod($1, $2, $3, $4)')
               // Integrals
               .replace(/\\int_([^\^]+)\^([^ ]+) ([^ ]+) d([a-zA-Z]+)/g, 'integrate($3, $4, $1, $2)')
               // Matrices
               .replace(/\\begin\{bmatrix\}([^]*?)\\end\{bmatrix\}/g, (_, content: string) => {
                   const rows = content.trim().split('\\\\').map((row: string) => '[' + row.trim().split('&').map((e: string) => e.trim()).join(', ') + ']');
                   return '[' + rows.join(', ') + ']';
               });
       }

       // ...other logic for CalculatorProvider...
       // (Make sure all functions/components are properly closed)
       // Return the provider as before
       return (
           <CalculatorContextObject.Provider
               value={{
                   buffer,
                   memory,
                   clearAll,
                   crunch,
                   angleUnit,
                   radsOn() {
                       buffer.makeDirty();
                       setAngleUnit("rad");
                   },
                   degsOn() {
                       buffer.makeDirty();
                       setAngleUnit("deg");
                   },
               }}
           >
               {children}
           </CalculatorContextObject.Provider>
       );
}
