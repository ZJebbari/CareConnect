import { animate, state, style, transition, trigger } from '@angular/animations';

export const CC_UI = {
  SPINNER_DIAMETTER:48,
  PAGINATOR_OPTIONS: [20, 50, 100, 200, 500, 1000, 2000, 20000],
  DEFAULT_PAGINATION_OPTION: 20,
  
  /* Animation for expansion panel to slide in and slide out upon dom generation using *if.
  Use [@expansionPanelSlide] on your expansion panel in html. */
  EXPANSION_PANEL_SLIDE_ANIMATION: trigger('expansionPanelSlide', [
  transition(':enter', [
    style({ height: '0px', minHeight: '0', overflow: 'hidden' }),
    animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ height: '*' })),
  ]),
  transition(':leave', [
    style({ height: '*', minHeight: '*', overflow: 'hidden' }),
    animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ height: '0px', minHeight: '0' })),
  ]),
]),

/* Animation for chevron to spin upon expansion panel opening.
Use [@chevron]="isExpanded ? 'expanded' : 'collapsed'" on your mat-icon. */
CHEVRON_ANIMATION:trigger('chevron', [
  state('collapsed', style({})),
  state('expanded', style({ transform: 'rotate(180deg)' })),
  transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
])
};
