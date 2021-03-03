import "@kaviar/mongo-bundle";

export type LiveOptionsType = {
  disable?: boolean;
  channels?: string[];
};

declare module "@kaviar/mongo-bundle" {
  interface IExecutionContext {
    live?: LiveOptionsType;
  }
}
