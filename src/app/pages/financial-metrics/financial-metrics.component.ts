import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CriteriaComponent } from "../../components/criteria/criteria.component";
import { ApiService } from "../../services/api.service";
@Component({
  selector: "app-financial-metrics",
  imports: [CommonModule, RouterLink, FormsModule, CriteriaComponent],
  templateUrl: "./financial-metrics.component.html",
  styleUrl: "./financial-metrics.component.scss",
})
export class FinancialMetricsComponent {
  selectedFinancialMetrics: string[] = [];

  finalCount: number = 0;
  selectedRevenue: { min?: number; max?: number } = {};
  selectedEbitda: { min?: number; max?: number } = {};
  selectedNetIncome: { min?: number; max?: number } = {};
  selectedEnterpriseValue: { min?: number; max?: number } = {};
  selectedFiscalPeriod: { min?: number; max?: number } = {};

  constructor(private apiService: ApiService) {}

  onValueChange(event: any, type: "min" | "max", level: number) {
    const value = event.target.value ? Number(event.target.value) : null;

    if (value) {
      if (level === 0) {
        if (type === "min") {
          this.selectedRevenue.min = value;
        } else if (type === "max") {
          this.selectedRevenue.max = value;
        }
        this.selectedFinancialMetrics.push("Revenue");
      } else if (level === 1) {
        if (type === "min") {
          this.selectedEbitda.min = value;
        } else if (type === "max") {
          this.selectedEbitda.max = value;
        }
        this.selectedFinancialMetrics.push("EBITDA");
      } else if (level === 2) {
        if (type === "min") {
          this.selectedNetIncome.min = value;
        } else if (type === "max") {
          this.selectedNetIncome.max = value;
        }
        this.selectedFinancialMetrics.push("Net Income");
      } else if (level === 3) {
        if (type === "min") {
          this.selectedEnterpriseValue.min = value;
        } else if (type === "max") {
          this.selectedEnterpriseValue.max = value;
        }
        this.selectedFinancialMetrics.push("Enterprise Value");
      } else if (level === 4) {
        if (type === "min") {
          this.selectedFiscalPeriod.min = value;
        } else if (type === "max") {
          this.selectedFiscalPeriod.max = value;
        }
        this.selectedFinancialMetrics.push("Fiscal Period");
      }
    }

    this.displayCounts(level);
  }

  displayCounts(level?: number): void {
    let payload: any = {};

    if (level === 0) {
      if (this.selectedRevenue) {
        payload.total_revenue_latest_fiscal_year_000_1 = this.selectedRevenue;
      }
    }
    if (level === 1) {
      if (this.selectedEbitda) {
        payload.ebitda_latest_fiscal_year_000_1 = this.selectedEbitda;
      }
    }
    if (level === 2) {
      if (this.selectedNetIncome) {
        payload.net_income_latest_fiscal_year_000_1 = this.selectedNetIncome;
      }
    }
    if (level === 3) {
      if (this.selectedEnterpriseValue) {
        payload.total_enterprise_value_ciq_m_2 = this.selectedEnterpriseValue;
      }
    }
    if (level === 4) {
      if (this.selectedFiscalPeriod) {
        payload.period_ended_latest_fiscal_year_mm_dd_yyyy_1 =
          this.selectedFiscalPeriod;
      }
    }

    console.log("Final Payload:", payload);
    console.log("Final:");

    if (Object.keys(payload).length === 0) {
      this.finalCount = 0;
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
