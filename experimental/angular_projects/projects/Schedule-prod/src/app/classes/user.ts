export class User {
  databaseKey: string;
  name: string = '';
  name_yomi: string = '';

  constructor(
    databaseKey?: string,
    initObj?: {
      name: string;
      name_yomi: string;
    }
  ) {
    this.databaseKey = databaseKey || '';

    if (!initObj) return;
    this.name = initObj.name || '';
    this.name_yomi = initObj.name_yomi || '';
  }
}
