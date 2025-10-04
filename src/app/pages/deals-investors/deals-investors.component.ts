import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CriteriaComponent } from "../../components/criteria/criteria.component";
import { ApiService } from "../../services/api.service";
@Component({
  selector: "app-deals-investors",
  imports: [CommonModule, RouterLink, FormsModule, CriteriaComponent],
  templateUrl: "./deals-investors.component.html",
  styleUrl: "./deals-investors.component.scss",
})
export class DealsInvestorsComponent {
  dealCount: number = 0;
  selectedLastRoundType: string[] = [];
  selectedLatestRoundType: string[] = [];
  selectedLatestRoundNumber: string[] = [];

  selectedLatestRoundOfferingSize: { min?: number; max?: number } = {};
  selectedPreMoneyValuation: { min?: number; max?: number } = {};
  selectedPostMoneyValuation: { min?: number; max?: number } = {};
  selectedTotalAmountRaised: { min?: number; max?: number } = {};

  selectedDealDate: string[] = [];

  constructor(private apiService: ApiService) {}

  onInvestmentStageChange(event: any, level: number) {
    const selectedValue = event.target.value;
    console.log("Selected Investment Stage:", selectedValue);

    if (selectedValue) {
      if (level === 0) {
        this.selectedLastRoundType.push(selectedValue);
      } else if (level === 1) {
        this.selectedLatestRoundType.push(selectedValue);
      } else if (level === 2) {
        this.selectedLatestRoundNumber.push(selectedValue);
      }
    }

    //     else {
    //       // If unchecked, remove from correct array
    //       if (level === 0) {
    //         this.selectedLastRoundType = this.selectedLastRoundType.filter(name => name !== selectedValue);
    //       } else if (level === 1) {
    //         this.selectedLatestRoundType = this.selectedLatestRoundType.filter(name => name !== selectedValue);
    //       } else if (level === 2) {
    //         this.selectedLatestRoundNumber = this.selectedLatestRoundNumber.filter(name => name !== selectedValue);
    //       }
    // }

    this.displayCounts(level);
  }

  onValueChange(event: any, type: "min" | "max", level: number) {
    const value = event.target.value ? Number(event.target.value) : null;

    if (value) {
      if (level === 3) {
        if (type === "min") {
          this.selectedPreMoneyValuation.min = value;
        } else if (type === "max") {
          this.selectedPreMoneyValuation.max = value;
        }
      } else if (level === 4) {
        if (type === "min") {
          this.selectedPostMoneyValuation.min = value;
        } else if (type === "max") {
          this.selectedPostMoneyValuation.max = value;
        }
      } else if (level === 5) {
        if (type === "min") {
          this.selectedTotalAmountRaised.min = value;
        } else if (type === "max") {
          this.selectedTotalAmountRaised.max = value;
        }
      } else if (level === 6) {
        // this.selectedDealDate.push(value);
      }
    }

    // else {
    //   // If unchecked, remove from correct array
    //   if (level === 3) {
    //     this.selectedPreMoneyValuation = this.selectedPreMoneyValuation.filter(name => name !== value);
    //   }  else if (level === 4) {
    //     this.selectedPostMoneyValuation = this.selectedPostMoneyValuation.filter(name => name !== value);
    //   }  else if (level === 5) {
    //     this.selectedTotalAmountRaised = this.selectedTotalAmountRaised.filter(name => name !== value);
    //   }  else if (level === 6) {
    //     // this.selectedDealDate = this.selectedDealDate.filter(name => name !== item.name);
    //   }
    // }

    this.displayCounts(level);
  }

  displayCounts(level?: number): void {
    let payload: any = {};

    if (level === 0) {
      if (this.selectedLastRoundType.length > 0) {
        payload.last_round_type = this.selectedLastRoundType;
      }
    }
    if (level === 1) {
      if (this.selectedLatestRoundType.length > 0) {
        payload.latest_round_type = this.selectedLatestRoundType;
      }
    }
    if (level === 2) {
      if (this.selectedLatestRoundNumber.length > 0) {
        payload.latest_round_number = this.selectedLatestRoundNumber;
      }
    }
    if (level === 3) {
      if (this.selectedLatestRoundOfferingSize) {
        payload.latest_round_offering_size =
          this.selectedLatestRoundOfferingSize;
      }
    }
    if (level === 4) {
      if (this.selectedPreMoneyValuation) {
        payload.pre_money_valuation = this.selectedPreMoneyValuation;
      }
    }
    if (level === 5) {
      if (this.selectedPostMoneyValuation) {
        payload.post_money_valuation = this.selectedPostMoneyValuation;
      }
    }
    if (level === 6) {
      if (this.selectedTotalAmountRaised) {
        payload.total_amount_raised = this.selectedTotalAmountRaised;
      }
    }
    if (level === 7) {
      if (this.selectedLatestRoundType.length > 0) {
        payload.gics_group = this.selectedLatestRoundType;
      }
    }

    console.log("Final Payload:", payload);
    console.log("Final:");

    if (Object.keys(payload).length === 0) {
      this.dealCount = 0;
      payload = {};
      // alert("Please select at least one checkbox.");
      return;
    }
    this.sendCompanyTypeAndStatusPayloadToBackend(payload, level);
  }

  sendCompanyTypeAndStatusPayloadToBackend(
    payload: any,
    level?: number | undefined
  ): void {
    // const payload = { "gics_sector": ["Health care"] };
  }
}
