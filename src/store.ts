/* eslint-disable @typescript-eslint/no-explicit-any */
class Store {
  private static instance: Store;

  private cache: Map<string, any>;
  private subscribers: Map<string, Set<(data: any) => void>>;

  private constructor() {
    this.cache = new Map();
    this.subscribers = new Map();
  }

  public static getInstance() {
    if (Store.instance) {
      return Store.instance;
    }

    Store.instance = new Store();
    return Store.instance;
  }

  public get(key: string) {
    return this.cache.get(key);
  }

  public set(key: string, value: any) {
    const saved = this.cache.get(key);
    if (saved === value) {
      return;
    }

    this.cache.set(key, value);

    this.subscribers.get(key)?.forEach((subscriber) => subscriber(value));
  }

  public subscribe(key: string, subscriber: (data: any) => void) {
    const subscriberSet = this.subscribers.get(key);

    if (subscriberSet) {
      subscriberSet.add(subscriber);
    } else {
      this.subscribers.set(key, new Set([subscriber]));
    }
  }

  public unSubscribe(key: string, subscriber: (data: any) => void) {
    const subscriberSet = this.subscribers.get(key);
    if (subscriberSet) {
      subscriberSet.delete(subscriber);
    }
  }
}

export default Store;
