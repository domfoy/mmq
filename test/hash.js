const fs = require('fs');

const {test} = require('ava');

const hash = require('../lib/hash');


test('should save new track and round', async (t) => {
  const stream = fs.createReadStream(`${__dirname}/data/test2.mp3`, {});
  const result = await hash(stream);

  t.is(result, '0d1cf326809b23f01984badecfe76c58dd52b0a3');
});
