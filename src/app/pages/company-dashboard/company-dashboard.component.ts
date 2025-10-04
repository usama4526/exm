import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { LabelType, Options } from "@angular-slider/ngx-slider";
import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CommonModule } from "@angular/common";
import { FormatNumberPipe } from "../../shared/pipes/number-format.pipe";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
@Component({
  standalone: true,
  selector: "app-company-dashboard",
  imports: [
    NgbModule,
    NgxSliderModule,
    CommonModule,
    FormatNumberPipe,
    SidebarComponent,
  ],
  templateUrl: "./company-dashboard.component.html",
  styleUrl: "./company-dashboard.component.scss",
})
export class CompanyDashboardComponent {
  constructor(
    private router: Router,
    private modalService: NgbModal,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}
  @ViewChild("filingContainer") filingContainer!: ElementRef;
  value: number = 2017;
  highValue: number = 2024;
  options: Options = {
    floor: 1995,
    ceil: 2024,
    step: 1,
    showTicks: true,
    showTicksValues: true,
    tickStep: 1,
    ticksArray: Array.from({ length: 2025 - 1995 + 1 }, (_, i) => 1995 + i),
    translate: (value: number, label: LabelType): string => {
      if (label === LabelType.Low || label === LabelType.High) {
        return `'${value.toString()}`;
      }
      return "";
    },
    animate: true,
    ticksTooltip: (val: number): string => `Year: ${val}`,
  };
  definationList = [
    {
      term: "Total Revenue",
      definition:
        "Total Revenue is income arising in the course of an entity\u2019s ordinary activities and is referred to by a variety of names including sales, fees, interest, dividends, royalties, and rent. (see FASB, ASC 606-10-20)",
      citation: "See  ASC 606-10-20",
      full_defination:
        "Total Revenue is income arising in the course of an entity\u2019s ordinary activities and is referred to by a variety of names including sales, fees, interest, dividends, royalties, and rent. (see FASB, ASC 606-10-20) (See  ASC 606-10-20)",
      tab: "key_highlights",
      term_key: "total_revenue",
    },
    {
      term: "Gross Profit",
      definition:
        "Gross Profit is the excess of revenues from sales of goods and services over the related cost of goods sold or cost of sales.",
      citation: "See  Regulation S-X Rule 5-03(b)",
      full_defination:
        "Gross Profit is the excess of revenues from sales of goods and services over the related cost of goods sold or cost of sales. (See  Regulation S-X Rule 5-03(b))",
      tab: "key_highlights",
      term_key: "gross_profit",
    },
    {
      term: "Earnings from Cont. Ops.",
      definition:
        "Earnings from Continuing Operations is the net income of an entity excluding the results of discontinued operations and extraordinary items.",
      citation: "See  ASC 205-20-45 and SEC Regulation S-X",
      full_defination:
        "Earnings from Continuing Operations is the net income of an entity excluding the results of discontinued operations and extraordinary items. (See  ASC 205-20-45 and SEC Regulation S-X)",
      tab: "key_highlights",
      term_key: "earnings_from_cont_ops",
    },
    {
      term: "Net Income",
      definition:
        "Net Income is the excess of revenues and gains over expenses and losses for a reporting period, after accounting for income taxes and discontinued operations.",
      citation: "See  ASC 205-10-45",
      full_defination:
        "Net Income is the excess of revenues and gains over expenses and losses for a reporting period, after accounting for income taxes and discontinued operations. (See  ASC 205-10-45)",
      tab: "key_highlights",
      term_key: "net_income",
    },
    {
      term: "EBITDA",
      definition:
        "EBITDA is a non-GAAP financial measure that excludes interest, taxes, depreciation, and amortization from net income.",
      citation: "See SEC Regulation G \u2013 Non-GAAP Measures",
      full_defination:
        "EBITDA is a non-GAAP financial measure that excludes interest, taxes, depreciation, and amortization from net income. (See SEC Regulation G \u2013 Non-GAAP Measures)",
      tab: "key_highlights",
      term_key: "ebitda",
    },
    {
      term: "EBIT",
      definition:
        "EBIT is a non-GAAP financial measure representing earnings before deducting interest and tax expenses.",
      citation: "See SEC Regulation G \u2013 Non-GAAP Measures",
      full_defination:
        "EBIT is a non-GAAP financial measure representing earnings before deducting interest and tax expenses. (See SEC Regulation G \u2013 Non-GAAP Measures)",
      tab: "key_highlights",
      term_key: "ebit",
    },
    {
      term: "Cash & Cash equivalents",
      definition:
        "Cash and cash equivalents include currency on hand, demand deposits, and short-term, highly liquid investments readily convertible to known amounts of cash.",
      citation: "See  ASC 305-10-20",
      full_defination:
        "Cash and cash equivalents include currency on hand, demand deposits, and short-term, highly liquid investments readily convertible to known amounts of cash. (See  ASC 305-10-20)",
      tab: "key_highlights",
      term_key: "cash_&_cash_equivalents",
    },
    {
      term: "Net Property, Plant & Equipment",
      definition:
        "Net Property, Plant & Equipment represents the gross investment in property, plant, and equipment, less accumulated depreciation.",
      citation: "See  ASC 360-10-35",
      full_defination:
        "Net Property, Plant & Equipment represents the gross investment in property, plant, and equipment, less accumulated depreciation. (See  ASC 360-10-35)",
      tab: "key_highlights",
      term_key: "net_property_plant_&_equipment",
    },
    {
      term: "Total Assets",
      definition:
        "Total Assets are all assets owned by an entity, including current and non-current assets, as reported on the balance sheet.",
      citation: "See  ASC 210-10",
      full_defination:
        "Total Assets are all assets owned by an entity, including current and non-current assets, as reported on the balance sheet. (See  ASC 210-10)",
      tab: "key_highlights",
      term_key: "total_assets",
    },
    {
      term: "Total Debt",
      definition:
        "Total Debt includes all short-term and long-term interest-bearing liabilities.",
      citation: "See SEC Regulation S-X Article 5",
      full_defination:
        "Total Debt includes all short-term and long-term interest-bearing liabilities. (See SEC Regulation S-X Article 5)",
      tab: "key_highlights",
      term_key: "total_debt",
    },
    {
      term: "Total Common Equity",
      definition:
        "Total Common Equity represents ownership interest held by common shareholders, including common stock, additional paid-in capital, and retained earnings.",
      citation: "See  ASC 505-10",
      full_defination:
        "Total Common Equity represents ownership interest held by common shareholders, including common stock, additional paid-in capital, and retained earnings. (See  ASC 505-10)",
      tab: "key_highlights",
      term_key: "total_common_equity",
    },
    {
      term: "Total Preferred Equity",
      definition:
        "Total Preferred Equity represents ownership interest held by preferred shareholders, with claims senior to common equity.",
      citation: "See  ASC 505-10",
      full_defination:
        "Total Preferred Equity represents ownership interest held by preferred shareholders, with claims senior to common equity. (See  ASC 505-10)",
      tab: "key_highlights",
      term_key: "total_preferred_equity",
    },
    {
      term: "Total Equity",
      definition:
        "Total Equity is the residual interest in the assets of an entity that remains after deducting liabilities.",
      citation: "See  ASC 505-10",
      full_defination:
        "Total Equity is the residual interest in the assets of an entity that remains after deducting liabilities. (See  ASC 505-10)",
      tab: "key_highlights",
      term_key: "total_equity",
    },
    {
      term: "Cash from Ops.",
      definition:
        "Cash from Operations is the net cash inflow or outflow from operational activities during a reporting period.",
      citation: "See  ASC 230-10-45",
      full_defination:
        "Cash from Operations is the net cash inflow or outflow from operational activities during a reporting period. (See  ASC 230-10-45)",
      tab: "key_highlights",
      term_key: "cash_from_ops",
    },
    {
      term: "Cash from Investing",
      definition:
        "Cash from Investing is the cash flows associated with the acquisition and disposal of long-term assets and other investments.",
      citation: "See  ASC 230-10-45",
      full_defination:
        "Cash from Investing is the cash flows associated with the acquisition and disposal of long-term assets and other investments. (See  ASC 230-10-45)",
      tab: "key_highlights",
      term_key: "cash_from_investing",
    },
    {
      term: "Cash from Financing",
      definition:
        "Cash from Financing includes cash flows related to borrowing and repaying debt, issuing equity, and paying dividends.",
      citation: "See  ASC 230-10-45",
      full_defination:
        "Cash from Financing includes cash flows related to borrowing and repaying debt, issuing equity, and paying dividends. (See  ASC 230-10-45)",
      tab: "key_highlights",
      term_key: "cash_from_financing",
    },
    {
      term: "Net Change in Cash",
      definition:
        "Net Change in Cash is the sum of net cash from operating, investing, and financing activities.",
      citation: "See  ASC 230-10-45",
      full_defination:
        "Net Change in Cash is the sum of net cash from operating, investing, and financing activities. (See  ASC 230-10-45)",
      tab: "key_highlights",
      term_key: "net_change_in_cash",
    },
    {
      term: "Capital Expenditure",
      definition:
        "Capital Expenditure is the amount spent to acquire or improve long-term assets such as property, plant, or equipment.",
      citation: "See  ASC 360-10",
      full_defination:
        "Capital Expenditure is the amount spent to acquire or improve long-term assets such as property, plant, or equipment. (See  ASC 360-10)",
      tab: "key_highlights",
      term_key: "capital_expenditure",
    },
    {
      term: "Change in Net Working Capital",
      definition:
        "Change in Net Working Capital represents the difference in current assets minus current liabilities over a period.",
      citation: "Derived from  ASC 210-10",
      full_defination:
        "Change in Net Working Capital represents the difference in current assets minus current liabilities over a period. (Derived from  ASC 210-10)",
      tab: "key_highlights",
      term_key: "change_in_net_working_capital",
    },
    {
      term: "Basic EPS Excl. Extra Items",
      definition:
        "Basic EPS Excl. Extra Items represents earnings per share excluding extraordinary items using weighted average common shares outstanding.",
      citation: "See  ASC 260-10-45",
      full_defination:
        "Basic EPS Excl. Extra Items represents earnings per share excluding extraordinary items using weighted average common shares outstanding. (See  ASC 260-10-45)",
      tab: "key_highlights",
      term_key: "basic_eps_excl_extra_items",
    },
    {
      term: "Basic EPS",
      definition:
        "Basic EPS represents earnings per share based on net income and weighted average shares outstanding.",
      citation: "See  ASC 260-10-45",
      full_defination:
        "Basic EPS represents earnings per share based on net income and weighted average shares outstanding. (See  ASC 260-10-45)",
      tab: "key_highlights",
      term_key: "basic_eps",
    },
    {
      term: "Diluted EPS Excl. Extra Items",
      definition:
        "Diluted EPS Excl. Extra Items adjusts basic EPS for the effect of all dilutive potential common shares, excluding extraordinary items.",
      citation: "See  ASC 260-10-45",
      full_defination:
        "Diluted EPS Excl. Extra Items adjusts basic EPS for the effect of all dilutive potential common shares, excluding extraordinary items. (See  ASC 260-10-45)",
      tab: "key_highlights",
      term_key: "diluted_eps_excl_extra_items",
    },
    {
      term: "Diluted EPS Incl. Extra Items",
      definition:
        "Diluted EPS Incl. Extra Items adjusts EPS to reflect the potential dilution from convertible securities, options, and warrants.",
      citation: "See  ASC 260-10-45",
      full_defination:
        "Diluted EPS Incl. Extra Items adjusts EPS to reflect the potential dilution from convertible securities, options, and warrants. (See  ASC 260-10-45)",
      tab: "key_highlights",
      term_key: "diluted_eps_incl_extra_items",
    },
    {
      term: "Weighted Avg. Basic Shares Out. (actual)",
      definition:
        "Weighted Average Basic Shares Outstanding represents the average number of common shares outstanding during a period used for computing basic EPS.",
      citation: "See  ASC 260-10-45",
      full_defination:
        "Weighted Average Basic Shares Outstanding represents the average number of common shares outstanding during a period used for computing basic EPS. (See  ASC 260-10-45)",
      tab: "key_highlights",
      term_key: "weighted_avg_basic_shares_out",
    },
    {
      term: "Weighted Avg. Diluted Shares Out. (actual)",
      definition:
        "Weighted Average Diluted Shares Outstanding includes all potentially dilutive shares in the weighted average shares calculation.",
      citation: "See ASC 260-10-45",
      full_defination:
        "Weighted Average Diluted Shares Outstanding includes all potentially dilutive shares in the weighted average shares calculation. (See ASC 260-10-45)",
      tab: "key_highlights",
      term_key: "weighted_avg_diluted_shares_out",
    },
    {
      term: "EBITDA / Interest Expense",
      definition:
        "EBITDA / Interest Expense is a financial ratio that indicates how many times a company can cover its interest expense with earnings before interest, taxes, depreciation, and amortization.",
      citation: "Derived from SEC filings and credit analysis",
      full_defination:
        "EBITDA / Interest Expense is a financial ratio that indicates how many times a company can cover its interest expense with earnings before interest, taxes, depreciation, and amortization. (Derived from SEC filings and credit analysis)",
      tab: "key_highlights",
      term_key: "ebitda_interest_expense",
    },
    {
      term: "EBIT / Interest Expense",
      definition:
        "EBIT / Interest Expense measures a company's ability to pay interest using operating earnings.",
      citation: "Derived from SEC filings and credit analysis",
      full_defination:
        "EBIT / Interest Expense measures a company's ability to pay interest using operating earnings. (Derived from SEC filings and credit analysis)",
      tab: "key_highlights",
      term_key: "ebit_interest_expense",
    },
    {
      term: "Avg. Days Sales Out.",
      definition:
        "Average Days Sales Outstanding (DSO) measures the average number of days it takes a company to collect payment after a sale.",
      citation: "Derived from  ASC 310-10",
      full_defination:
        "Average Days Sales Outstanding (DSO) measures the average number of days it takes a company to collect payment after a sale. (Derived from  ASC 310-10)",
      tab: "key_highlights",
      term_key: "avg_days_sales_out",
    },
    {
      term: "Avg. Days Inventory Out.",
      definition:
        "Average Days Inventory Outstanding measures how long a company holds inventory before selling it.",
      citation: "Derived from  ASC 330-10",
      full_defination:
        "Average Days Inventory Outstanding measures how long a company holds inventory before selling it. (Derived from  ASC 330-10)",
      tab: "key_highlights",
      term_key: "avg_days_inventory_out",
    },
    {
      term: "Accounts Receivable Turnover",
      definition:
        "Accounts Receivable Turnover indicates how many times a company collects its average accounts receivable balance during a period.",
      citation: "Derived from  ASC 310-10",
      full_defination:
        "Accounts Receivable Turnover indicates how many times a company collects its average accounts receivable balance during a period. (Derived from  ASC 310-10)",
      tab: "key_highlights",
      term_key: "accounts_receivable_turnover",
    },
    {
      term: "Inventory Turnover",
      definition:
        "Inventory Turnover measures how many times inventory is sold and replaced during a period.",
      citation: "Derived from  ASC 330-10",
      full_defination:
        "Inventory Turnover measures how many times inventory is sold and replaced during a period. (Derived from  ASC 330-10)",
      tab: "key_highlights",
      term_key: "inventory_turnover",
    },
    {
      term: "Fixed Asset Turnover",
      definition:
        "Fixed Asset Turnover measures how efficiently a company uses its fixed assets to generate revenue.",
      citation: "Derived from  ASC 360-10",
      full_defination:
        "Fixed Asset Turnover measures how efficiently a company uses its fixed assets to generate revenue. (Derived from  ASC 360-10)",
      tab: "key_highlights",
      term_key: "fixed_asset_turnover",
    },
    {
      term: "Total Asset Turnover",
      definition:
        "Total Asset Turnover measures how efficiently a company uses its total assets to generate sales.",
      citation: "Derived from  ASC 210-10",
      full_defination:
        "Total Asset Turnover measures how efficiently a company uses its total assets to generate sales. (Derived from  ASC 210-10)",
      tab: "key_highlights",
      term_key: "total_asset_turnover",
    },
    {
      term: "Cash & Short-term Investments",
      definition:
        "Cash & Short-term Investments includes cash, cash equivalents, and marketable securities expected to be liquidated within one year.",
      citation: "See  ASC 305-10",
      full_defination:
        "Cash & Short-term Investments includes cash, cash equivalents, and marketable securities expected to be liquidated within one year. (See  ASC 305-10)",
      tab: "key_highlights",
      term_key: "cash_and_short_term_investments",
    },
    {
      term: "Net Property, Plant & Equipment",
      definition:
        "Net Property, Plant & Equipment represents the gross investment in property, plant, and equipment, less accumulated depreciation.",
      citation: "See  ASC 360-10-35",
      full_defination:
        "Net Property, Plant & Equipment represents the gross investment in property, plant, and equipment, less accumulated depreciation. (See  ASC 360-10-35)",
      tab: "key_highlights",
      term_key: "net_property_plant_&_equipment",
    },
    {
      term: "Total Assets",
      definition:
        "Total Assets are all assets owned by an entity, including current and non-current assets, as reported on the balance sheet.",
      citation: "See  ASC 210-10",
      full_defination:
        "Total Assets are all assets owned by an entity, including current and non-current assets, as reported on the balance sheet. (See  ASC 210-10)",
      tab: "key_highlights",
      term_key: "total_assets",
    },
    {
      term: "Net Debt",
      definition:
        "Net Debt equals total debt minus cash and cash equivalents, representing the company\u2019s true leverage.",
      citation: "Derived from  ASC 470-10",
      full_defination:
        "Net Debt equals total debt minus cash and cash equivalents, representing the company\u2019s true leverage. (Derived from  ASC 470-10)",
      tab: "key_highlights",
      term_key: "net_debt",
    },
    {
      term: "Total Debt",
      definition:
        "Total Debt includes all short-term and long-term interest-bearing liabilities.",
      citation: "See SEC Regulation S-X Article 5",
      full_defination:
        "Total Debt includes all short-term and long-term interest-bearing liabilities. (See SEC Regulation S-X Article 5)",
      tab: "key_highlights",
      term_key: "total_debt",
    },
    {
      term: "Total Common Equity",
      definition:
        "Total Common Equity represents ownership interest held by common shareholders, including common stock, additional paid-in capital, and retained earnings.",
      citation: "See  ASC 505-10",
      full_defination:
        "Total Common Equity represents ownership interest held by common shareholders, including common stock, additional paid-in capital, and retained earnings. (See  ASC 505-10)",
      tab: "key_highlights",
      term_key: "total_common_equity",
    },
    {
      term: "Total Equity",
      definition:
        "Total Equity is the residual interest in the assets of an entity that remains after deducting liabilities.",
      citation: "See  ASC 505-10",
      full_defination:
        "Total Equity is the residual interest in the assets of an entity that remains after deducting liabilities. (See  ASC 505-10)",
      tab: "key_highlights",
      term_key: "total_equity",
    },
    {
      term: "Current Ratio",
      definition:
        "Current Ratio measures a company\u2019s ability to pay short-term obligations with current assets.",
      citation: "Derived from  ASC 210-10",
      full_defination:
        "Current Ratio measures a company\u2019s ability to pay short-term obligations with current assets. (Derived from  ASC 210-10)",
      tab: "key_highlights",
      term_key: "current_ratio",
    },
    {
      term: "Quick Ratio",
      definition:
        "Quick Ratio measures a company\u2019s ability to meet short-term obligations using its most liquid assets.",
      citation: "Derived from  ASC 210-10",
      full_defination:
        "Quick Ratio measures a company\u2019s ability to meet short-term obligations using its most liquid assets. (Derived from  ASC 210-10)",
      tab: "key_highlights",
      term_key: "quick_ratio",
    },
    {
      term: "Total Debt/Equity",
      definition:
        "Total Debt/Equity is a financial ratio comparing a company\u2019s total debt to its total equity.",
      citation:
        "Derived from SEC Regulation S-X and financial statement analysis",
      full_defination:
        "Total Debt/Equity is a financial ratio comparing a company\u2019s total debt to its total equity. (Derived from SEC Regulation S-X and financial statement analysis)",
      tab: "key_highlights",
      term_key: "total_debt_equity",
    },
    {
      term: "Total Debt / Total Capital (%)",
      definition:
        "Total Debt / Total Capital represents the proportion of debt in the company\u2019s capital structure.",
      citation: "Derived from SEC Regulation S-X",
      full_defination:
        "Total Debt / Total Capital represents the proportion of debt in the company\u2019s capital structure. (Derived from SEC Regulation S-X)",
      tab: "key_highlights",
      term_key: "total_debt_total_capital",
    },
    {
      term: "Total Debt / EBITDA",
      definition:
        "Total Debt / EBITDA is a leverage ratio comparing total debt to earnings before interest, taxes, depreciation, and amortization.",
      citation: "Derived from SEC Regulation G and credit analysis",
      full_defination:
        "Total Debt / EBITDA is a leverage ratio comparing total debt to earnings before interest, taxes, depreciation, and amortization. (Derived from SEC Regulation G and credit analysis)",
      tab: "key_highlights",
      term_key: "total_debt_ebitda",
    },
    {
      term: "Unlevered Free Cash Flow",
      definition:
        "Unlevered Free Cash Flow is the cash flow before interest payments, representing cash available to all investors.",
      citation: "Derived from  ASC 230-10",
      full_defination:
        "Unlevered Free Cash Flow is the cash flow before interest payments, representing cash available to all investors. (Derived from  ASC 230-10)",
      tab: "key_highlights",
      term_key: "unlevered_free_cash_flow",
    },
    {
      term: "Levered Free Cash Flow",
      definition:
        "Levered Free Cash Flow is the cash remaining after paying interest and operating expenses, available to equity holders.",
      citation: "Derived from  ASC 230-10",
      full_defination:
        "Levered Free Cash Flow is the cash remaining after paying interest and operating expenses, available to equity holders. (Derived from  ASC 230-10)",
      tab: "key_highlights",
      term_key: "levered_free_cash_flow",
    },
    {
      term: "Return on Assets",
      definition:
        "Return on Assets measures net income relative to average total assets, indicating how efficiently assets generate profit.",
      citation: "Derived from  ASC 210-10",
      full_defination:
        "Return on Assets measures net income relative to average total assets, indicating how efficiently assets generate profit. (Derived from  ASC 210-10)",
      tab: "key_highlights",
      term_key: "return_on_assets",
    },
    {
      term: "Return on Capital",
      definition:
        "Return on Capital measures how effectively a company generates profits from its total capital employed.",
      citation: "Derived from financial statement analysis",
      full_defination:
        "Return on Capital measures how effectively a company generates profits from its total capital employed. (Derived from financial statement analysis)",
      tab: "key_highlights",
      term_key: "return_on_capital",
    },
    {
      term: "Return on Equity",
      definition:
        "Return on Equity measures net income as a percentage of total shareholders' equity.",
      citation: "Derived from  ASC 505-10",
      full_defination:
        "Return on Equity measures net income as a percentage of total shareholders' equity. (Derived from  ASC 505-10)",
      tab: "key_highlights",
      term_key: "return_on_equity",
    },
    {
      term: "Return on Common Equity",
      definition:
        "Return on Common Equity measures profitability relative to common shareholders' equity, excluding preferred equity.",
      citation: "Derived from  ASC 505-10",
      full_defination:
        "Return on Common Equity measures profitability relative to common shareholders' equity, excluding preferred equity. (Derived from  ASC 505-10)",
      tab: "key_highlights",
      term_key: "return_on_common_equity",
    },
    {
      term: "Gross Profit Margin",
      definition:
        "Gross Profit Margin represents gross profit as a percentage of revenue, indicating core production efficiency.",
      citation: "Derived from  Regulation S-X Rule 5-03(b)",
      full_defination:
        "Gross Profit Margin represents gross profit as a percentage of revenue, indicating core production efficiency. (Derived from  Regulation S-X Rule 5-03(b))",
      tab: "key_highlights",
      term_key: "gross_profit_margin",
    },
    {
      term: "Net Income Margin",
      definition:
        "Net Income Margin is net income expressed as a percentage of total revenue.",
      citation: "Derived from  ASC 205-10",
      full_defination:
        "Net Income Margin is net income expressed as a percentage of total revenue. (Derived from  ASC 205-10)",
      tab: "key_highlights",
      term_key: "net_income_margin",
    },
    {
      term: "EBITDA Margin",
      definition:
        "EBITDA Margin is EBITDA expressed as a percentage of total revenue.",
      citation: "Derived from SEC Regulation G",
      full_defination:
        "EBITDA Margin is EBITDA expressed as a percentage of total revenue. (Derived from SEC Regulation G)",
      tab: "key_highlights",
      term_key: "ebitda_margin",
    },
    {
      term: "EBIT Margin",
      definition:
        "EBIT Margin is EBIT expressed as a percentage of total revenue.",
      citation: "Derived from SEC Regulation G",
      full_defination:
        "EBIT Margin is EBIT expressed as a percentage of total revenue. (Derived from SEC Regulation G)",
      tab: "key_highlights",
      term_key: "ebit_margin",
    },
  ];
  popoverTitle: string = "";
  popoverContent: string = "";
  getPopoverContent(termKey: string) {
    const item = this.definationList.find((d) => d.term_key === termKey);
    if (!item) return null;

    return {
      title: item.term,
      content: item.full_defination,
    };
  }

