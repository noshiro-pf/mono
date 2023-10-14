export class User {
  databaseKey: string;
  name: string = '';
  nameYomi: string = '';

  constructor(
    databaseKey?: string,
    initObj?: {
      name: string;
      nameYomi: string;
    },
  ) {
    this.databaseKey = databaseKey || '';

    if (!initObj) return;
    this.name = initObj.name || '';
    this.nameYomi = initObj.nameYomi || '';
  }
}
