import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeekerComponent } from './peeker.component';

describe('PeekerComponent', () => {
  let component: PeekerComponent;
  let fixture: ComponentFixture<PeekerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeekerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeekerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
