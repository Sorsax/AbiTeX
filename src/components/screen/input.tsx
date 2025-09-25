import { KeyboardEvent, FocusEvent, useEffect, ChangeEvent } from "react";

import { useCalculator } from "#/state";
import { match } from "ts-pattern";
import { EXPR_DEBUG } from "#/error-boundary/constants";

export default function Input() {
	const { buffer, crunch, memory } = useCalculator();

	const shouldShowOutput = !buffer.isDirty && !buffer.isErr;

       // Converts LaTeX patterns to Unicode equivalents (for display)
       function latexToUnicode(input: string): string {
	       input = input.replace(/\\frac\{1\}\{2\}/g, "½")
		       .replace(/\\frac\{1\}\{4\}/g, "¼")
		       .replace(/\\frac\{3\}\{4\}/g, "¾");
	       input = input.replace(/\\sqrt\{([^}]*)\}/g, (_, n) => `√${n}`);
	       return input;
       }


       function onChange(e: ChangeEvent<HTMLInputElement>) {
	       let value = e.target.value;
	       value = latexToUnicode(value);
	       (window as any)[EXPR_DEBUG] = value;
	       buffer.set(value);
       }

	function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		match(e.key)
			.with("Enter", "=", "ArrowDown", () => {
				crunch();
			})
			.with("(", () => {
				buffer.input.openBrackets();
			})
			.with(")", () => {
				buffer.input.closeBrackets();
			})
			.with("^", "/", "+", symbol => {
				buffer.input.oper(symbol);
			})
			.with("-", () => {
				buffer.input.oper("−");
			})
			.with("*", () => {
				buffer.input.oper("×");
			})
			.with("Escape", () => {
				buffer.empty();
			})
	       .with("Tab", () => {
		       // After calculation, clear input and insert last answer
		       buffer.empty();
		       if (memory.ans) {
			       buffer.set(memory.ans.toString());
		       }
	       })
			.otherwise(() => true) || e.preventDefault();
	}

	function onBlur(e: FocusEvent<HTMLInputElement>) {
		// Timeout needed because of Safari (of course)
		setTimeout(() => {
			e.target.scrollLeft = e.target.scrollWidth;
		}, 0);
	}

	useEffect(
		function BufferInputKeypadInputListener() {
			const element = buffer.ref.current;
			if (!element) return;

			if (document.activeElement !== element) {
				element.scrollLeft = element.scrollWidth;
			}
		},
		[buffer.value],
	);

       return (
	       <input
		       type="text"
		       autoFocus
		       ref={buffer.ref}
		       value={buffer.value}
		       onChange={onChange}
		       onKeyDown={onKeyDown}
		       onBlur={onBlur}
		       x={[
			       "absolute bottom-0",
			       "w-full h-full",
			       "px-4 pt-14",
			       "bg-transparent",
			       "text-right",
			       "transition-all",
			       // Focus is shown by the parent so it's safe to disable here
			       "focus:outline-none",
			       shouldShowOutput ? "text-slate-500 text-sm" : "text-black",
		       ]}
		       style={{ transform: shouldShowOutput ? "translate3d(0, -2rem, 0)" : "translate3d(0, 0, 0)" }}
		       placeholder={"Enter math or LaTeX (e.g. 1+2, \\frac{1}{2})"}
	       />
       );
}
