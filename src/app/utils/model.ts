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
  attributes: Attribute;
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
  attributes: Attribute;
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
  attributes: {
    title: string;
    summary: string;
    slug: string;
    content: string;
    image: {
      data: {
        attributes: {
          url: string;
          alternativeText: string;
        };
      };
    };
    category: {
      data: {
        attributes: {
          title: string;
          slug: string;
        };
      };
    };
    cities: { data: Cities[] };
    tags: { data: Tags[] };
    view: {
      data: {
        id: number;
      };
    };
    comments: { data: CommentsProp[] };
    reactions: { data: Reactions[] };
    contentSections: any[];
    publishedAt: Date;
    updatedAt: Date;
  };
}
export interface CommentUser {
  id: number;
  attributes: {
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
        attributes: {
          name: string;
        };
      };
    };
    city: {
      data: City;
    };
  };
}

interface ReactionType {
  id: string;
  attributes: {
    title: string;
    slug: string;
    sort: number;
    image: any;
  };
}
interface Reactions {
  id: string;
  attributes: {
    Value: number;
    ReactionType: {
      data: ReactionType;
    };
  };
}
interface Tags {
  id: string;
  attributes: {
    title: string;
    slug: string;
  };
}
interface Cities {
  id: string;
  attributes: {
    title: string;
    slug: string;
  };
}
export interface City {
  attributes: {
    title: string;
  };
}
export interface CommentsProp {
  id: string;
  slug: string;
  position: string;
  attributes: {
    blockedThread: boolean;
    content: string;
    createdAt: Date;
    dislike: number;
    like: number;
    flag: number;
    approvalStatus: string;
    thread_ons: {
      data: CommentsProp[];
    };
    user: {
      data: CommentUser;
    };
  };
}
