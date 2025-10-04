import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockPriceAndDateComponent } from './stock-price-and-date.component';

describe('StockPriceAndDateComponent', () => {
  let component: StockPriceAndDateComponent;
  let fixture: ComponentFixture<StockPriceAndDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockPriceAndDateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockPriceAndDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
