import { On, Listener, Inject } from "@kaviar/core";
import { RedisConnectionResumedEvent } from "../events/RedisConnectionResumedEvent";
import { SubscriptionStore } from "../services/SubscriptionStore";

export class RedisListener extends Listener {
  @Inject()
  protected subscriptionStore: SubscriptionStore;

  @On(RedisConnectionResumedEvent)
  onRedisConnectionResumed(e: RedisConnectionResumedEvent) {
    this.subscriptionStore.processors.forEach((processor) => {
      processor.reload();
    });
  }
}
