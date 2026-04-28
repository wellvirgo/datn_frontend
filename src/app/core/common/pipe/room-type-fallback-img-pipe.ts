import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roomTypeFallbackImg',
  standalone: true
})
export class RoomTypeFallbackImgPipe implements PipeTransform {

  transform(value: string | null | undefined, fallback: string = 'https://placehold.co/600x400'): string {
    return value ?? fallback;
  }

}
