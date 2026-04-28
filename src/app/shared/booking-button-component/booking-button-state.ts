import { Injectable, signal, Signal } from "@angular/core";
import { DateUtils } from "../../core/common/date-utils";
import { TuiDay } from "@taiga-ui/cdk";

@Injectable({ providedIn: 'root' })
export class BookingButtonState {
    public checkInDate = signal<string>(DateUtils.convertToString(TuiDay.currentLocal()));
    public checkOutDate = signal<string>(DateUtils.convertToString(TuiDay.currentLocal().append({ day: 1 })));

}