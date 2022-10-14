import { run } from './src/index';

run()
  .then((P) => {
    console.log('running server')
  })
  .catch((err) => {
    console.error('error', err);
  });
