import { useCalculator } from "#/state";
import { formatResult } from "#/utils/format-result";


export default function Result() {
       const { buffer, memory } = useCalculator();

       const shouldShowOutput = !buffer.isErr && !buffer.isDirty;
       const formattedOutput = formatResult(memory.ans);

       let outputContent: JSX.Element | string = formattedOutput;

       return (
	       <div
		       x={[
			       "absolute bottom-0",
			       "w-full",
			       "flex items-center justify-between",
			       "transition-all",
			       "px-4 py-1",
			       "bg-slate-100",
			       shouldShowOutput ? "translate-y-0" : "translate-y-full",
		       ]}
	       >
		       <span x="pointer-events-none text-slate-500">{"="}</span>
		       {shouldShowOutput && <output>{outputContent}</output>}
	       </div>
       );
}
