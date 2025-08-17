import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(v: string | null | undefined, len = 120) {
    if (!v) return '';
    return v.length > len ? v.slice(0, len) + '…' : v;
  }
}