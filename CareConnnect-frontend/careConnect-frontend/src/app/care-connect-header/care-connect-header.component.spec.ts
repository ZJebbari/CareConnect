import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareConnectHeaderComponent } from './care-connect-header.component';

describe('CareConnectHeaderComponent', () => {
  let component: CareConnectHeaderComponent;
  let fixture: ComponentFixture<CareConnectHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CareConnectHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CareConnectHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
