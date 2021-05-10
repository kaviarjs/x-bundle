import "@kaviar/mongo-bundle";

export type LiveOptionsType = {
  /**
   * Disable live options
   */
  disable?: boolean;
  /**
   * To which custom channels to send this message.
   */
  channels?: string[];
};

declare module "@kaviar/mongo-bundle" {
  interface IExecutionContext {
    live?: LiveOptionsType;
  }
}