  showPopover(
    termKey: string,
    table_label: string = "",
    row_label: string = ""
  ) {
    const data = this.getPopoverContent(termKey);
    this.popoverTitle = "";
    this.popoverContent = "";
    let title_extras = "";
    if (data) {
      if (table_label.indexOf("($000)") > -1) {
        title_extras = " ($000)";
      } else if (row_label.indexOf("(x)") > -1) {
        title_extras = " (x)";
      }
      this.popoverTitle = data.title + title_extras;
      this.popoverContent = data.content;
    }
  }
  financials = [
    {
      table_label: "Income Statement ($000)",
      headers: [
        { year: "2017 FY" },
        { year: "2018 FY" },
        { year: "2019 FY" },
        { year: "2020 FY" },
        { year: "2021 FY" },
        { year: "2022 FY" },
        { year: "2023 FY" },
        { year: "2024 FY" },
      ],
      data: [
        {
          row_head_label: "Total Revenue",
          row_head_key: "total_revenue",
          data: [
            55458888, 66458888, 96459888, 55458888, 22458888, 25458888,
            55458888, 96458888,
          ],
        },
        {
          row_head_label: "Gross Profit",
          row_head_key: "gross_profit",
          data: [
            25458888, 36458888, 36458888, 25458888, 36458888, 25458888,
            55458888, 96458888,
          ],
        },
        {
          row_head_label: "Earnings from Cont. Ops.",
          row_head_key: "earnings_from_cont_ops",
          data: [
            66458888, 66458888, 66458888, 66458888, 72458888, 25458888,
            66458888, 86458888,
          ],
        },
        {
          row_head_label: "Net Income",
          row_head_key: "net_income",
          data: [
            55458888, 66458888, 66458888, 66458888, 66458888, 66458888,
            66458888, 66458888,
          ],
        },
        {
          row_head_label: "EBITDA",
          row_head_key: "ebitda",
          data: [
            25458888, 36458888, 66458888, 25458888, 66458888, 96458888,
            66458888, 96458888,
          ],
        },
        {
          row_head_label: "EBIT",
          row_head_key: "ebit",
          data: [
            66458888, 66458888, 25458888, 1000000, 66458888, 66458888, 66458888,
            96458888,
          ],
        },
      ],
    },
    {
      table_label: "Balance Sheet ($000)",
      headers: [
        { year: "2017 FY" },
        { year: "2018 FY" },
        { year: "2019 FY" },
        { year: "2020 FY" },
        { year: "2021 FY" },
        { year: "2022 FY" },
        { year: "2023 FY" },
        { year: "2024 FY" },
      ],
      data: [
        {
          row_head_label: "Cash & Short-term Investments",
          row_head_key: "cash_and_short_term_investments",
          data: [
            25458888, 66458888, 96459888, 55458888, 22458888, 25458888,
            55458888, 96458888,
          ],
        },
        {
          row_head_label: "Net Property, Plant & Equipment",
          row_head_key: "net_property_plant_equipment",
          data: [
            25458888, 66458888, 96459888, 55458888, 22458888, 25458888,
            55458888, 96458888,
          ],
        },
        {
          row_head_label: "Total Assets",
          row_head_key: "total_assets",
          data: [
            66458888, 66458888, 66458888, 66458888, 66458888, 25458888,
            66458888, 96458888,
          ],
        },
        {
          row_head_label: "Net Debt",
          row_head_key: "net_debt",
          data: [
            25458888, 66458888, 66458888, 66458888, 66458888, 96458888,
            25458888, 96458888,
          ],
        },
        {
          row_head_label: "Total Debt",
          row_head_key: "total_debt",
          data: [
            25458888, 36458888, 66458888, 55458888, 66458888, 96458888,
            155458888, 96458888,
          ],
        },
        {
          row_head_label: "Total Common Equity",
          row_head_key: "total_common_equity",
          data: [
            66458888, 35458888, 25458888, 4000000, 66458888, 66458888, 66458888,
            96458888,
          ],
        },
        {
          row_head_label: "Total Equity",
          row_head_key: "total_equity",
          data: [
            25458888, 66458888, 66458888, 55458888, 66458888, 25458888,
            66458888, 96458888,
          ],
        },
      ],
    },
    {
      table_label: "Cash Flow ($000)",
      headers: [
        { year: "2017 FY" },
        { year: "2018 FY" },
        { year: "2019 FY" },
        { year: "2020 FY" },
        { year: "2021 FY" },
        { year: "2022 FY" },
        { year: "2023 FY" },
        { year: "2024 FY" },
      ],
      data: [
        {
          row_head_label: "Cash from Ops.",
          row_head_key: "cash_from_ops",
          data: [
            25458888, 66458888, 96459888, 55458888, 22458888, 25458888,
            55458888, 96458888,
          ],
        },
        {
          row_head_label: "Cash from Investing",
          row_head_key: "cash_from_investing",
          data: [
            25458888, 35458888, 36458888, 55458888, 22458888, 25458888,
            55458888, 96458888,
          ],
        },
        {
          row_head_label: "Cash from Financing",
          row_head_key: "cash_from_financing",
          data: [
            66458888, 66458888, 36458888, 66458888, 66458888, 25458888,
            66458888, 96458888,
          ],
        },
        {
          row_head_label: "Foreign Exchange Rate Adj.",
          row_head_key: "foreign_exchange_rate_adj",
          data: [
            25458888, 66458888, 15458888, 66458888, 155458888, 66458888,
            25458888, 25458888,
          ],
        },
        {
          row_head_label: "Net Change in Cash",
          row_head_key: "net_change_in_cash",
          data: [
            25458888, 66458888, 66458888, 66458888, 66458888, 96458888,
            25458888, 96458888,
          ],
        },
        {
          row_head_label: "Capital Expenditure",
          row_head_key: "capital_expenditure",
          data: [
            66458888, 66458888, 25458888, 1000000, 66458888, 66458888, 66458888,
            96458888,
          ],
        },
        {
          row_head_label: "Change in Net Working Capital",
          row_head_key: "change_in_net_working_capital",
          data: [
            25458888, 66458888, 96458888, 55458888, 66458888, 25458888,
            66458888, 96458888,
          ],
        },
      ],
    },
    {
      table_label: "Financial Ratios & Shares Info (%)",
      headers: [
        { year: "2017 FY" },
        { year: "2018 FY" },
        { year: "2019 FY" },
        { year: "2020 FY" },
        { year: "2021 FY" },
        { year: "2022 FY" },
        { year: "2023 FY" },
        { year: "2024 FY" },
      ],
      data: [
        {
          row_head_label: "Return on Assets",
          row_head_key: "return_on_assets",
          data: [
            25458888, 66458888, 96459888, 55458888, 22458888, 25458888,
            55458888, 96458888,
          ],
        },
        {
          row_head_label: "Return on Capital",
          row_head_key: "return_on_capital",
          data: [
            25458888, 66458888, 36458888, 66458888, 22458888, 66458888,
            55458888, 25458888,
          ],
        },
        {
          row_head_label: "Return on Equity",
          row_head_key: "return_on_equity",
          data: [
            25458888, 66458888, 36458888, 66458888, 66458888, 66458888,
            66458888, 96458888,
          ],
        },
        {
          row_head_label: "Return on Common Equity",
          row_head_key: "return_on_common_equity",
          data: [
            25458888, 66458888, 15458888, 66458888, 66458888, 66458888,
            55458888, 96458888,
          ],
        },
        {
          row_head_label: "Gross Profit Margin",
          row_head_key: "gross_profit_margin",
          data: [
            66458888, 66458888, 36458888, 66458888, 66458888, 96458888,
            66458888, 96458888,
          ],
        },
        {
          row_head_label: "Net Income Margin",
          row_head_key: "net_income_margin",
          data: [
            66458888, 66458888, 36458888, 1000000, 66458888, 96458888, 66458888,
            96458888,
          ],
        },
        {
          row_head_label: "EBITDA Margin",
          row_head_key: "ebitda_margin",
          data: [1.2, 32.5, 22.3, 66.5, 22.3, 22.3, 66.5, 22.3],
        },
        {
          row_head_label: "EBIT Margin",
          row_head_key: "ebit_margin",
          data: [0.8, 32.3, 66.5, 22.3, 22.3, 22.3, 32.5, 32.6],
        },
        {
          row_head_label: "EBITDA / Interest Expense (x)",
          row_head_key: "ebitda_interest_expense",
          data: [
            25458888, 66458888, 96458888, 55458888, 66458888, 25458888,
            66458888, 25458888,
          ],
        },
        {
          row_head_label: "EBIT / Interest Expense (x)",
          row_head_key: "ebit_interest_expense",
          data: [66.5, 66.5, 22.3, 66.5, 22.3, 22.3, 66.5, 22.3],
        },
        {
          row_head_label: "Avg. Days Sales Out.",
          row_head_key: "avg_days_sales_out",
          data: [0.8, 22.3, 66.5, 22.3, 22.3, 22.0, 25.5, 22.5],
        },
        {
          row_head_label: "Avg. Days Inventory Out.",
          row_head_key: "avg_days_inventory_out",
          data: [1.2, 22.3, 22.3, 22.3, 22.3, 22.5, 66.5, 66.5],
        },
        {
          row_head_label: "Accounts Receivable Turnover (x)",
          row_head_key: "accounts_receivable_turnover",
          data: [2.5, 85.5, 22.3, 22.3, 22.3, 22.3, 32.5, 22.3],
        },
        {
          row_head_label: "Inventory Turnover (x)",
          row_head_key: "inventory_turnover",
          data: [1.2, 66.4, 66.5, 66.5, 22.3, 22.3, 22.3, 22.3],
        },
        {
          row_head_label: "Fixed Asset Turnover (x)",
          row_head_key: "fixed_asset_turnover",
          data: [2.3, 66.5, 99.0, 32.3, 22.3, 22.3, 32.5, 22.3],
        },
        {
          row_head_label: "Total Asset Turnover (x)",
          row_head_key: "total_asset_turnover",
          data: [1.2, 66.4, 66.5, 66.5, 22.3, 22.3, 22.3, 22.3],
        },
        {
          row_head_label: "Current Ratio (x)",
          row_head_key: "current_ratio",
          data: [1.2, 32.5, 66.5, 66.5, 22.3, 22.3, 66.5, 22.3],
        },
        {
          row_head_label: "Quick Ratio (x)",
          row_head_key: "quick_ratio",
          data: [0.6, 22.3, 66.5, 22.3, 22.3, 22.3, 32.5, 22.5],
        },
        {
          row_head_label: "Total Debt/Equity (x)",
          row_head_key: "total_debt_equity",
          data: [1.2, 32.3, 66.5, 22.3, 22.3, 32.5, 66.5, 66.5],
        },
        {
          row_head_label: "Total Debt / Total Capital (%)",
          row_head_key: "total_debt_total_capital",
          data: [2.3, 66.5, 22.3, 22.3, 22.3, 22.3, 32.5, 22.3],
        },
        {
          row_head_label: "Total Debt / EBITDA (x)",
          row_head_key: "total_debt_ebitda",
          data: [1.2, 66.4, 66.5, 66.5, 32.6, 22.3, 22.3, 22.3],
        },
        {
          row_head_label: "Unlevered Free Cash Flow",
          row_head_key: "unlevered_free_cash_flow",
          data: [1.2, 32.5, 66.5, 66.5, 22.3, 22.3, 66.5, 22.3],
        },
        {
          row_head_label: "Levered Free Cash Flow",
          row_head_key: "levered_free_cash_flow",
          data: [1.2, 22.3, 66.5, 22.3, 22.3, 22.3, 32.5, 66.5],
        },
        {
          row_head_label: "Basic EPS",
          row_head_key: "basic_eps",
          data: [
            25458888, 66458888, 35458888, 36458888, 25458888, 25458888,
            35458888, 96458888,
          ],
        },
        {
          row_head_label: "Diluted EPS Excl. Extra Items",
          row_head_key: "diluted_eps_excl_extra_items",
          data: [
            66458888, 66458888, 66458888, 66458888, 66458888, 25458888,
            66458888, 86458888,
          ],
        },
        {
          row_head_label: "Diluted EPS Incl. Extra Items",
          row_head_key: "diluted_eps_incl_extra_items",
          data: [
            66458888, 66458888, 66458888, 66458888, 66458888, 25458888,
            66458888, 86458888,
          ],
        },
        {
          row_head_label: "Weighted Avg. Basic Shares Out. (actual)",
          row_head_key: "weighted_avg_basic_shares_out",
          data: [
            25458888, 25458888, 66458888, 25458888, 66458888, 96458888,
            125458888, 96458888,
          ],
        },
        {
          row_head_label: "Weighted Avg. Diluted Shares Out. (actual)",
          row_head_key: "weighted_avg_diluted_shares_out",
          data: [
            66458888, 66458888, 25458888, 1000000, 66458888, 66458888, 66458888,
            96458888,
          ],
        },
      ],
    },
  ];
  getRouterURL() {
    return this.router.url;
  }
  navigate(url: string) {
    this.router.navigate([url]);
  }
  modelRef: any;
  secDocUrl!: SafeResourceUrl;
  rawHtml: any;
  @ViewChild("docViewer", { static: false })
  docViewer!: ElementRef<HTMLIFrameElement>;
  openCapIQPopup(popupRef: any, r: any) {
    this.http
      .get("assets/10k-file.htm", { responseType: "text" })
      .subscribe((html) => {
        this.modelRef = this.modalService.open(popupRef, { size: "xl" });
        setTimeout(() => {
          this.loadDocument(html, popupRef);
        }, 200);
      });
  }
  loadDocument(html: string, popupRef: any) {
    const iframe = this.docViewer.nativeElement;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        const target = doc.querySelector(
          '[name="us-gaap:CashAndCashEquivalentsAtCarryingValue"][contextref="c-13"]'
        );
        if (target) {
          (target as HTMLElement).style.backgroundColor = "yellow";
          (target as HTMLElement).style.transition =
            "background-color 0.5s ease";
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          console.warn("Target element not found.");
        }
      }, 100);
    }
  }
}
