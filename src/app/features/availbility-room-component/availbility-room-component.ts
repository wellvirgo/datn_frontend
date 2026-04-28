import { CurrencyPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TuiDataList, tuiItemsHandlersProvider, TuiTextfield, TuiTextfieldDropdownDirective } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiSelect, TuiChevron } from '@taiga-ui/kit';
import { AvailabilityRoomTypeRes, CancellationPolicy, RoomTypeBookingInfo } from '../../core/dto/room-type';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-availbility-room-component',
  imports: [TuiTextfield, TuiSelect, TuiDataListWrapper, TuiDataList, TuiChevron, ReactiveFormsModule, FormsModule, TuiTextfieldDropdownDirective, CurrencyPipe],
  templateUrl: './availbility-room-component.html',
  styleUrl: './availbility-room-component.css',
  providers: [
    tuiItemsHandlersProvider({
      stringify: signal((item: number | string) => {
        if (typeof item === 'string') {
          return item;
        }
        return String(item) + ' phòng';
      }),
    })
  ],
})
export class AvailbilityRoomComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private destroyDef = inject(DestroyRef);

  protected showExtraPeople = signal(false);

  protected form = this.fb.group({
    price: [0],
    peopleQuantity: [0],
    roomQuantity: [0],
    extraAdult: ['0 người lớn'],
    extraChild: ['0 trẻ em'],
  });

  protected showAllAmenities = signal(false);
  protected roomQuantities = computed(() => Array.from({ length: this.roomType().availableRoomQuantity + 1 }, (_, i) => i));

  roomType = input.required<AvailabilityRoomTypeRes>();
  cancellationPolicy = input.required<CancellationPolicy | null>();
  protected roomQuantityChange = output<RoomTypeBookingInfo>();

  private extraAdultValue = toSignal(this.form.controls.extraAdult.valueChanges, { initialValue: this.form.controls.extraAdult.value });
  private extraChildValue = toSignal(this.form.controls.extraChild.valueChanges, { initialValue: this.form.controls.extraChild.value });

  private extraAdultParsed = computed(() => {
    const val = this.extraAdultValue() || '0';
    return parseInt(val, 10);
  });

  private extraChildParsed = computed(() => {
    const val = this.extraChildValue() || '0';
    return parseInt(val, 10);
  });

  protected maxExtraAdultsAllowed = computed(() => {
    const room = this.roomType();
    return Math.max(0, room.maxAdults - room.baseAdults);
  });

  protected maxExtraChildrenAllowed = computed(() => {
    const room = this.roomType();
    return Math.max(0, room.maxChildren);
  });

  protected extraAdultOptions = computed(() => {
    const room = this.roomType();
    const extraChild = this.extraChildParsed();
    const maxBasedOnOccupancy = room.maxOccupancy - room.baseAdults - extraChild;
    const maxAllowed = Math.min(this.maxExtraAdultsAllowed(), maxBasedOnOccupancy);
    return Array.from({ length: Math.max(0, maxAllowed + 1) }, (_, i) => `${i} người lớn`);
  });

  protected extraChildOptions = computed(() => {
    const room = this.roomType();
    const extraAdult = this.extraAdultParsed();
    const maxBasedOnOccupancy = room.maxOccupancy - room.baseAdults - extraAdult;
    const maxAllowed = Math.min(this.maxExtraChildrenAllowed(), maxBasedOnOccupancy);
    return Array.from({ length: Math.max(0, maxAllowed + 1) }, (_, i) => `${i} trẻ em`);
  });

  ngOnInit(): void {
    this.form.patchValue({
      price: this.roomType().price,
      peopleQuantity: this.roomType().baseAdults,
      roomQuantity: 0,
    });

    this.form.controls.roomQuantity.valueChanges
      .pipe(takeUntilDestroyed(this.destroyDef))
      .subscribe(() => this.emitRoomQuantityChange());

    this.form.controls.extraAdult.valueChanges
      .pipe(takeUntilDestroyed(this.destroyDef))
      .subscribe(() => {
        const extraAdult = this.extraAdultParsed();
        const extraChild = this.extraChildParsed();
        const room = this.roomType();
        if (room.baseAdults + extraAdult + extraChild > room.maxOccupancy) {
          const maxAllowedChild = room.maxOccupancy - room.baseAdults - extraAdult;
          this.form.controls.extraChild.setValue(`${maxAllowedChild} trẻ em`);
          return;
        }
        this.emitRoomQuantityChange();
      });

    this.form.controls.extraChild.valueChanges
      .pipe(takeUntilDestroyed(this.destroyDef))
      .subscribe(() => {
        const extraChild = this.extraChildParsed();
        const extraAdult = this.extraAdultParsed();
        const room = this.roomType();
        if (room.baseAdults + extraAdult + extraChild > room.maxOccupancy) {
          const maxAllowedAdult = room.maxOccupancy - room.baseAdults - extraChild;
          this.form.controls.extraAdult.setValue(`${maxAllowedAdult} người lớn`);
          return;
        }
        this.emitRoomQuantityChange();
      });
  }

  protected toggleAmenities() {
    this.showAllAmenities.update(value => !value);
  }

  protected toggleExtraPeople() {
    this.showExtraPeople.update(value => !value);
  }

  private emitRoomQuantityChange() {
    const extraAdult = this.extraAdultParsed();
    const extraChild = this.extraChildParsed();
    const roomQuantity = this.form.controls.roomQuantity.value || 0;

    const bookingInfo: RoomTypeBookingInfo = {
      roomTypeId: this.roomType().id,
      adultsPerRoom: this.roomType().baseAdults + extraAdult,
      childrenPerRoom: extraChild,
      roomQuantity: roomQuantity,
      price: this.form.controls.price.value || 0
    };
    this.roomQuantityChange.emit(bookingInfo);
  }
}
