export interface SearchDocument {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  author: string;
  permissions: {
    read: string[];
    write: string[];
  };
}

export interface SearchResult {
  document: SearchDocument;
  score: number;
  highlights: string[];
}

export interface SearchFilters {
  category?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  author?: string;
}

export type SearchItem = {
  id: string;
  type?:
    | "file"
    | "spreadsheet"
    | "presentation"
    | "document"
    | "link"
    | "person"
    | "message"
    | "query";
  title: string;
  source?: string;
  updated?: string;
  author?: string;
  snippet?: string;
  icon?: React.ElementType;
  avatar?: string;
  tags?: string[];
  query?: string;
};
