const marked = require('marked');
const hljs = require('highlight.js');

const fs = require('fs');

const inputFileName = 'immutable_utility.md';
const outputFileName = 'immutable_utility.html';

const inputFile = fs.readFileSync(inputFileName, 'utf8');

marked.setOptions({
  highlight: (code, language) => hljs.highlight(code, { language }).value,
});

marked(inputFile, (err, html) => {
  fs.writeFileSync(outputFileName, html);
});
