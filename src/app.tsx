import Keypad from "#/components/keypad";
import Screen from "#/components/screen";

import { useState } from "react";

export default function App() {
       const [latexMode, setLatexMode] = useState(false);
       return (
	       <>
		       <div x={["max-w-sm", "flex justify-center"]}>
			       <main x={["flex flex-col gap-4"]}>
				       <div x="flex items-center gap-2 mb-2">
					       <label>
						       <input
							       type="checkbox"
							       checked={latexMode}
							       onChange={e => setLatexMode(e.target.checked)}
						       />
						       <span x="ml-1">LaTeX mode</span>
					       </label>
				       </div>
				       <Screen latexMode={latexMode} />
				       <Keypad />
			       </main>
		       </div>
	       </>
       );
}
