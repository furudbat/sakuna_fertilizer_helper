/// https://refactoring.guru/design-patterns/observer/typescript/example

import { LoggerManager } from "typescript-logger";

/**
 * The Subject interface declares a set of methods for managing subscribers.
 */
export interface Subject {
    // Attach an observer to the subject.
    attach(observer: Observer): void;

    // Detach an observer from the subject.
    detach(observer: Observer): void;

    // Notify all observers about an event.
    notify(): void;
}

/**
 * The Subject interface declares a set of methods for managing subscribers.
 */
export interface ListSubject {
    // Attach an observer to the subject.
    attach(observer: Observer): void;

    // Detach an observer from the subject.
    detach(observer: Observer): void;

    // Notify all observers about an event.
    notify(): void;
}

/**
 * The Observer interface declares the update method, used by subjects.
 */
export interface Observer {
    // Receive update from subject.
    update(subject: Subject): void;
}

export interface ListObserver {
    // Receive update from subject.
    update(subject: ListSubject): void;

    // Receive update from subject.
    updateItem(subject: ListSubject, index: number): void;
}

/**
 * The Observer interface declares the update method, used by subjects.
 */
export interface DataObserver<T> {
    // Receive update from subject.
    update(subject: DataSubject<T>): void;
}

export interface DataListObserver<T> {
    // Receive update from subject.
    update(subject: DataListSubject<T>): void;
    
    updateItem(subject: DataListSubject<T>, updated: T, index: number): void;
    updateAddedItem(subject: DataListSubject<T>, added: T): void;
    updateRemovedItem(subject: DataListSubject<T>, removed: T): void;
}


/**
 * The Subject owns some important state and notifies observers when the state
 * changes.
 */
export class DataSubject<T> implements Subject {
    /**
     * @type {number} For the sake of simplicity, the Subject's state, essential
     * to all subscribers, is stored in this variable.
     */
    private _state: T;

    /**
     * @type {Observer[]} List of subscribers. In real life, the list of
     * subscribers can be stored more comprehensively (categorized by event
     * type, etc.).
     */
    private observers: DataObserver<T>[] = [];

    private log = LoggerManager.create(`Observer:DataSubject`);

    constructor(value: T) {
        this._state = value;
    }

    set data(value: T) {
        this._state = value;
        this.notify();
    }

    get data() {
        return this._state;
    }
    
    public let(lets: (value: T) => T) {
        this._state = lets(this._state);
        this.notify();
        return this._state;
    }

    /**
     * The subscription management methods.
     */
    public attach(observer: DataObserver<T>): void {
        const isExist = this.observers.includes(observer);
        if (isExist) {
            this.log.warn('Subject: Observer has been attached already.');
            return;
        }

        this.log.debug('Subject: Attached an observer.', observer);
        this.observers.push(observer);
    }

    public detach(observer: DataObserver<T>): void {
        const observerIndex = this.observers.indexOf(observer);
        if (observerIndex === -1) {
            this.log.warn('Subject: Nonexistent observer.');
            return;
        }

        this.observers = this.observers.splice(observerIndex, 1);
        this.log.debug('Subject: Detached an observer.', observer);
    }

    /**
     * Trigger an update in each subscriber.
     */
    public notify() {
        this.log.debug('Subject: Notifying observers...', this._state);
        for (const observer of this.observers) {
            observer.update(this);
        }
    }
}

export class DataListSubject<T> implements ListSubject {
    /**
     * @type {number} For the sake of simplicity, the Subject's state, essential
     * to all subscribers, is stored in this variable.
     */
    private _state: T[] = [];

    /**
     * @type {Observer[]} List of subscribers. In real life, the list of
     * subscribers can be stored more comprehensively (categorized by event
     * type, etc.).
     */
    private observers: DataListObserver<T>[] = [];

    private log = LoggerManager.create(`Observer:ListDataSubject`);

    constructor(value: T[] = []) {
        this._state = value;
    }

    set data(value: T[]) {
        this._state = value;
        this.notify();
    }

    get data() {
        return this._state;
    }

    get length() {
        return this._state.length;
    }

    public clear(){
        this.data = [];
    }

    public last() {
        return (this._state.length > 0)? this._state[this._state.length-1] : undefined;
    }

    public get(index: number) {
        return this._state[index];
    }
    

    public find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined {
        return this._state.find(predicate, thisArg);
    }
    public findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number {
        return this._state.findIndex(predicate, thisArg);
    }

    public let(index: number, lets: (value: T, index: number) => T | undefined) {
        if (index >= 0 && index < this._state.length && this._state[index] !== undefined) {
            let new_item = lets(this._state[index], index);
            //this.log.debug('let', {index, new_item, state: this._state});

            if (new_item !== undefined) {
                this._state[index] = new_item;
                this.notifyItem(new_item, index);
            } else {
                let old_item = this._state[index];
                this._state.splice(index, 1);
                this.notifyRemovedItem(old_item);
            }
        }
    }
    
    public lets(lets: (value: T, index: number) => T | undefined) {
        if (this._state.length > 0) {
            this._state = this._state
                .map((it, index) => lets(it, index))
                .filter(it => it !== undefined) as T[];
            //this.log.debug('lets', {state: this._state});
            this.notify();
        }
    }
    
    public forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any) {
        this._state.forEach(callbackfn, thisArg);
    }

    public set(index: number, value: T) {
        if (index >= 0 && index < this._state.length) {
            this._state[index] = value;
            this.notifyItem(value, index);
        }
    }

    public push(value: T) {
        this._state.push(value);
        this.notifyAddedItem(this._state[this._state.length-1]);
    }
    
    public remove(index: number) {
        if (index >= 0 && index < this._state.length) {
            const item = this._state[index];
            this._state.splice(index, 1);
            this.notifyRemovedItem(item);
        }
    }

    /**
     * The subscription management methods.
     */
    public attach(observer: DataListObserver<T>): void {
        const isExist = this.observers.includes(observer);
        if (isExist) {
            this.log.warn('Subject: Observer has been attached already.');
            return;
        }

        this.log.debug('Subject: Attached an observer.', observer);
        this.observers.push(observer);
    }

    public detach(observer: DataListObserver<T>): void {
        const observerIndex = this.observers.indexOf(observer);
        if (observerIndex === -1) {
            this.log.warn('Subject: Nonexistent observer.');
            return;
        }

        this.observers = this.observers.splice(observerIndex, 1);
        this.log.debug('Subject: Detached an observer.', observer);
    }


    /**
     * Trigger an update in each subscriber.
     */
    public notify() {
        this.log.debug('Subject: Notifying observers...', this._state);
        for (const observer of this.observers) {
            observer.update(this);
        }
    }
    
    /**
     * Trigger an update in each subscriber.
     */
    public notifyItem(item: T, index: number) {
        this.log.debug('Subject: Notifying observers, Item...', this._state, index);
        for (const observer of this.observers) {
            observer.updateItem(this, item, index);
        }
    }

    public notifyAddedItem(added: T) {
        this.log.debug('Subject: Notifying observers, AddedItem...', this._state, added);
        for (const observer of this.observers) {
            observer.updateAddedItem(this, added);
        }
    }
    
    public notifyRemovedItem(removed: T) {
        this.log.debug('Subject: Notifying observers, RemovedItem...', this._state, removed);
        for (const observer of this.observers) {
            observer.updateRemovedItem(this, removed);
        }
    }
}
