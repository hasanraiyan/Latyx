export const COMPILERS = [
  { value: 'pdflatex', label: 'pdfLaTeX' },
  { value: 'xelatex', label: 'XeLaTeX' },
  { value: 'lualatex', label: 'LuaLaTeX' },
];

export const AI_PROVIDERS = [
  { value: 'pollinations', label: 'Pollinations AI' },
  { value: 'gemini', label: 'Google Gemini' },
];

export const DEFAULT_LATEX = `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{amssymb}

\\title{My Document}
\\author{Author Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
Welcome to \\textbf{Latyx} — the modern LaTeX editor.

\\section{Mathematics}
Here is the famous Euler's identity:
\\begin{equation}
  e^{i\\pi} + 1 = 0
\\end{equation}

\\end{document}`;
