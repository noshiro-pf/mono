export const fbPaths = {
  storage: {
    cardImages: 'images/card',
    ruleBooks: 'pdf',
  },
  db: {
    dev: {
      expansionNameList: '/dev/data/expansionNameList',
      cardPropertyList: '/dev/data/cardPropertyList',
      scoringTable: '/dev/data/scoreTable',
      users: '/dev/users',
      gameResultList: '/dev/gameResultList',
      randomizerGroupList: '/dev/randomizerGroupList',
      onlineGameRoomsList: '/dev/onlineGameRooms',
      onlineGameCommunicationList: '/dev/onlineGameCommunicationList',
    },
    prod: {
      expansionNameList: '/prod/data/expansionNameList',
      cardPropertyList: '/prod/data/cardPropertyList',
      scoringTable: '/prod/data/scoreTable',
      users: '/prod/users',
      gameResultList: '/prod/gameResultList',
      randomizerGroupList: '/prod/randomizerGroupList',
      onlineGameRoomsList: '/prod/onlineGameRooms',
      onlineGameCommunicationList: '/prod/onlineGameCommunicationList',
    },
    usersSortBy: 'nameYomi',
  },
};
