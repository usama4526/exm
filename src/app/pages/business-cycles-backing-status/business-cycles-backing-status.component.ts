import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";


import { ApiService } from "../../services/api.service";
interface CheckboxItem {
  name: string;
  checked: boolean;
}

interface CompanyGroup {
  name: string; // e.g. "Company Type" or "Company Status"
  data: CheckboxItem[];
}
@Component({
  selector: "app-business-cycles-backing-status",
  imports: [CommonModule, FormsModule],
  templateUrl: "./business-cycles-backing-status.component.html",
  styleUrl: "./business-cycles-backing-status.component.scss",
})
export class BusinessCyclesBackingStatusComponent implements OnChanges {
  @Output() companyTypeChange = new EventEmitter<{ COMPANY_TYPE: string[] }>();
  // …and another for status
  @Output() companyStatusChange = new EventEmitter<{
    COMPANY_STATUS: string[];
  }>();

  @Input() clearCompanySelection!: boolean;
  @Output() onClearCompanySelection = new EventEmitter<any>();
  constructor(private apiService: ApiService) {}

  companyTypeStatusData: CompanyGroup[] = [
    {
      name: "Company Type",
      data: [
        {
          name: "Public",
          checked: false,
        },
        {
          name: "Private",
          checked: false,
        },
      ],
    },
    {
      name: "Company Status",
      data: [
        {
          name: "Acquired",
          checked: false,
        },
        {
          name: "Liquidating",
          checked: false,
        },
        {
          name: "Operating",
          checked: false,
        },
        {
          name: "Operating Subsidiary",
          checked: false,
        },
        {
          name: "Reorganizing",
          checked: false,
        },
      ],
    },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (this.clearCompanySelection == true) {
      for (const type of this.companyTypeStatusData) {
        for (const data of type.data) {
          data.checked = false;
        }
      }
      this.onClearCompanySelection.emit(false);
      this.clearCompanySelection = false;
    }
  }

  onCheckboxChange() {
    // Build and emit COMPANY_TYPE
    const typeGroup = this.companyTypeStatusData.find(
      (g) => g.name === "Company Type"
    )!;
    const types = typeGroup.data.filter((i) => i.checked).map((i) => i.name);
    this.companyTypeChange.emit({ COMPANY_TYPE: types });

    // Build and emit COMPANY_STATUS
    const statusGroup = this.companyTypeStatusData.find(
      (g) => g.name === "Company Status"
    )!;
    const statuses = statusGroup.data
      .filter((i) => i.checked)
      .map((i) => i.name);
    this.companyStatusChange.emit({ COMPANY_STATUS: statuses });
  }
}
