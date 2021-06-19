export interface MyGlobalPlatformsRanksChangedMessage {
  changes: MyGlobalPlatformRankChange[];
}

interface MyGlobalPlatformRankChange {
  my_global_platform_id: number;
  rank: number;
}
