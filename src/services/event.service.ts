import { Observable, Subject } from "rxjs";
import { Humidity } from "src/data/humidity.schema";
import { Settings } from "src/data/settings.schema";
import { Temperature } from "src/data/temperature.schema";

export interface ConfigEventData {
    objectType: "config";
    object: Settings;
}
export interface TemperatureEventData {
    objectType: "temperature";
    object: Temperature;
}
export interface HumidityEventData {
    objectType: "humidity";
    object: Humidity;
}
export interface ObjectEvent {
    eventType: "object";
    eventName: "updated" | "created" | "deleted";
    data: TemperatureEventData | HumidityEventData | ConfigEventData;
}

export type Event = ObjectEvent;

export class EventService {

    private eventStream: Subject<Event> = new Subject();
    public get events$(): Observable<Event> {
        return this.eventStream.pipe();
    }

    public emit(ev: Event): void {
        this.eventStream.next(ev);
    }
}