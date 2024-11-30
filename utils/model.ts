type StrapiResponse<T> = {
  data: T;
  message: string;
};

export interface Attribute {
  url: string;
  alternativeText?: any;
  caption?: any;
  width: number;
  height: number;
}

export interface Data {
  id: number;
  url: string;
  alternativeText?: any;
  caption?: any;
  width: number;
  height: number;
}

export interface Picture {
  data: Data;
}

export interface Button {
  id: number;
  url: string;
  newTab: boolean;
  text: string;
  type: string;
}

export interface ContentSection {
  id: number;
  __component: string;
  title: string;
  description: string;
  picture: Picture;
  buttons: Button[];
}

export interface Attribute {
  shortName: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  heading?: any;
  description?: any;
  contentSections: ContentSection[];
}

export interface Data {
  id: number;
  url: string;
  alternativeText?: any;
  caption?: any;
  width: number;
  height: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface Meta {
  pagination: Pagination;
}

export interface RootObject {
  data: Data[];
  meta: Meta;
}
export interface Session {
  user: {
    data: {
      username: string;
      name: string;
      surname: string;
      email: string;
    };
  };
  expires: string;
  id: number;
  jwt: string;
}

export interface Article {
  id: number;
  title: string;
  summary: string;
  slug: string;
  content: string;
  image: {
    url: string;
    alternativeText: string;
  };
  homepage_image: {
    url: string;
    alternativeText: string;
  };
  category: {
    title: string;
    slug: string;
  };
  cities: { data: Cities[] };
  tags: { data: Tags[] };
  view: {
    id: number;
  };
  comments: { data: CommentsProp[] };
  reactions: { data: Reactions[] };
  contentSections: any[];
  publishedAt: Date;
  updatedAt: Date;
}
export interface CommentUser {
  id: number;
  about: string;
  name: string;
  surname: string;
  username: string;
  blocked: boolean;
  confirmed: Boolean;
  avatar: any;
  SystemAvatar: any;
  role: {
    data: {
      name: string;
    };
  };
  city: {
    data: City;
  };
}

interface ReactionType {
  id: number;
  title: string;
  slug: string;
  sort: number;
  image: any;
}
interface Reactions {
  id: number;
  Value: number;
  ReactionType: {
    data: ReactionType;
  };
}
interface Tags {
  id: number;
  title: string;
  slug: string;
}
interface Cities {
  id: number;
  title: string;
  slug: string;
}
export interface City {
  title: string;
}
export interface CommentsProp {
  id: number;
  blockedThread: boolean;
  content: string;
  createdAt: Date;
  dislike: number;
  like: number;
  flag: number;
  approvalStatus: string;
  reply_froms: {
    data: CommentsProp[];
  };
  thread_of: {
    data: CommentsProp;
  };
  thread_ons: {
    data: CommentsProp[];
  };
  reply_to: {
    data: CommentsProp;
  };
  user: {
    data: CommentUser;
  };
}

export interface CommentFormValues {
  content: string;
  email: string;
  name: string;
  surname: string;
  password: string;
  term: boolean;
  api: string;
}
