export class QueryInput {
  filters: {
    [key: string]: any;
  };
  options: QueryOptionsInput;
}

export class QueryOptionsInput {
  sort: {
    [key: string]: any;
  };
  limit: number;
  skip: number;
}

export class DocumentUpdateInput {
  _id: any;
  dataSet: {
    [key: string]: any;
  };
}
