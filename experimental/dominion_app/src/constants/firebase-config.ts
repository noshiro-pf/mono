export const fbAppConfig = {
  apiKey: 'AIzaSyBGFhmydRA7hmBMjTqe9pfa80lNEjb7G-0',
  authDomain: 'dominionapps.firebaseapp.com',
  databaseURL: 'https://dominionapps.firebaseio.com',
  projectId: 'dominionapps',
  storageBucket: 'dominionapps.appspot.com',
  messagingSenderId: '830879011229'
}

const devOrProd: 'dev' | 'prod' = (() => {
  switch (process.env.APP_ENV) {
    case 'development':
      return 'dev'
    case 'production':
      return 'prod'
    default:
      return 'dev'
  }
})()

export const fbPaths = {
  storage: {
    dcardImages: 'images/dcard',
    rulebookCoverImage: 'images/cover',
    rulebookPdf: 'pdf'
  },
  database: {
    data: {
      dcardlist: `/${devOrProd}/data/dcardPropertyList`,
      expansions: `/${devOrProd}/data/expansions`,
      scoreTable: `/${devOrProd}/data/scoreTable`
    },
    gameResults: `/${devOrProd}/gameResultList`,
    onlineGameCommunications: `/${devOrProd}/onlineGameCommunicationList`,
    onlineGameRooms: `/${devOrProd}/onlineGameRooms`,
    randomizerGroups: `/${devOrProd}/randomizerGroups`,
    users: `/${devOrProd}/users`
  }
}
