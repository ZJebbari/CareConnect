import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PhysicianDetailsComponent } from './physician-details.component';

describe('PhysicianDetailsComponent', () => {
  let component: PhysicianDetailsComponent;
  let fixture: ComponentFixture<PhysicianDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, PhysicianDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
