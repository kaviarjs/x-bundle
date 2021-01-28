import { Inject, Service } from "@kaviar/core";
import { IS_LIVE_DEBUG, REDIS_OPTIONS } from "../constants";
import { ClientOpts, createClient, RedisClient } from "redis";
import { EJSON } from "@kaviar/ejson";
import { IMessenger, ISubscriptionEvent, MessageHandleType } from "../defs";
import { SubscriptionStore } from "./SubscriptionStore";
import Queue from "queue";

@Service()
export class RedisMessenger implements IMessenger {
  listener: RedisClient;
  pusher: RedisClient;
  protected queue: Queue;
  protected channelMap: {
    [key: string]: MessageHandleType[];
  } = {};

  constructor(
    @Inject(IS_LIVE_DEBUG)
    protected readonly isDebug: boolean,
    @Inject(REDIS_OPTIONS)
    protected readonly options: ClientOpts,
    protected readonly subscriptionStore: SubscriptionStore
  ) {
    this.queue = new Queue({
      autostart: true,
    });
    this.listener = createClient(options);
    this.pusher = createClient(options);

    this.attachEventsToListener();
  }

  /**
   * @param channels
   * @param data
   */
  async publish(channels: string[], data: ISubscriptionEvent) {
    const msg = EJSON.stringify(data);

    channels.forEach((channel) => {
      this.pusher.publish(channel, msg);
    });
  }

  /**
   * Attach events to log
   */
  protected attachEventsToListener() {
    this.listener.on("error", (err) => {
      console.error(`Redis - An error occured: \n`, JSON.stringify(err));
    });
    this.listener.on("end", () => {
      console.error("Redis - Connection to redis ended");
    });
    this.listener.on("reconnecting", (err) => {
      if (err) {
        console.error(
          "Redis - There was an error when re-connecting to redis",
          JSON.stringify(err)
        );
      }
    });
    this.listener.on("connect", (err) => {
      if (!err) {
        console.log("Redis - Established connection to redis.");
      } else {
        console.error(
          "Redis - There was an error when connecting to redis",
          JSON.stringify(err)
        );
      }

      // On initial connection we should have 0 so it's no problem doing it right now
      this.subscriptionStore.processors.forEach((processor) => {
        processor.reload();
      });
    });
  }

  /**
   * @param channel
   * @param handler
   */
  subscribe(channel: string, handler: MessageHandleType) {
    this.queue.push(() => {
      if (!this.channelMap[channel]) {
        this.initChannel(channel);
      }
      this.channelMap[channel].push(handler);
    });
  }

  /**
   * @param {string} channel
   * @param {function} handler
   */
  unsubscribe(channel, handler: MessageHandleType) {
    this.queue.push(() => {
      if (!this.channelMap[channel]) {
        return;
      }

      this.channelMap[channel] = this.channelMap[channel].filter((_handler) => {
        return _handler !== handler;
      });

      if (this.channelMap[channel].length === 0) {
        this.destroyChannel(channel);
      }
    });
  }

  /**
   * Initializes listening for redis messages
   * @private
   */
  initListener() {
    this.listener.on("message", (channel, _message) => {
      if (this.channelMap[channel]) {
        const message = EJSON.parse(_message);
        this.channelMap[channel].forEach((channelHandler) => {
          channelHandler(message);
        });
      }
    });
  }

  /**
   * @param channel
   * @private
   */
  protected initChannel(channel) {
    this.listener.subscribe(channel);
    this.channelMap[channel] = [];
  }

  /**
   * @param channel
   * @private
   */
  protected destroyChannel(channel) {
    this.listener.unsubscribe(channel);
    delete this.channelMap[channel];
  }
}
