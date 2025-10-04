import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-exchange-criteria",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./exchange-criteria.component.html",
  styleUrl: "./exchange-criteria.component.scss",
})
export class ExchangeCriteriaComponent implements OnChanges {
  @Input() clearSelection: boolean = false;
  @Input() selectedValues: string[] = [];
  @Output() onClearSelection = new EventEmitter<boolean>();
  @Output() exchangeSelected = new EventEmitter<string[]>();

  // Provided exchange values
  readonly exchanges: string[] = [
    "ADX","AIM","ARCA","ASE","ASX","ATSE","BASE","BATS","BELEX","BIT","BME","BMV","BNV","BOS","BOVESPA","BSE","BSSE","BST","BUL","BUSE","BVB","BVC","BVL","BVMT","CASE","Catalist","CBSE","CNSX","COSE","CPSE","CSE","DB","DSE","DSM","DUSE","DZASE","ENXTAM","ENXTBR","ENXTLS","ENXTPA","GHSE","HLSE","HMSE","HNX","HOSE","IBSE","IDX","IRTSE","ISE","JMSE","JSE","KASE","KLSE","KOSDAQ","KOSE","KWSE","LJSE","LSE","ME","MISX","MUN","MUSE","NASDAQCM","NASDAQGM","NASDAQGS","NEOE","NGM","NGSE","NSE","NSEI","NSX","NYSE","NYSEAM","NZSE","OB","OFEX","OM","OTC","OTCBB","OTCEM","OTCNO","OTCPK","OTCQB","OTCQX","PLSE","PSE","PSGM","SASE","SEHK","SET","SGX","SHSE","SNSE","SPSE","SWX","SZSE","TASE","TLSE","TPEX","TSE","TSX","TSXV","TTSE","TWSE","UGSE","WBAG","WSE","XKON","XSAT","XTRA","ZGSE"
  ];

  selected: Set<string> = new Set<string>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["selectedValues"]) {
      this.selected = new Set(this.selectedValues || []);
    }
    if (changes["clearSelection"] && this.clearSelection) {
      this.selected.clear();
      this.emitSelection();
      this.onClearSelection.emit(false);
    }
  }

  toggleExchange(value: string, checked: boolean) {
    if (checked) this.selected.add(value);
    else this.selected.delete(value);
    this.emitSelection();
  }

  selectAll(checked: boolean) {
    if (checked) {
      this.exchanges.forEach((e) => this.selected.add(e));
    } else {
      this.selected.clear();
    }
    this.emitSelection();
  }

  isChecked(value: string): boolean {
    return this.selected.has(value);
  }

  clearAll() {
    this.selected.clear();
    this.emitSelection();
    this.onClearSelection.emit(true);
  }

  private emitSelection() {
    this.exchangeSelected.emit(Array.from(this.selected));
  }
}

