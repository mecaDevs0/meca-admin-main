import { dateToString } from '@functions/date.function';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { dateNowToSeconds } from '@functions/date.function';
import moment from 'moment';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
})
export class DatePickerComponent implements OnInit {
  @Input()
  monthDaySelected!: number;

  @Input()
  monthDaysInfo: number[] = [];

  @Input()
  daysEnable: number[] = [];

  @Output()
  monthDaySelectedChanged: EventEmitter<{
    monthDaySelected: number;
    dayOfTheWeek: number;
  }> = new EventEmitter();

  // Definindo a data e hora de hoje com hora zerada
  dateTimeToday = moment().startOf('day');

  // Definindo a data e hora atual
  dateTime: any = moment();

  monthDays: number[] = [];

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.monthDays = [];
    const localMonthWeekDayFirst = this.dateTime
      .startOf('month')
      .get('weekday');

    for (let i = 0; i < localMonthWeekDayFirst; i++) {
      this.monthDays.push();
    }

    if (!this.dateTime.daysInMonth) {
      return;
    }

    for (let i = 0; i < this.dateTime.daysInMonth(); i++) {
      const date = moment().set({
        year: this.dateTime.year(),
        month: this.dateTime.month(), // moment months are 0-indexed
        date: i + 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });

      this.monthDays.push(date.valueOf());
    }
  }

  previousMonth(): void {
    this.dateTime = this.dateTime.set({
      month: this.dateTime.get('month') - 1,
    });
    this.init();
  }

  nextMonth(): void {
    this.dateTime = this.dateTime.set({
      month: this.dateTime.get('month') + 1,
    });
    this.init();
  }

  handleMonthDayClick(monthDay: number, index: number): void {
    this.monthDaySelected = monthDay;
    this.monthDaySelectedChanged.emit({
      monthDaySelected: this.monthDaySelected,
      dayOfTheWeek: this.handleDayOfTheWeek(index),
    });
  }

  isMonthDayInfo(day: number): boolean {
    return this.monthDaysInfo.find((item: number) => item === day)
      ? true
      : false;
  }

  handleDisabled(index: number, monthDate: string = '') {
    const days = this.daysEnable?.filter((value) => {
      if (value === 0) {
        return (
          index === 0 ||
          index === 7 ||
          index === 14 ||
          index === 21 ||
          index === 28 ||
          index === 35
        );
      }

      if (value === 1) {
        return (
          index === 1 ||
          index === 8 ||
          index === 15 ||
          index === 22 ||
          index === 29 ||
          index === 36
        );
      }

      if (value === 2) {
        return (
          index === 2 ||
          index === 9 ||
          index === 16 ||
          index === 23 ||
          index === 30 ||
          index === 37
        );
      }

      if (value === 3) {
        return (
          index === 3 ||
          index === 10 ||
          index === 17 ||
          index === 24 ||
          index === 31
        );
      }

      if (value === 4) {
        return (
          index === 4 ||
          index === 11 ||
          index === 18 ||
          index === 25 ||
          index === 32
        );
      }

      if (value === 5) {
        return (
          index === 5 ||
          index === 12 ||
          index === 19 ||
          index === 26 ||
          index === 33
        );
      }

      if (value === 6) {
        return (
          index === 6 ||
          index === 13 ||
          index === 20 ||
          index === 27 ||
          index === 34
        );
      }

      return 0;
    });

    const currentDate: string = dateToString(dateNowToSeconds()) || '';
    return monthDate >= currentDate && (days?.length ? days[0] : -1) >= 0
      ? true
      : false;
  }

  handleDayOfTheWeek(index: number) {
    if (
      index === 0 ||
      index === 7 ||
      index === 14 ||
      index === 21 ||
      index === 28 ||
      index === 35
    ) {
      return 0;
    }

    if (
      index === 1 ||
      index === 8 ||
      index === 15 ||
      index === 22 ||
      index === 29 ||
      index === 36
    ) {
      return 1;
    }

    if (
      index === 2 ||
      index === 9 ||
      index === 16 ||
      index === 23 ||
      index === 30 ||
      index === 37
    ) {
      return 2;
    }

    if (
      index === 3 ||
      index === 10 ||
      index === 17 ||
      index === 24 ||
      index === 31
    ) {
      return 3;
    }

    if (
      index === 4 ||
      index === 11 ||
      index === 18 ||
      index === 25 ||
      index === 32
    ) {
      return 4;
    }

    if (
      index === 5 ||
      index === 12 ||
      index === 19 ||
      index === 26 ||
      index === 33
    ) {
      return 5;
    }

    if (
      index === 6 ||
      index === 13 ||
      index === 20 ||
      index === 27 ||
      index === 34
    ) {
      return 6;
    }

    return 0;
  }
}
