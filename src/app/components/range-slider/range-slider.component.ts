import { Component, Output, EventEmitter, Input, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface RangeValue {
  min: number;
  max: number;
}

@Component({
  selector: "app-range-slider",
  imports: [CommonModule],
  templateUrl: "./range-slider.component.html",
  styleUrl: "./range-slider.component.scss",
})
export class RangeSliderComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() min: number = 2019;
  @Input() max: number = 2024;
  @Input() initialMin: number = 2019;
  @Input() initialMax: number = 2024;

  @Output() valueChange = new EventEmitter<RangeValue>();

  @ViewChild('timelineContainer') timelineContainer!: ElementRef;

  currentValue: RangeValue = {
    min: this.initialMin,
    max: this.initialMax,
  };

  private isDragging = false;
  private dragType: 'min' | 'max' | 'range' = 'min';
  private dragStartX = 0;
  private dragStartValue: RangeValue = { min: 0, max: 0 };
  private lastEmittedValue: RangeValue = { min: 0, max: 0 };

  ngOnInit() {
    this.currentValue = {
      min: this.initialMin,
      max: this.initialMax,
    };
    this.lastEmittedValue = { ...this.currentValue };
  }

  ngAfterViewInit() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
  }

  getAllYears(): number[] {
    const years = [];
    for (let year = this.min; year <= this.max; year++) {
      years.push(year);
    }
    return years;
  }

  getYearPosition(year: number): number {
    // Add padding offset to keep labels within container bounds
    const paddingOffset = 2; // 2% padding on each side
    const availableWidth = 100 - (paddingOffset * 2);
    const position = ((year - this.min) / (this.max - this.min)) * availableWidth;
    return paddingOffset + position;
  }

  getRangeStartPosition(): number {
    const paddingOffset = 3;
    const availableWidth = 100 - (paddingOffset * 2);
    const position = ((this.currentValue.min - this.min) / (this.max - this.min)) * availableWidth;
    return paddingOffset + position;
  }

  getRangeEndPosition(): number {
    const paddingOffset = 3;
    const availableWidth = 100 - (paddingOffset * 2);
    const position = ((this.currentValue.max - this.min) / (this.max - this.min)) * availableWidth;
    return paddingOffset + position;
  }

  getRangeWidth(): number {
    return this.getRangeEndPosition() - this.getRangeStartPosition();
  }

  isYearInRange(year: number): boolean {
    return year >= this.currentValue.min && year <= this.currentValue.max;
  }

  formatYearLabel(year: number): string {
    return `'${year.toString().slice(-2)}`;
  }

  // Navigation Methods
  shiftRangeLeft() {
    if (this.canShiftLeft()) {
      const rangeSize = this.currentValue.max - this.currentValue.min;
      this.currentValue = {
        min: this.currentValue.min - 1,
        max: this.currentValue.max - 1
      };
      this.emitChange();
    }
  }

  shiftRangeRight() {
    if (this.canShiftRight()) {
      const rangeSize = this.currentValue.max - this.currentValue.min;
      this.currentValue = {
        min: this.currentValue.min + 1,
        max: this.currentValue.max + 1
      };
      this.emitChange();
    }
  }

  canShiftLeft(): boolean {
    return this.currentValue.min > this.min;
  }

  canShiftRight(): boolean {
    return this.currentValue.max < this.max;
  }

  // Drag Methods
  onBoundaryMouseDown(event: MouseEvent, type: 'min' | 'max') {
    event.preventDefault();
    this.isDragging = true;
    this.dragType = type;
    this.dragStartX = event.clientX;
    this.dragStartValue = { ...this.currentValue };
  }

  onRangeMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.isDragging = true;
    this.dragType = 'range';
    this.dragStartX = event.clientX;
    this.dragStartValue = { ...this.currentValue };
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const rect = this.timelineContainer.nativeElement.getBoundingClientRect();
    const deltaX = event.clientX - this.dragStartX;
    const deltaPercentage = (deltaX / rect.width) * 100;
    const deltaValue = (deltaPercentage / 100) * (this.max - this.min);

    let newValue = { ...this.currentValue };

    if (this.dragType === 'min') {
      newValue.min = Math.max(
        this.min, 
        Math.min(this.dragStartValue.min + deltaValue, this.currentValue.max - 1)
      );
    } else if (this.dragType === 'max') {
      newValue.max = Math.min(
        this.max, 
        Math.max(this.dragStartValue.max + deltaValue, this.currentValue.min + 1)
      );
    } else if (this.dragType === 'range') {
      // Move entire range while maintaining the same size
      const rangeSize = this.dragStartValue.max - this.dragStartValue.min;
      const newMin = this.dragStartValue.min + deltaValue;
      const newMax = this.dragStartValue.max + deltaValue;
      
      if (newMin >= this.min && newMax <= this.max) {
        newValue.min = newMin;
        newValue.max = newMax;
      } else if (newMin < this.min) {
        newValue.min = this.min;
        newValue.max = this.min + rangeSize;
      } else if (newMax > this.max) {
        newValue.max = this.max;
        newValue.min = this.max - rangeSize;
      }
    }

    // Round to nearest integer (year)
    newValue.min = Math.round(newValue.min);
    newValue.max = Math.round(newValue.max);

    this.currentValue = newValue;
  }

  onMouseUp(event: MouseEvent) {
    if (this.isDragging) {
      this.isDragging = false;
      if (this.hasValueChanged()) {
        this.emitChange();
      }
    }
  }

  private hasValueChanged(): boolean {
    return this.lastEmittedValue.min !== this.currentValue.min || 
           this.lastEmittedValue.max !== this.currentValue.max;
  }

  private emitChange() {
    this.lastEmittedValue = { ...this.currentValue };
    this.valueChange.emit({ ...this.currentValue });
  }

  getPercentage(value: number): number {
    return ((value - this.min) / (this.max - this.min)) * 100;
  }
}
