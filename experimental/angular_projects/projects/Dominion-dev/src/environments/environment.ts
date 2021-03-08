// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyBGFhmydRA7hmBMjTqe9pfa80lNEjb7G-0',
    authDomain: 'dominionapps.firebaseapp.com',
    databaseURL: 'https://dominionapps.firebaseio.com',
    projectId: 'dominionapps',
    storageBucket: 'dominionapps.appspot.com',
    messagingSenderId: '830879011229',
  },
  // firebase: {
  //   apiKey: 'AIzaSyATahReMsoYLsgo60MsBGXXOBHKDB1kcPQ',
  //   authDomain: 'dominionappstest.firebaseapp.com',
  //   databaseURL: 'https://dominionappstest.firebaseio.com',
  //   projectId: 'dominionappstest',
  //   storageBucket: '',
  //   messagingSenderId: '901667738014'
  // },
};
