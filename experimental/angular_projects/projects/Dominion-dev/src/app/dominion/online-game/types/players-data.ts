export class PlayerData {
  VPtoken: number = 0;
  vcoin: number = 0;
  debt: number = 0;

  constructor(dataObj?: { VPtoken: number; vcoin: number; debt: number }) {
    if (!dataObj) return;
    this.VPtoken = dataObj.VPtoken || 0;
    this.vcoin = dataObj.vcoin || 0;
    this.debt = dataObj.debt || 0;
  }
}
