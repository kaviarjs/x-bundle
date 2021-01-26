import { Inject, Service } from "@kaviar/core";
import { Collection } from "@kaviar/mongo-bundle";
import { PubSub } from "graphql-subscriptions";
import { EventEmitter } from "events";
import { v4 as uuid } from "uuid";
import {
  MESSENGER,
  GraphQLSubscriptionEvent,
  IS_LIVE_DEBUG,
} from "../constants";
import {
  ISubscriptionOptions,
  IMessenger,
  ISubscriptionEventOptions,
} from "../defs";
import { pubsub } from "../graphql/pubsub";
import { SubscriptionHandler } from "../models/SubscriptionHandler";
import { SubscriptionProcessor } from "../models/SubscriptionProcessor";
import { LIVE_BEHAVIOR_MARKER } from "../behaviors/live.behavior";
import { IQueryBody } from "@kaviar/nova";

@Service()
export class SubscriptionStore {
  public processors: SubscriptionProcessor<any>[] = [];

  protected pubSubEventEmitter: EventEmitter;
  protected pubSub: PubSub;
  protected pubSubChannelStore: {
    [uuid: string]: SubscriptionHandler<any>;
  } = {};

  constructor(
    @Inject(IS_LIVE_DEBUG)
    protected readonly isDebug: boolean,
    @Inject(MESSENGER)
    protected readonly messenger: IMessenger
  ) {
    this.pubSubEventEmitter = new EventEmitter();
    this.pubSub = new PubSub({
      eventEmitter: this.pubSubEventEmitter,
    });
  }

  async createAsyncIterator<T>(
    collection: Collection<T>,
    subscriptionOptions: ISubscriptionOptions
  ): Promise<AsyncIterator<any>> {
    const channel = uuid();

    const publish = function (event, document?) {
      pubsub.publish(channel, { document, event });
    };

    const handler = await this.createSubscription(collection, {
      ...subscriptionOptions,
      onAdded: (document) => {
        publish(GraphQLSubscriptionEvent.ADDED, document);
      },
      onChanged: (document, changeSet) => {
        publish(GraphQLSubscriptionEvent.CHANGED, {
          _id: document._id,
          ...changeSet,
        });
      },
      onRemoved: (document) => {
        publish(GraphQLSubscriptionEvent.REMOVED, {
          _id: document._id,
        });
      },
    });

    publish(GraphQLSubscriptionEvent.READY, {});

    this.pubSubChannelStore[channel] = handler;
    this.handleAsyncIteratorStopping(channel);

    // TODO: think whether you need to asyncIterate and return it before beginning the process of subscription
    // like new Promise, resolve with async iterator, then begin creating the handle and etc
    return this.pubSub.asyncIterator(channel);
  }

  async createSubscription<T>(
    collection: Collection<T>,
    body: IQueryBody,
    eventOptions?: ISubscriptionEventOptions
  ): Promise<SubscriptionHandler<any>> {
    if (!collection[LIVE_BEHAVIOR_MARKER]) {
      console.warn(
        `This collection: "${collection.collectionName}" does not have the live behavior attached. Reactivity may not work as expected.`
      );
    }
    this.cleanupBody(body);

    const id = SubscriptionStore.getSubscriptionId(collection, body);
    // first we find if there's a processor for this id

    let foundProcessor = this.processors.find(
      (processor) => processor.id == id
    );

    // if it doesn't exist, we create the processor
    if (!foundProcessor) {
      foundProcessor = this.createProcessor(collection, body);
      await foundProcessor.start();
    } else {
      this.isDebug &&
        console.log(
          `[${collection.collectionName}] Re-using processor with id: ${foundProcessor.id}`
        );
    }

    // we create the handle, and we push it to this processor
    const subscriptionHandler = new SubscriptionHandler(foundProcessor, this);
    this.attachEventsToHandlerFromOptions<T>(eventOptions, subscriptionHandler);

    foundProcessor.attachHandler(subscriptionHandler);

    return subscriptionHandler;
  }

  /**
   * This makes sure that later we don't have to deal with existence checks
   * @param body
   */
  private cleanupBody(body: IQueryBody) {
    if (!body.$) {
      body.$ = {};
    }
    body.$ = Object.assign(
      {
        filters: {},
        options: {},
      },
      body.$
    );
    if (!body._id) {
      body._id = 1;
    }
  }

  /**
   * This creates the handle of removing
   * @param channel
   */
  protected handleAsyncIteratorStopping(channel) {
    const stopObserver = (_channel) => {
      if (_channel === channel) {
        if (this.pubSubChannelStore[channel]) {
          this.pubSubChannelStore[channel].stop();
          delete this.pubSubChannelStore[channel];
        }

        this.pubSubEventEmitter.removeListener("removeListener", stopObserver);
      }
    };

    this.pubSubEventEmitter.on("removeListener", stopObserver);
  }

  /**
   * This method is used to register the events before any document is added
   * @param subscriptionEvents
   * @param subscriptionHandler
   */
  protected attachEventsToHandlerFromOptions<T>(
    subscriptionEvents: ISubscriptionEventOptions = {},
    subscriptionHandler: SubscriptionHandler<any>
  ) {
    ["onAdded", "onChanged", "onRemoved"].forEach((event) => {
      if (subscriptionEvents[event]) {
        if (Array.isArray(subscriptionEvents[event])) {
          subscriptionEvents[event].forEach((handler) => {
            subscriptionHandler[event](handler);
          });
        } else {
          subscriptionHandler[event](subscriptionEvents[event]);
        }
      }
    });
  }

  /**
   *
   * @param handle
   */
  stopHandle(handle: SubscriptionHandler<any>) {
    handle.processor.detachHandler(handle);
    if (!handle.processor.hasHandlers()) {
      this.stopProcessor(handle.processor);
    }
  }

  createProcessor<T>(
    collection: Collection<T>,
    body: IQueryBody
  ): SubscriptionProcessor<any> {
    const processor = new SubscriptionProcessor(
      this.messenger,
      this.isDebug,
      collection,
      body
    );
    this.isDebug &&
      console.log(
        `[${collection.collectionName}] Created subscription with id: ${processor.id}`
      );

    this.processors.push(processor);

    return processor;
  }

  stopProcessor(processor: SubscriptionProcessor<any>) {
    processor.stop();
    this.processors = this.processors.filter(
      (_processor) => processor !== _processor
    );
  }

  static getSubscriptionId(collection: Collection, body: IQueryBody) {
    // We need to ensure that first level cannot be a function
    return collection.collectionName + ":" + JSON.stringify(body);
  }
}

// Responsible of keeping all the subscription processors and their ids
// When a new subscription comes in, we need to check if we can re-use a processor
// When a subscription dies we need to properly ensure that the processor no longer exists
