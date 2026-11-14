import {Component,computed,input} from '@angular/core';
type BadgeTone='success'|'danger'|'warning'|'info'|'secondary'|'primary';
@Component({selector:'app-status-badge',standalone:true,template:`<span class="badge rounded-pill" [class.text-bg-success]="tone()==='success'" [class.text-bg-danger]="tone()==='danger'" [class.text-bg-warning]="tone()==='warning'" [class.text-bg-info]="tone()==='info'" [class.text-bg-primary]="tone()==='primary'" [class.text-bg-secondary]="tone()==='secondary'">{{label()}}</span>`})
export class StatusBadge {
 readonly status=input<string|null|undefined>(undefined);readonly active=input<boolean|undefined>(undefined);readonly labelOverride=input<string|undefined>(undefined);
 readonly label=computed(()=>this.labelOverride()??(this.status()?.trim()||((this.active()??true)?'Active':'Inactive')));
 readonly tone=computed<BadgeTone>(()=>{const s=(this.status()??'').toLowerCase();if(this.active()===false||/rejected|failed|cancelled|canceled|withdrawn|inactive|suspended|expired|unhealthy|unreachable|down|critical/.test(s))return 'danger';if(/pending|review|draft|warning|degraded|on.?hold|in.?progress/.test(s))return 'warning';if(/approved|active|completed|finalized|paid|verified|published|success|graduated|accepted/.test(s))return 'success';if(/submitted|processing|scheduled/.test(s))return 'info';return 'secondary';});
}
