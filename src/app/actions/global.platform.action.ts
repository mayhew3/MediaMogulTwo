export class GetGlobalPlatforms {
  static readonly type = '[GlobalPlatform] Get';
  constructor(public person_id: number) {
  }
}

export class AddGlobalPlatform {
  static readonly type = '[GlobalPlatform] Add';
  constructor(public full_name: string,
              public short_name: string,
              public igdb_name: string,
              public igdb_platform_id: number) {
  }
}

export class UpdateGlobalPlatform {
  static readonly type = '[GlobalPlatform] Update';
  constructor(public global_platform_id: number,
              public full_name: string,
              public short_name: string,
              public metacritic_uri: string) {
  }
}
