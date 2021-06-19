
interface IGDBMatch {
  match_date: Date;
  id: number;
  name: string;
  rating: number;
  rating_count: number;
  slug: string;
  summary: string;
  updated_at: number;
  url: string;
  genres: {
    id: number;
    name: string;
  }[];
  involved_companies: {
    id: number;
    company: {
      id: number;
      name: string;
    }
  }[];
  keywords: {
    id: number;
    name: string;
  }[];
  platforms: {
    id: number;
    name: string;
  }[];
  cover: {
    id: number;
    width: number;
    height: number;
    image_id: string;
  };
  player_perspectives: {
    id: number;
    name: string;
  }[];
  release_dates: {
    id: number;
    date: number;
    platform: {
      id: number;
      name: string;
    }
  }[];
  tags: number[];
}
