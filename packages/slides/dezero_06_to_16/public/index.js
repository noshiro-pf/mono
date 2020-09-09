import Reveal from 'reveal.js';
import 'reveal.js/dist/reset.css';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/serif.css';
import Highlight from 'reveal.js/plugin/highlight/highlight.esm.js';
import 'reveal.js/plugin/highlight/monokai.css';
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js';
import Math from 'reveal.js/plugin/math/math.esm.js';
import Notes from 'reveal.js/plugin/notes/notes.esm.js';

/* eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
new Reveal({
  hash: true,
  slideNumber: true,
  math: {
    mathjax: 'https://cdn.jsdelivr.net/gh/mathjax/mathjax@2.7.8/MathJax.js',
    config: 'TeX-AMS_HTML-full',
    // pass other options into `MathJax.Hub.Config()`
    TeX: {
      Macros: {
        // dlim: ["\\displaystyle \\lim_{#1}{#2}", 2],
        sforall: '{}^{\\forall}',
        sexists: '{}^{\\exists}',
        dlim: '\\lim\\limits',
        ol: ['\\overline{#1}', 1],
        red: ['{\\color{red}{#1}}', 1],
        blue: ['{\\color{blue}{#1}}', 1],
        R: '{\\mathbf{R}}',
        N: '{\\mathbf{N}}',
        d: '{\\mathrm{d}}',
        diff: ['{\\frac{\\mathrm{d}{#1}}{\\mathrm{d}{#2}}}', 2],
        deltadiff: ['{\\frac{\\Delta{#1}}{\\Delta{#2}}}', 2],
        partialdiff: ['{\\frac{\\partial{#1}}{\\partial{#2}}}', 2],
      },
    },
  },
  // Learn about plugins: https://revealjs.com/plugins/
  plugins: [Markdown, Highlight, Notes, Math],
}).initialize();
