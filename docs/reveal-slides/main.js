// Shared by every deck here, each of which loads it as `../main.js`.
//
// reveal.js comes from the CDN at a pinned version rather than from npm through
// a bundler: these are talks already given, so nothing here is meant to move,
// and with no build step a deck is the same files in a preview
// (`pnpm dlx serve docs/reveal-slides`) and on the Pages site.
import Reveal from 'https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.esm.js';
import Highlight from 'https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/highlight/highlight.esm.js';
import Markdown from 'https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/markdown/markdown.esm.js';
import RevealMath from 'https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/math/math.esm.js';
import Notes from 'https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/notes/notes.esm.js';

new Reveal({
  hash: true,
  slideNumber: true,
  math: {
    mathjax: 'https://cdn.jsdelivr.net/gh/mathjax/mathjax@2.7.8/MathJax.js',
    config: 'TeX-AMS_HTML-full',
    // The decks write math inside backticks (`$x$`), as reveal.js long
    // documented for Markdown, so MathJax has to look inside `<code>`. The
    // plugin stopped doing that in 5.2, and merges this object shallowly, so
    // `inlineMath` is restated with it.
    tex2jax: {
      inlineMath: [
        ['$', '$'],
        ['\\(', '\\)'],
      ],
      skipTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
    },
    // pass other options into `MathJax.Hub.Config()`
    TeX: {
      Macros: {
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
  plugins: [Markdown, Highlight, Notes, RevealMath],
}).initialize();
