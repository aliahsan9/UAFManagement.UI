import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [DecimalPipe, Icon, RouterLink],
  template: `<article class="stat-card" [attr.data-tone]="tone()">
    <div class="stat-card__top">
      <span class="stat-card__icon"><app-icon [name]="icon()" [size]="18"/></span>
      @if (spark(); as spark) {
        <svg class="stat-card__spark" viewBox="0 0 88 36" aria-hidden="true">
          <path [attr.d]="spark.area" />
          <path class="stat-card__spark-line" [attr.d]="spark.line" />
        </svg>
      }
    </div>
    <p class="stat-card__label">{{ label() }}</p>
    @if (loading()) { <span class="skeleton skeleton--value"></span> }
    @else if (value() === null || value() === undefined) { <strong class="stat-card__value is-muted">—</strong> }
    @else { <strong class="stat-card__value">{{ value() | number }}</strong> }
    <p class="stat-card__caption">{{ caption() }}</p>
    @if (link()) { <a class="stat-card__hit" [routerLink]="link()" [attr.aria-label]="'Open ' + label()"></a> }
  </article>`
})
export class StatCard {
  readonly label = input.required<string>();
  readonly icon = input.required<string>();
  readonly tone = input('blue');
  readonly value = input<number | null>(null);
  readonly caption = input('');
  readonly loading = input(false);
  readonly link = input<string | null>(null);
  readonly points = input<number[] | null>(null);
  readonly spark = computed(() => {
    const values = this.points();
    if (!values || values.length < 2) return null;
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const span = Math.max(max - min, 1);
    const coords = values.map((value, index) => {
      const x = (index / (values.length - 1)) * 88;
      const y = 30 - ((value - min) / span) * 22;
      return { x, y };
    });
    const line = coords.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
    const last = coords[coords.length - 1];
    const first = coords[0];
    return { line, area: `${line} L${last.x.toFixed(1)} 34 L${first.x.toFixed(1)} 34 Z` };
  });
}
