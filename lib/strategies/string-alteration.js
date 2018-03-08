const _ = require('lodash');

module.exports = {
  polio
};

const MISPELL_TABLE = {
  a: 'qqzs',
  b: 'nhgv',
  c: 'vfdx',
  d: 'ezsdfr',
  e: 'rdfgt',
  f: 'ccvbgtred',
  g: 'ttrfghy',
  h: 'jjkiuyhn',
  k: 'llmpoik',
  l: 'mmpol',
  m: 'pol',
  n: 'bhjk',
  o: 'likmp',
  p: 'mol',
  q: 'wazsx',
  r: 'edfgt',
  s: 'dezaqwxc',
  t: 'grfhy',
  u: 'jkiuyhnb',
  v: 'cdfgb',
  w: 'xqsdc',
  x: 'swqdc',
  y: 'juhgt',
  z: 'saqde'
};

function polio(sentence, {p1 = 0.1, p2 = 0.6} = {}) {
  return _(sentence).map((char) => {
    const makeError = Math.random();
    const chooseError = Math.random();

    if (/[a-z]/.exec(char) && makeError <= p1) {
      if (chooseError <= p2) {
        return mispell(char);
      }
      return [char, char];
    }
    return char;
  }).flatten().join('');
}

function mispell(char) {
  const possibilities = MISPELL_TABLE[char] || '';
  const card = possibilities.length;
  const choice = Math.floor(Math.random() * (card + 1));

  return possibilities[choice];
}
