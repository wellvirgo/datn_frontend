import { TuiDay } from "@taiga-ui/cdk";

export class DateUtils {
  public static convertToString(date: TuiDay): string {
    if (!date) return '';
    const year = date.year;
    const month = (date.month + 1).toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public static convertToTuiDay(dateString: string): TuiDay {
    if (!dateString) return TuiDay.currentLocal();
    const [year, month, day] = dateString.split('-').map(Number);
    return new TuiDay(year, month - 1, day);
  }


  public static getDaysDifference(start: TuiDay, end: TuiDay): number {
    const startDate = start.toUtcNativeDate().getTime();
    const endDate = end.toUtcNativeDate().getTime();

    const diffInMs = Math.abs(endDate - startDate);

    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays;
  }
}
