import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { LabelType, Options } from "@angular-slider/ngx-slider";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
  inject,
} from "@angular/core";
import { NgbModule, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CommonModule } from "@angular/common";
import { FormatNumberPipe } from "../../shared/pipes/number-format.pipe";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { ApiService } from "../../services/api.service";
import {
  RangeSliderComponent,
  RangeValue,
} from "../../components/range-slider/range-slider.component";
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  standalone: true,
  selector: "app-balance-sheet",
  imports: [
    NgbModule,
    NgxSliderModule,
    CommonModule,
    FormatNumberPipe,
    RangeSliderComponent,
    SidebarComponent,
  ],
  templateUrl: "./balance-sheet.component.html",
  styleUrl: "./balance-sheet.component.scss",
})
export class BalanceSheetComponent implements OnInit {
  constructor(
    private router: Router,
    private http: HttpClient,
    private modalService: NgbModal
  ) {}
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
      term: "Assets ($000)",
      definition:
        "Assets represent economic resources controlled by an entity expected to provide future benefits, reported in thousands of dollars.",
      citation: "See ASC 210-10",
      full_defination:
        "Assets represent economic resources controlled by an entity expected to provide future benefits, reported in thousands of dollars. (See ASC 210-10)",
      tab: "key_highlights",
      term_key: "assets",
    },
    {
      term: "Cash and Cash Equivalents",
      definition:
        "Cash and Cash Equivalents include currency, bank deposits, and highly liquid investments with original maturities of three months or less.",
      citation: "See ASC 230-10-20",
      full_defination:
        "Cash and Cash Equivalents include currency, bank deposits, and highly liquid investments with original maturities of three months or less. (See ASC 230-10-20)",
      tab: "key_highlights",
      term_key: "cash_and_equivalents",
    },
    {
      term: "Short Term Investments",
      definition:
        "Short Term Investments are marketable securities and other investments expected to be converted to cash within one year or operating cycle.",
      citation: "See ASC 320-10",
      full_defination:
        "Short Term Investments are marketable securities and other investments expected to be converted to cash within one year or operating cycle. (See ASC 320-10)",
      tab: "key_highlights",
      term_key: "short_term_investments",
    },
    {
      term: "Accounts Receivable",
      definition:
        "Accounts Receivable are amounts due from customers for goods or services delivered or used but not yet paid for.",
      citation: "See ASC 310-10",
      full_defination:
        "Accounts Receivable are amounts due from customers for goods or services delivered or used but not yet paid for. (See ASC 310-10)",
      tab: "key_highlights",
      term_key: "accounts_receivable",
    },
    {
      term: "Inventory",
      definition:
        "Inventory consists of goods held for sale in the ordinary course of business or in production for such sale.",
      citation: "See ASC 330-10",
      full_defination:
        "Inventory consists of goods held for sale in the ordinary course of business or in production for such sale. (See ASC 330-10)",
      tab: "key_highlights",
      term_key: "inventories",
    },
    {
      term: "Prepaid Exp.",
      definition:
        "Prepaid Expenses represent payments made for goods or services to be received in future periods.",
      citation: "See ASC 340-10",
      full_defination:
        "Prepaid Expenses represent payments made for goods or services to be received in future periods. (See ASC 340-10)",
      tab: "key_highlights",
      term_key: "prepaid_exp",
    },
    {
      term: "Other Current Assets",
      definition:
        "Other Current Assets include all other assets expected to be realized or consumed within the operating cycle not classified elsewhere.",
      citation: "See ASC 210-10",
      full_defination:
        "Other Current Assets include all other assets expected to be realized or consumed within the operating cycle not classified elsewhere. (See ASC 210-10)",
      tab: "key_highlights",
      term_key: "other_current_assets",
    },
    {
      term: "Total Current Assets",
      definition:
        "Total Current Assets represent the sum of all assets expected to be converted to cash or used within one year or operating cycle.",
      citation: "See ASC 210-10",
      full_defination:
        "Total Current Assets represent the sum of all assets expected to be converted to cash or used within one year or operating cycle. (See ASC 210-10)",
      tab: "key_highlights",
      term_key: "total_current_assets",
    },
    {
      term: "Non Current Assets",
      definition:
        "Non-current (long-term) assets are assets that are not expected to be realized in cash, sold, or consumed within one year (or the normal operating cycle, if longer).",
      citation: "ASC 210-10-45-3",
      full_defination:
        "Non-current (long-term) assets are assets that are not expected to be realized in cash, sold, or consumed within one year (or the normal operating cycle, if longer). (See ASC 210-10-45-3)",
      tab: "key_highlights",
      term_key: "non_current_assets",
    },
    {
      term: "Gross Property, Plant & Equipment",
      definition:
        "Gross Property, Plant & Equipment is the total cost of all property, plant, and equipment before accumulated depreciation.",
      citation: "See ASC 360-10",
      full_defination:
        "Gross Property, Plant & Equipment is the total cost of all property, plant, and equipment before accumulated depreciation. (See ASC 360-10)",
      tab: "key_highlights",
      term_key: "gross_property_plant_equipment",
    },
    {
      term: "Accumulated Depreciation",
      definition:
        "Accumulated Depreciation is the total depreciation expense charged on property, plant, and equipment to date.",
      citation: "See ASC 360-10",
      full_defination:
        "Accumulated Depreciation is the total depreciation expense charged on property, plant, and equipment to date. (See ASC 360-10)",
      tab: "key_highlights",
      term_key: "accumulated_depreciation",
    },
    {
      term: "Net Property, Plant & Equipment",
      definition:
        "Net Property, Plant & Equipment equals gross property, plant, and equipment less accumulated depreciation.",
      citation: "See ASC 360-10",
      full_defination:
        "Net Property, Plant & Equipment equals gross property, plant, and equipment less accumulated depreciation. (See ASC 360-10)",
      tab: "key_highlights",
      term_key: "net_property_plant_equipment",
    },
    {
      term: "Long-term Investments",
      definition:
        "Long-term Investments are investments not intended to be liquidated within one year or operating cycle.",
      citation: "See ASC 320-10",
      full_defination:
        "Long-term Investments are investments not intended to be liquidated within one year or operating cycle. (See ASC 320-10)",
      tab: "key_highlights",
      term_key: "investments",
    },
    {
      term: "Property and equipment, net",
      definition:
        "Property and equipment, net represents the historical cost of tangible fixed assets (land, buildings, machinery, equipment, leasehold improvements, etc.) less accumulated depreciation, amortization, and impairment losses.",
      citation: "See ASC 360-10-35",
      full_defination:
        "Property and equipment, net represents the historical cost of tangible fixed assets (land, buildings, machinery, equipment, leasehold improvements, etc.) less accumulated depreciation, amortization, and impairment losses. (See ASC 360-10-35)",
      tab: "key_highlights",
      term_key: "investments",
    },
    {
      term: "Goodwill",
      definition:
        "Goodwill represents the excess of purchase price over fair value of net identifiable assets acquired in a business combination.",
      citation: "See ASC 350-20",
      full_defination:
        "Goodwill represents the excess of purchase price over fair value of net identifiable assets acquired in a business combination. (See ASC 350-20)",
      tab: "key_highlights",
      term_key: "goodwill",
    },
    {
      term: "Other Intangibles",
      definition:
        "Other Intangibles are non-physical assets such as patents, trademarks, and customer relationships, excluding goodwill.",
      citation: "See ASC 350-30",
      full_defination:
        "Other Intangibles are non-physical assets such as patents, trademarks, and customer relationships, excluding goodwill. (See ASC 350-30)",
      tab: "key_highlights",
      term_key: "other_intangibles",
    },
    {
      term: "Deferred Tax Assets, LT",
      definition:
        "Long-Term Deferred Tax Assets arise from temporary differences expected to reduce taxable income in future periods.",
      citation: "See ASC 740-10",
      full_defination:
        "Long-Term Deferred Tax Assets arise from temporary differences expected to reduce taxable income in future periods. (See ASC 740-10)",
      tab: "key_highlights",
      term_key: "deferred_tax_assets_lt",
    },
    {
      term: "Other Long-Term Assets",
      definition:
        "Other Long-Term Assets are assets not classified elsewhere and expected to provide benefits beyond one year.",
      citation: "See ASC 210-10",
      full_defination:
        "Other Long-Term Assets are assets not classified elsewhere and expected to provide benefits beyond one year. (See ASC 210-10)",
      tab: "key_highlights",
      term_key: "other_longterm_assets",
    },
    {
      term: "Total Assets",
      definition:
        "Total Assets represent the sum of all current and long-term assets owned by an entity.",
      citation: "See ASC 210-10",
      full_defination:
        "Total Assets represent the sum of all current and long-term assets owned by an entity. (See ASC 210-10)",
      tab: "key_highlights",
      term_key: "total_assets",
    },
    {
      term: "Liabilities ($000)",
      definition:
        "Liabilities represent obligations payable in the future, reported in thousands of dollars.",
      citation: "See ASC 210-10",
      full_defination:
        "Liabilities represent obligations payable in the future, reported in thousands of dollars. (See ASC 210-10)",
      tab: "key_highlights",
      term_key: "liabilities_000",
    },
    {
      term: "Accounts Payable",
      definition:
        "Accounts Payable are short-term obligations to suppliers for goods and services received.",
      citation: "See ASC 405-20",
      full_defination:
        "Accounts Payable are short-term obligations to suppliers for goods and services received. (See ASC 405-20)",
      tab: "key_highlights",
      term_key: "accounts_payable",
    },
    {
      term: "Accrued Exp.",
      definition:
        "Accrued Expenses are expenses incurred but not yet paid or recorded.",
      citation: "See ASC 450-20",
      full_defination:
        "Accrued Expenses are expenses incurred but not yet paid or recorded. (See ASC 450-20)",
      tab: "key_highlights",
      term_key: "accrued_exp",
    },
    {
      term: "Short-term Borrowings",
      definition:
        "Short-term Borrowings are debt obligations due within one year or operating cycle.",
      citation: "See ASC 470-10",
      full_defination:
        "Short-term Borrowings are debt obligations due within one year or operating cycle. (See ASC 470-10)",
      tab: "key_highlights",
      term_key: "short_term_borrowings",
    },
    {
      term: "Curr. Port. of LT Debt",
      definition:
        "Current Portion of Long-Term Debt is the amount of long-term debt due within the next year.",
      citation: "See ASC 470-10",
      full_defination:
        "Current Portion of Long-Term Debt is the amount of long-term debt due within the next year. (See ASC 470-10)",
      tab: "key_highlights",
      term_key: "curr_port_of_lt_debt",
    },
    {
      term: "Current Portion of Leases",
      definition:
        "Current Portion of Leases is lease liabilities due within one year.",
      citation: "See ASC 842-20",
      full_defination:
        "Current Portion of Leases is lease liabilities due within one year. (See ASC 842-20)",
      tab: "key_highlights",
      term_key: "current_portion_of_leases",
    },
    {
      term: "Curr. Income Taxes Payable",
      definition:
        "Current Income Taxes Payable are taxes owed to tax authorities within the next year.",
      citation: "See ASC 740-10",
      full_defination:
        "Current Income Taxes Payable are taxes owed to tax authorities within the next year. (See ASC 740-10)",
      tab: "key_highlights",
      term_key: "curr_income_taxes_payable",
    },
    {
      term: "Other Current Liabilities",
      definition:
        "Other Current Liabilities include all other short-term obligations not separately classified.",
      citation: "See ASC 210-10",
      full_defination:
        "Other Current Liabilities include all other short-term obligations not separately classified. (See ASC 210-10)",
      tab: "key_highlights",
      term_key: "other_current_liabilities",
    },
    {
      term: "Total Current Liabilities",
      definition:
        "Total Current Liabilities represent the sum of all liabilities due within one year or operating cycle.",
      citation: "See ASC 210-10",
      full_defination:
        "Total Current Liabilities represent the sum of all liabilities due within one year or operating cycle. (See ASC 210-10)",
      tab: "key_highlights",
      term_key: "total_current_liabilities",
    },
    {
      term: "Long-Term Debt",
      definition:
        "Long-Term Debt includes debt obligations payable beyond one year.",
      citation: "See ASC 470-10",
      full_defination:
        "Long-Term Debt includes debt obligations payable beyond one year. (See ASC 470-10)",
      tab: "key_highlights",
      term_key: "longterm_debt",
    },
    {
      term: "Long-term debt and finance lease obligations",
      definition:
        "Long-term debt comprises contractual borrowings with scheduled maturities beyond one year; finance lease obligations are lessee liabilities recognized for leases classified as finance leases.",
      citation: "See ASC 470-10-20; ASC 842-20-30-1",
      full_defination:
        "Long-term debt comprises contractual borrowings with scheduled maturities beyond one year; finance lease obligations are lessee liabilities recognized for leases classified as finance leases. (See ASC 470-10-20; ASC 842-20-30-1)",
      tab: "key_highlights",
      term_key: "long_term_debt_and_finance_lease_obligations",
    },
    {
      term: "Deferred income taxes",
      definition:
        "Deferred tax liabilities and assets arise from temporary differences between the book basis and tax basis of assets and liabilities, measured using enacted tax rates.",
      citation: "See ASC 740-10-25-2",
      full_defination:
        "Deferred tax liabilities and assets arise from temporary differences between the book basis and tax basis of assets and liabilities, measured using enacted tax rates. (See ASC 740-10-25-2)",
      tab: "key_highlights",
      term_key: "deferred_income_taxes",
    },
    {
      term: "Other long-term liabilities",
      definition:
        "Other long-term liabilities include obligations not separately presented that are due after one year, such as asset-retirement obligations, long-term compensation accruals, or contingent considerations.",
      citation: "See ASC 210-10-45-10",
      full_defination:
        "Other long-term liabilities include obligations not separately presented that are due after one year, such as asset-retirement obligations, long-term compensation accruals, or contingent considerations. (See ASC 210-10-45-10)",
      tab: "key_highlights",
      term_key: "other_long_term_liabilities",
    },
    {
      term: "Additional paid-in capital",
      definition:
        "Additional paid-in capital (APIC) represents the amount paid by shareholders for shares in excess of the par or stated value of the equity instruments issued.",
      citation: "See ASC 505-10-20",
      full_defination:
        "Additional paid-in capital (APIC) represents the amount paid by shareholders for shares in excess of the par or stated value of the equity instruments issued. (See ASC 505-10-20)",
      tab: "key_highlights",
      term_key: "additional_paid_in_capital",
    },
    {
      term: "Accumulated deficit",
      definition:
        "Accumulated deficit (or retained earnings deficit) is the cumulative net losses and dividends in excess of earnings since inception, reported as a negative component of retained earnings.",
      citation: "See ASC 505-10-15-3",
      full_defination:
        "Accumulated deficit (or retained earnings deficit) is the cumulative net losses and dividends in excess of earnings since inception, reported as a negative component of retained earnings. (See ASC 505-10-15-3)",
      tab: "key_highlights",
      term_key: "accumulated_deficit",
    },
    {
      term: "Accumulated other comprehensive loss",
      definition:
        "Accumulated other comprehensive loss (AOCL) is the cumulative net change in other comprehensive income items (e.g., foreign-currency translation, cash-flow hedges, pension adjustments) not yet reclassified into earnings.",
      citation: "See ASC 220-10-45-14",
      full_defination:
        "Accumulated other comprehensive loss (AOCL) is the cumulative net change in other comprehensive income items (e.g., foreign-currency translation, cash-flow hedges, pension adjustments) not yet reclassified into earnings. (See ASC 220-10-45-14)",
      tab: "key_highlights",
      term_key: "accumulated_other_comprehensive_loss",
    },
    {
      term: "Total stockholders' equity",
      definition:
        "Total stockholders’ (shareholders’) equity is the residual interest in the assets of an entity that remains after deducting liabilities; it includes share capital, APIC, retained earnings (or deficit), AOCL, and treasury stock.",
      citation: "See ASC 505-10-05-2",
      full_defination:
        "Total stockholders’ (shareholders’) equity is the residual interest in the assets of an entity that remains after deducting liabilities; it includes share capital, APIC, retained earnings (or deficit), AOCL, and treasury stock. (See ASC 505-10-05-2)",
      tab: "key_highlights",
      term_key: "total_stockholders__equity",
    },
    {
      term: "Noncontrolling interest",
      definition:
        "Noncontrolling interest is the portion of equity (net assets) in a subsidiary not attributable, directly or indirectly, to the parent entity.",
      citation: "See ASC 810-10-20",
      full_defination:
        "Noncontrolling interest is the portion of equity (net assets) in a subsidiary not attributable, directly or indirectly, to the parent entity. (See ASC 810-10-20)",
      tab: "key_highlights",
      term_key: "total_stockholders__equity",
    },
    {
      term: "Long-Term Leases",
      definition: "Long-Term Leases are lease obligations due after one year.",
      citation: "See ASC 842-20",
      full_defination:
        "Long-Term Leases are lease obligations due after one year. (See ASC 842-20)",
      tab: "key_highlights",
      term_key: "longterm_leases",
    },
    {
      term: "Pension & Other Post-Retire. Benefits",
      definition:
        "Pension and Other Post-Retirement Benefits are long-term liabilities related to employee benefits.",
      citation: "See ASC 715-30",
      full_defination:
        "Pension and Other Post-Retirement Benefits are long-term liabilities related to employee benefits. (See ASC 715-30)",
      tab: "key_highlights",
      term_key: "pension_other_postretire_benefits",
    },
    {
      term: "Def. Tax Liability, Non-Curr.",
      definition:
        "Non-Current Deferred Tax Liabilities represent taxes payable in future periods due to temporary differences.",
      citation: "See ASC 740-10",
      full_defination:
        "Non-Current Deferred Tax Liabilities represent taxes payable in future periods due to temporary differences. (See ASC 740-10)",
      tab: "key_highlights",
      term_key: "def_tax_liability_noncurr",
    },
    {
      term: "Other Non-Current Liabilities",
      definition:
        "Other Non-Current Liabilities are long-term obligations not classified elsewhere.",
      citation: "See ASC 210-10",
      full_defination:
        "Other Non-Current Liabilities are long-term obligations not classified elsewhere. (See ASC 210-10)",
      tab: "key_highlights",
      term_key: "other_noncurrent_liabilities",
    },
    {
      term: "Non-Current Liabilities",
      definition:
        "Non-current (long-term) liabilities are obligations that are not due within one year (or the operating cycle, if longer).",
      citation: "See ASC 210-10-45-4",
      full_defination:
        "Non-current (long-term) liabilities are obligations that are not due within one year (or the operating cycle, if longer). (See ASC 210-10-45-4)",
      tab: "key_highlights",
      term_key: "non_current_liabilities",
    },
    {
      term: "Total Liabilities",
      definition:
        "Total Liabilities represent the sum of current and long-term obligations of an entity.",
      citation: "See ASC 210-10",
      full_defination:
        "Total Liabilities represent the sum of current and long-term obligations of an entity. (See ASC 210-10)",
      tab: "key_highlights",
      term_key: "total_liabilities",
    },
    {
      term: "Equity ($000)",
      definition:
        "Equity represents residual interest in the assets of an entity after deducting liabilities, reported in thousands of dollars.",
      citation: "See ASC 505-10",
      full_defination:
        "Equity represents residual interest in the assets of an entity after deducting liabilities, reported in thousands of dollars. (See ASC 505-10)",
      tab: "key_highlights",
      term_key: "equity",
    },
    {
      term: "Common Stock",
      definition:
        "Common Stock is equity representing ownership interests with voting rights in a corporation.",
      citation: "See ASC 505-10",
      full_defination:
        "Common Stock is equity representing ownership interests with voting rights in a corporation. (See ASC 505-10)",
      tab: "key_highlights",
      term_key: "common_stock",
    },
    {
      term: "Retained Earnings",
      definition:
        "Retained Earnings are cumulative earnings retained and reinvested in the business, not distributed as dividends.",
      citation: "See ASC 505-10",
      full_defination:
        "Retained Earnings are cumulative earnings retained and reinvested in the business, not distributed as dividends. (See ASC 505-10)",
      tab: "key_highlights",
      term_key: "retained_earnings",
    },
    {
      term: "Treasury Stock",
      definition:
        "Treasury Stock is stock that the company has reacquired and holds in its treasury.",
      citation: "See ASC 505-10",
      full_defination:
        "Treasury Stock is stock that the company has reacquired and holds in its treasury. (See ASC 505-10)",
      tab: "key_highlights",
      term_key: "common_stock_held_in_treasury",
    },
    {
      term: "Comprehensive Inc. and Other",
      definition:
        "Comprehensive Income and Other includes items of income and expense not included in net income.",
      citation: "See ASC 220-10",
      full_defination:
        "Comprehensive Income and Other includes items of income and expense not included in net income. (See ASC 220-10)",
      tab: "key_highlights",
      term_key: "comprehensive_inc_and_other",
    },
    {
      term: "Total Common Equity",
      definition:
        "Total Common Equity is the sum of common stock, retained earnings, and other equity items related to common shareholders.",
      citation: "See ASC 505-10",
      full_defination:
        "Total Common Equity is the sum of common stock, retained earnings, and other equity items related to common shareholders. (See ASC 505-10)",
      tab: "key_highlights",
      term_key: "total_common_equity",
    },
    {
      term: "Total Minority Interest",
      definition:
        "Total Minority Interest represents the equity in subsidiaries not owned by the parent company.",
      citation: "See ASC 810-10",
      full_defination:
        "Total Minority Interest represents the equity in subsidiaries not owned by the parent company. (See ASC 810-10)",
      tab: "key_highlights",
      term_key: "total_minority_interest",
    },
    {
      term: "Total Equity",
      definition:
        "Total Equity is the sum of common equity and minority interest representing total ownership in the company.",
      citation: "See ASC 505-10",
      full_defination:
        "Total Equity is the sum of common equity and minority interest representing total ownership in the company. (See ASC 505-10)",
      tab: "key_highlights",
      term_key: "total_equity",
    },
    {
      term: "Total Liabilities and Equity",
      definition:
        "Total Liabilities and Equity equals total assets, representing the balance sheet equation.",
      citation: "See ASC 210-10",
      full_defination:
        "Total Liabilities and Equity equals total assets, representing the balance sheet equation. (See ASC 210-10)",
      tab: "key_highlights",
      term_key: "total_liabilities_and_equity",
    },
    {
      term: "Supplemental Items ($)",
      definition:
        "Supplemental Items are additional line items or disclosures in financial statements providing extra detail.",
      citation: "See SEC Regulation S-X",
      full_defination:
        "Supplemental Items are additional line items or disclosures in financial statements providing extra detail. (See SEC Regulation S-X)",
      tab: "key_highlights",
      term_key: "supplemental_items",
    },
    {
      term: "Total Common Shares Outstanding (actual)",
      definition:
        "Total Common Shares Outstanding is the actual number of common shares currently held by shareholders.",
      citation: "See ASC 260-10",
      full_defination:
        "Total Common Shares Outstanding is the actual number of common shares currently held by shareholders. (See ASC 260-10)",
      tab: "key_highlights",
      term_key: "total_common_shares_outstanding_actual",
    },
    {
      term: "Book Value per Share",
      definition:
        "Book Value per Share is the equity value attributable to common shareholders divided by shares outstanding.",
      citation: "See ASC 505-10",
      full_defination:
        "Book Value per Share is the equity value attributable to common shareholders divided by shares outstanding. (See ASC 505-10)",
      tab: "key_highlights",
      term_key: "book_value_per_share",
    },
    {
      term: "Tangible Book Value",
      definition:
        "Tangible Book Value is total equity minus intangible assets and goodwill.",
      citation: "See ASC 350-10",
      full_defination:
        "Tangible Book Value is total equity minus intangible assets and goodwill. (See ASC 350-10)",
      tab: "key_highlights",
      term_key: "tangible_book_value",
    },
    {
      term: "Tangible Book Value per Share",
      definition:
        "Tangible Book Value per Share is tangible book value divided by common shares outstanding.",
      citation: "See ASC 350-10",
      full_defination:
        "Tangible Book Value per Share is tangible book value divided by common shares outstanding. (See ASC 350-10)",
      tab: "key_highlights",
      term_key: "tangible_book_value_per_share",
    },
    {
      term: "Total Debt",
      definition:
        "Total Debt includes all interest-bearing debt, both short and long term.",
      citation: "See ASC 470-10",
      full_defination:
        "Total Debt includes all interest-bearing debt, both short and long term. (See ASC 470-10)",
      tab: "key_highlights",
      term_key: "total_debt",
    },
    {
      term: "Net Debt",
      definition: "Net Debt equals total debt minus cash and cash equivalents.",
      citation: "Derived from ASC 230-10",
      full_defination:
        "Net Debt equals total debt minus cash and cash equivalents. (Derived from ASC 230-10)",
      tab: "key_highlights",
      term_key: "net_debt",
    },
    {
      term: "Debt Equiv. of Unfunded Proj. Benefit Obligation",
      definition:
        "Debt Equivalent of Unfunded Projected Benefit Obligation represents pension liabilities considered debt-like.",
      citation: "See ASC 715-30",
      full_defination:
        "Debt Equivalent of Unfunded Projected Benefit Obligation represents pension liabilities considered debt-like. (See ASC 715-30)",
      tab: "key_highlights",
      term_key: "debt_equiv_of_unfunded_proj_benefit_obligation",
    },
    {
      term: "Debt Equivalent Oper. Leases",
      definition:
        "Debt Equivalent of Operating Leases estimates lease obligations treated like debt under lease accounting standards.",
      citation: "See ASC 842-10",
      full_defination:
        "Debt Equivalent of Operating Leases estimates lease obligations treated like debt under lease accounting standards. (See ASC 842-10)",
      tab: "key_highlights",
      term_key: "debt_equivalent_oper_leases",
    },
    {
      term: "Total Minority Interest",
      definition:
        "Total Minority Interest reflects noncontrolling equity ownership in consolidated subsidiaries.",
      citation: "See ASC 810-10",
      full_defination:
        "Total Minority Interest reflects noncontrolling equity ownership in consolidated subsidiaries. (See ASC 810-10)",
      tab: "key_highlights",
      term_key: "total_minority_interest",
    },
    {
      term: "Equity Method Investments",
      definition:
        "Equity Method Investments are investments in associates where the investor has significant influence but not control.",
      citation: "See ASC 323-10",
      full_defination:
        "Equity Method Investments are investments in associates where the investor has significant influence but not control. (See ASC 323-10)",
      tab: "key_highlights",
      term_key: "equity_method_investments",
    },
    {
      term: "Raw Materials Inventory",
      definition:
        "Raw Materials Inventory consists of basic materials used in production that have not yet been processed.",
      citation: "See ASC 330-10",
      full_defination:
        "Raw Materials Inventory consists of basic materials used in production that have not yet been processed. (See ASC 330-10)",
      tab: "key_highlights",
      term_key: "raw_materials_inventory",
    },
    {
      term: "Work in Progress Inventory",
      definition:
        "Work in Progress Inventory includes partially completed goods still in the production process.",
      citation: "See ASC 330-10",
      full_defination:
        "Work in Progress Inventory includes partially completed goods still in the production process. (See ASC 330-10)",
      tab: "key_highlights",
      term_key: "work_in_progress_inventory",
    },
    {
      term: "Finished Goods Inventory",
      definition:
        "Finished Goods Inventory comprises completed products ready for sale.",
      citation: "See ASC 330-10",
      full_defination:
        "Finished Goods Inventory comprises completed products ready for sale. (See ASC 330-10)",
      tab: "key_highlights",
      term_key: "finished_goods_inventory",
    },
    {
      term: "Land",
      definition:
        "Land is real property owned by the entity, not subject to depreciation.",
      citation: "See ASC 360-10",
      full_defination:
        "Land is real property owned by the entity, not subject to depreciation. (See ASC 360-10)",
      tab: "key_highlights",
      term_key: "land",
    },
    {
      term: "Buildings",
      definition:
        "Buildings are structures owned by the company, depreciated over their useful lives.",
      citation: "See ASC 360-10",
      full_defination:
        "Buildings are structures owned by the company, depreciated over their useful lives. (See ASC 360-10)",
      tab: "key_highlights",
      term_key: "buildings",
    },
    {
      term: "Machinery",
      definition:
        "Machinery includes equipment used in manufacturing and operations, subject to depreciation.",
      citation: "See ASC 360-10",
      full_defination:
        "Machinery includes equipment used in manufacturing and operations, subject to depreciation. (See ASC 360-10)",
      tab: "key_highlights",
      term_key: "machinery",
    },
    {
      term: "Construction in Progress",
      definition:
        "Construction in Progress represents capital assets under construction and not yet in service.",
      citation: "See ASC 360-10",
      full_defination:
        "Construction in Progress represents capital assets under construction and not yet in service. (See ASC 360-10)",
      tab: "key_highlights",
      term_key: "construction_in_progress",
    },
    {
      term: "Full Time Employees (actual)",
      definition:
        "Full Time Employees is the actual number of full-time equivalent employees employed by the entity.",
      citation: "Corporate Disclosures",
      full_defination:
        "Full Time Employees is the actual number of full-time equivalent employees employed by the entity. (Corporate Disclosures)",
      tab: "key_highlights",
      term_key: "full_time_employees_actual",
    },
    {
      term: "Accumulated Allowance for Doubtful Accounts",
      definition:
        "Allowance for Doubtful Accounts is a contra-asset estimating uncollectible receivables.",
      citation: "See ASC 310-10",
      full_defination:
        "Allowance for Doubtful Accounts is a contra-asset estimating uncollectible receivables. (See ASC 310-10)",
      tab: "key_highlights",
      term_key: "accumulated_allowance_for_doubtful_accounts",
    },
    {
      term: "Adoption of FIN 48 Related Items ($000)",
      definition:
        "Items related to adoption of FIN 48 reflect changes in unrecognized tax benefits due to tax position interpretations.",
      citation: "See ASC 740-10",
      full_defination:
        "Items related to adoption of FIN 48 reflect changes in unrecognized tax benefits due to tax position interpretations. (See ASC 740-10)",
      tab: "key_highlights",
      term_key: "adoption_of_fin_48_related_items_000",
    },
    {
      term: "Unrecog. Tax Benefits, Beginning of the Period",
      definition:
        "Unrecognized Tax Benefits are tax positions not yet recognized in financial statements at period start.",
      citation: "See ASC 740-10",
      full_defination:
        "Unrecognized Tax Benefits are tax positions not yet recognized in financial statements at period start. (See ASC 740-10)",
      tab: "key_highlights",
      term_key: "unrecog_tax_benefits_beginning_of_the_period",
    },
    {
      term: "Additions Based on Tax Positions - Current Yr.",
      definition:
        "Additions to unrecognized tax benefits arising from tax positions taken in the current year.",
      citation: "See ASC 740-10",
      full_defination:
        "Additions to unrecognized tax benefits arising from tax positions taken in the current year. (See ASC 740-10)",
      tab: "key_highlights",
      term_key: "additions_based_on_tax_positions_current_yr",
    },
    {
      term: "Additions for Tax Positions - Prior Yrs",
      definition:
        "Additions for tax positions from prior years due to changes in interpretation or new information.",
      citation: "See ASC 740-10",
      full_defination:
        "Additions for tax positions from prior years due to changes in interpretation or new information. (See ASC 740-10)",
      tab: "key_highlights",
      term_key: "additions_for_tax_positions_prior_yrs",
    },
    {
      term: "Reductions for Tax Positions - Prior Yrs",
      definition:
        "Reductions in unrecognized tax benefits due to settlements or expirations related to prior years.",
      citation: "See ASC 740-10",
      full_defination:
        "Reductions in unrecognized tax benefits due to settlements or expirations related to prior years. (See ASC 740-10)",
      tab: "key_highlights",
      term_key: "reductions_for_tax_positions_prior_yrs",
    },
    {
      term: "Settlements with Tax Authorities",
      definition:
        "Amounts recognized from resolution of tax audits or disputes with tax authorities.",
      citation: "See ASC 740-10",
      full_defination:
        "Amounts recognized from resolution of tax audits or disputes with tax authorities. (See ASC 740-10)",
      tab: "key_highlights",
      term_key: "settlements_with_tax_authorities",
    },
    {
      term: "Lapse of Statute of Limitations",
      definition:
        "Reduction in tax benefits due to expiration of the time allowed for tax authorities to assess additional tax.",
      citation: "See ASC 740-10",
      full_defination:
        "Reduction in tax benefits due to expiration of the time allowed for tax authorities to assess additional tax. (See ASC 740-10)",
      tab: "key_highlights",
      term_key: "lapse_of_statute_of_limitations",
    },
    {
      term: "Unrecog. Tax Benefits, End of the Period",
      definition:
        "Unrecognized Tax Benefits remaining at period end not yet recognized in financial statements.",
      citation: "See ASC 740-10",
      full_defination:
        "Unrecognized Tax Benefits remaining at period end not yet recognized in financial statements. (See ASC 740-10)",
      tab: "key_highlights",
      term_key: "unrecog_tax_benefits_end_of_the_period",
    },
    {
      term: "Changes in Unrecog. Tax Benefit w/in 1 Year - Max",
      definition:
        "Maximum possible change in unrecognized tax benefits within one year.",
      citation: "See ASC 740-10",
      full_defination:
        "Maximum possible change in unrecognized tax benefits within one year. (See ASC 740-10)",
      tab: "key_highlights",
      term_key: "changes_in_unrecog_tax_benefit_win_1_year_max",
    },
    {
      term: "Unrecog. Tax Benefit Impacting Effective Tax Rate",
      definition:
        "Portion of unrecognized tax benefits that, if recognized, would affect the effective tax rate.",
      citation: "See ASC 740-10",
      full_defination:
        "Portion of unrecognized tax benefits that, if recognized, would affect the effective tax rate. (See ASC 740-10)",
      tab: "key_highlights",
      term_key: "unrecog_tax_benefit_impacting_effective_tax_rate",
    },
    {
      term: "Fair Value Measurements ($000)",
      definition:
        "Fair Value Measurements are estimates of asset or liability values based on market or model inputs.",
      citation: "See ASC 820-10",
      full_defination:
        "Fair Value Measurements are estimates of asset or liability values based on market or model inputs. (See ASC 820-10)",
      tab: "key_highlights",
      term_key: "fair_value_measurements_000",
    },
    {
      term: "Level 1 Assets - Quoted Prices",
      definition:
        "Level 1 Assets have quoted prices in active markets for identical assets.",
      citation: "See ASC 820-10",
      full_defination:
        "Level 1 Assets have quoted prices in active markets for identical assets. (See ASC 820-10)",
      tab: "key_highlights",
      term_key: "level_1_assets_quoted_prices",
    },
    {
      term: "Level 2 Assets - Observable Prices",
      definition:
        "Level 2 Assets have inputs other than quoted prices observable for the asset.",
      citation: "See ASC 820-10",
      full_defination:
        "Level 2 Assets have inputs other than quoted prices observable for the asset. (See ASC 820-10)",
      tab: "key_highlights",
      term_key: "level_2_assets_observable_prices",
    },
    {
      term: "Fair Value of Assets",
      definition:
        "Fair Value of Assets is the estimated market value based on inputs from Levels 1 to 3.",
      citation: "See ASC 820-10",
      full_defination:
        "Fair Value of Assets is the estimated market value based on inputs from Levels 1 to 3. (See ASC 820-10)",
      tab: "key_highlights",
      term_key: "fair_value_of_assets",
    },
    {
      term: "Level 2 Liabilities - Observable Prices",
      definition:
        "Level 2 Liabilities have valuation inputs observable but not Level 1 quoted prices.",
      citation: "See ASC 820-10",
      full_defination:
        "Level 2 Liabilities have valuation inputs observable but not Level 1 quoted prices. (See ASC 820-10)",
      tab: "key_highlights",
      term_key: "level_2_liabilities_observable_prices",
    },
    {
      term: "Level 3 Liabilities - Unobservable Prices",
      definition:
        "Level 3 Liabilities have unobservable inputs, relying on internal models and assumptions.",
      citation: "See ASC 820-10",
      full_defination:
        "Level 3 Liabilities have unobservable inputs, relying on internal models and assumptions. (See ASC 820-10)",
      tab: "key_highlights",
      term_key: "level_3_liabilities_unobservable_prices",
    },
    {
      term: "Fair Value of Liabilities",
      definition:
        "Fair Value of Liabilities is the estimated market value based on Level 1 to 3 inputs.",
      citation: "See ASC 820-10",
      full_defination:
        "Fair Value of Liabilities is the estimated market value based on Level 1 to 3 inputs. (See ASC 820-10)",
      tab: "key_highlights",
      term_key: "fair_value_of_liabilities",
    },
    {
      term: "Stock-Based Comp., Unallocated",
      definition:
        "Stock-Based Compensation, Unallocated represents costs not yet assigned to specific departments or projects.",
      citation: "See ASC 718-10",
      full_defination:
        "Stock-Based Compensation, Unallocated represents costs not yet assigned to specific departments or projects. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "stockbased_comp_unallocated",
    },
    {
      term: "Stock-Based Comp., Total",
      definition:
        "Total Stock-Based Compensation is the aggregate expense recognized for equity-based awards.",
      citation: "See ASC 718-10",
      full_defination:
        "Total Stock-Based Compensation is the aggregate expense recognized for equity-based awards. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "stockbased_comp_total",
    },
    {
      term: "Options Outstanding",
      definition:
        "Options Outstanding represent stock options granted but not yet exercised or expired.",
      citation: "See ASC 718-10",
      full_defination:
        "Options Outstanding represent stock options granted but not yet exercised or expired. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "options_outstanding",
    },
    {
      term: "Options Out. at the Begin of Period, Common Stock",
      definition:
        "Stock options outstanding at the start of the reporting period for common stock.",
      citation: "See ASC 718-10",
      full_defination:
        "Stock options outstanding at the start of the reporting period for common stock. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "options_out_at_the_begin_of_period_common_stock",
    },
    {
      term: "Options Granted During the Period, Common Stock",
      definition:
        "Stock options granted during the period related to common stock.",
      citation: "See ASC 718-10",
      full_defination:
        "Stock options granted during the period related to common stock. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "options_granted_during_the_period_common_stock",
    },
    {
      term: "Options Exercised During the Period, Common Stock",
      definition: "Stock options exercised during the period for common stock.",
      citation: "See ASC 718-10",
      full_defination:
        "Stock options exercised during the period for common stock. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "options_exercised_during_the_period_common_stock",
    },
    {
      term: "Options Cancelled During the Period, Common Stock",
      definition:
        "Stock options cancelled or forfeited during the period for common stock.",
      citation: "See ASC 718-10",
      full_defination:
        "Stock options cancelled or forfeited during the period for common stock. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "options_cancelled_during_the_period_common_stock",
    },
    {
      term: "Options Out. at the End of Period, Common Stock",
      definition:
        "Stock options outstanding at the end of the reporting period for common stock.",
      citation: "See ASC 718-10",
      full_defination:
        "Stock options outstanding at the end of the reporting period for common stock. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "options_out_at_the_end_of_period_common_stock",
    },
    {
      term: "Options Wtd Avg Strike Price of Outstd, Comm Stock ($)",
      definition:
        "Weighted average exercise price of outstanding common stock options.",
      citation: "See ASC 718-10",
      full_defination:
        "Weighted average exercise price of outstanding common stock options. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "options_wtd_avg_strike_price_of_outstd_comm_stock",
    },
    {
      term: "Wtd Avg Strike Price of Granted, Comm Stock ($)",
      definition:
        "Weighted average exercise price of stock options granted for common stock during the period.",
      citation: "See ASC 718-10",
      full_defination:
        "Weighted average exercise price of stock options granted for common stock during the period. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "wtd_avg_strike_price_of_granted_comm_stock",
    },
    {
      term: "Options Outstanding - All Classes",
      definition:
        "Total stock options outstanding across all classes of stock.",
      citation: "See ASC 718-10",
      full_defination:
        "Total stock options outstanding across all classes of stock. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "options_outstanding_all_classes",
    },
    {
      term: "Options Out. at the Beginning of the Period, Total",
      definition: "Total options outstanding at the beginning of the period.",
      citation: "See ASC 718-10",
      full_defination:
        "Total options outstanding at the beginning of the period. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "options_out_at_the_beginning_of_the_period_total",
    },
    {
      term: "Options Granted During the Period, Total",
      definition: "Total options granted during the period.",
      citation: "See ASC 718-10",
      full_defination:
        "Total options granted during the period. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "options_granted_during_the_period_total",
    },
    {
      term: "Options Exercised During the Period, Total",
      definition: "Total options exercised during the period.",
      citation: "See ASC 718-10",
      full_defination:
        "Total options exercised during the period. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "options_exercised_during_the_period_total",
    },
    {
      term: "Options Cancelled During the Period, Total",
      definition: "Total options cancelled or forfeited during the period.",
      citation: "See ASC 718-10",
      full_defination:
        "Total options cancelled or forfeited during the period. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "options_cancelled_during_the_period_total",
    },
    {
      term: "Options Out. at the End of the Period, Total",
      definition: "Total options outstanding at the end of the period.",
      citation: "See ASC 718-10",
      full_defination:
        "Total options outstanding at the end of the period. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "options_out_at_the_end_of_the_period_total",
    },
    {
      term: "Stock Based Compensation ($000)",
      definition:
        "Total expense recognized for stock-based compensation, reported in thousands of dollars.",
      citation: "See ASC 718-10",
      full_defination:
        "Total expense recognized for stock-based compensation, reported in thousands of dollars. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "stock_based_compensation_000",
    },
    {
      term: "Stock Based Comp. Exp., Before Tax",
      definition:
        "Stock-based compensation expense recognized before income tax effects.",
      citation: "See ASC 718-10",
      full_defination:
        "Stock-based compensation expense recognized before income tax effects. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "stock_based_comp_exp_before_tax",
    },
    {
      term: "Stock Based Comp. Exp. Tax Effect",
      definition: "Income tax effect of stock-based compensation expense.",
      citation: "See ASC 718-10",
      full_defination:
        "Income tax effect of stock-based compensation expense. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "stock_based_comp_exp_tax_effect",
    },
    {
      term: "Stock Based Comp. Exp., After Tax",
      definition:
        "Stock-based compensation expense recognized after income tax effects.",
      citation: "See ASC 718-10",
      full_defination:
        "Stock-based compensation expense recognized after income tax effects. (See ASC 718-10)",
      tab: "key_highlights",
      term_key: "stock_based_comp_exp_after_tax",
    },
    {
      term: "Capitalized Interest Data ($000)",
      definition:
        "Capitalized Interest Data represents the amount of interest cost that has been added to the cost of a qualifying asset rather than expensed immediately, reported in thousands of dollars.",
      citation: "See ASC 835-20",
      full_defination:
        "Capitalized Interest Data represents the amount of interest cost that has been added to the cost of a qualifying asset rather than expensed immediately, reported in thousands of dollars. (See ASC 835-20)",
      tab: "key_highlights",
      term_key: "capitalized_interest_data_000",
    },
    {
      term: "Interest Capitalized During the Period",
      definition:
        "Interest Capitalized During the Period is the portion of interest cost incurred on borrowings during a specific period that is capitalized as part of the cost of acquiring or constructing a long-term asset.",
      citation: "See ASC 835-20",
      full_defination:
        "Interest Capitalized During the Period is the portion of interest cost incurred on borrowings during a specific period that is capitalized as part of the cost of acquiring or constructing a long-term asset. (See ASC 835-20)",
      tab: "key_highlights",
      term_key: "interest_capitalized_during_the_period",
    },
  ];
  popoverTitle: string = "";
  popoverContent: string = "";
  getPopoverContent(termKey: string, row_head_label: string = "") {
    // console.log("termkey:", termKey);
    const item = this.definationList.find(
      (d) => d.term_key.toLowerCase() === termKey.toLowerCase()
    );
    if (!item) {
      if (row_head_label) {
        let row_head_label_short = row_head_label
          .split(/\s+/)
          .slice(0, 2)
          .map((word) => word.replace(/[^\w]/g, "").toLowerCase()) // remove punctuation
          .join(" ");
        console.log("row_head_label_short:", row_head_label_short);
        for (let i = 0; i < this.definationList.length; i++) {
          if (
            this.definationList[i]["definition"]
              .toLowerCase()
              .indexOf(row_head_label_short) > -1
          ) {
            return {
              title: this.definationList[i].term,
              content: this.definationList[i].full_defination,
            };
            break;
          }
        }
        return null;
      } else {
        return null;
      }
    }

    return {
      title: item.term,
      content: item.full_defination,
    };
  }

  showPopover(
    termKey: string,
    table_label: string = "",
    row_label: string = "",
    row = null
  ) {
    //console.log("ROW:", row);
    let row_head_label =
      row && row["row_head_label"] ? row["row_head_label"] : "";
    const data = this.getPopoverContent(termKey, row_head_label);
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

  getRouterURL() {
    return this.router.url;
  }
  navigate(url: string) {
    this.router.navigate([url]);
  }

  mockApiResponse: any[] = [];
  financials: any = [];
  hasResponse: boolean = false;
  _apiService = inject(ApiService);
  _activeRoute = inject(ActivatedRoute);
  companyDetails: any;
  ngOnInit() {
    this.financials = this.convertMockApiToFinancialsFullyGeneric(
      this.mockApiResponse
    );
    console.log("Financials:", this.financials);
    console.log(JSON.stringify(this.financials, null, 4));
    this._activeRoute.queryParams.subscribe((params) => {
      const ticker = params["ticker"];
      const id = params["id"];
      this._apiService.getCompanyById(id).subscribe({
        next: (res: any) => {
          console.log("res", res);
          this.companyDetails = res.data;
        },
        error: (err: any) => {
          console.log("err", err);
        },
      });
      this.getBalanceSheetByPeriod(
        id,
        this.selectedRange.min,
        this.selectedRange.max
      );
    });
  }
  getBalanceSheetByPeriod(companyId: string, min: number, max: number) {
    this.hasResponse = false;
    this._apiService
      .getBalanceSheetDataByPeriod(companyId, min, max)
      .subscribe({
        next: (res: any) => {
          console.log("res", res);
          this.mockApiResponse = [res];
          this.financials = this.convertMockApiToFinancialsFullyGeneric(
            this.mockApiResponse
          );
          console.log(this.financials);
          this.hasResponse = true;
        },
        error: (err: any) => {
          console.log("err", err);
          this.hasResponse = true;
        },
      });
  }
  @ViewChild("docViewer", { static: false })
  docViewer!: ElementRef<HTMLIFrameElement>;
  modelRef: any;
  current_gap = "";
  current_context = "";
  openCapIQPopup(popupRef: any, r: any, year: any, dataVal: any) {
    if (!dataVal) {
      return;
    }
    console.log("Row:", r);
    console.log("Year:", year);
    console.log("dataVal:", dataVal);
    let filePath = "assets/10k-file.htm";
    let yearArr = year.split(" ");
    if (yearArr[0]) {
      year = yearArr[0];
    }
    if (year == 2019) {
      filePath = `assets/2020.htm`;
    } else if (year == 2020) {
      filePath = `assets/2021.htm`;
    } else if (year == 2021) {
      filePath = `assets/2022.htm`;
    } else if (year == 2022) {
      filePath = `assets/2023.htm`;
    }

    this.current_gap = "";
    if (r && r["us_gaap_name"]) {
      this.current_gap = r["us_gaap_name"];
    }
    if (dataVal && dataVal["contextref"]) {
      this.current_context = dataVal["contextref"];
    }
    //  else {
    //   if (year == "2024" || year.indexOf("2024") > -1) {
    //     this.current_context = "c-13";
    //   } else {
    //     this.current_context = "c-14";
    //   }
    // }
    console.log(this.current_context);

    this.http
      .get(dataVal.html_url, { responseType: "text" })
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
      console.log(this.current_gap, this.current_context);

      setTimeout(() => {
        const target = doc.querySelector(
          `[name="${this.current_gap}"][contextref="${this.current_context}"]`
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
  convertMockApiToFinancialsFullyGeneric(mockApiResponse: any) {
    const result: any[] = [];

    const topLevelData = mockApiResponse[0];
    if (!topLevelData) return result;

    // Step 1: Extract all years
    const yearSet = new Set<string>();

    function extractYearsRecursive(node: any) {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        node.forEach(extractYearsRecursive);
      } else if (node._items) {
        node._items.forEach((item: any) => {
          (item.values || []).forEach((val: any) => {
            Object.keys(val).forEach((key) => {
              if (key !== "contextref" && /^\d{4}$/.test(key)) {
                yearSet.add(key);
              }
            });
          });
        });
      } else if (node.values) {
        Object.keys(node.values).forEach((year) => yearSet.add(year));
      } else {
        Object.values(node).forEach(extractYearsRecursive);
      }
    }

    Object.values(topLevelData).forEach(extractYearsRecursive);

    const sortedYears = Array.from(yearSet).sort();
    const headers = sortedYears.map((year) => ({ year: `${year} FY` }));

    // Step 2: Recursive row builder
    function buildRowsRecursive(dataNode: any): any[] {
      const rows: any[] = [];

      for (const [label, value] of Object.entries(dataNode) as any) {
        // Skip processing _items as a separate row - we'll handle it below
        if (label === "_items") {
          continue;
        }

        // Handle direct line items (like "Total Assets")
        if (value.line_item && value.values) {
          rows.push({
            row_head_label: value.line_item,
            row_head_key: value.line_item
              .toLowerCase()
              .replace(/[^a-z0-9]/gi, "_"),
            us_gaap_name: value.us_gaap_name,
            data: sortedYears.map((y) => {
              const valObj = (value.values || []).find(
                (v: any) => v[y] !== undefined
              );
              return valObj
                ? {
                    val: valObj[y].number,
                    contextref: valObj["contextref"],
                    html_url: valObj[y].html_url,
                  }
                : null;
            }),
          });
        }
        // Handle sections with _items
        else if (value._items) {
          const children = value._items.map((item: any) => ({
            row_head_label: item.line_item,
            row_head_key: item.line_item
              .toLowerCase()
              .replace(/[^a-z0-9]/gi, "_"),
            us_gaap_name: item.us_gaap_name,
            data: sortedYears.map((y) => {
              const valObj = (item.values || []).find(
                (v: any) => v[y] !== undefined
              );
              return valObj
                ? {
                    val: valObj[y].number,
                    contextref: valObj["contextref"],
                    html_url: valObj[y].html_url,
                  }
                : null;
            }),
          }));

          rows.push({
            row_head_label: label,
            row_head_key: label.toLowerCase().replace(/[^a-z0-9]/gi, "_"),
            children,
          });
        }
        // Handle simple value objects (if any)
        else if (value.values) {
          rows.push({
            row_head_label: label,
            row_head_key: label.toLowerCase().replace(/[^a-z0-9]/gi, "_"),
            data: sortedYears.map((y) => value.values?.[y] ?? null),
          });
        }
        // Handle further nested groups
        else if (typeof value === "object" && value !== null) {
          const children = buildRowsRecursive(value);
          if (children.length > 0) {
            rows.push({
              row_head_label: label,
              row_head_key: label.toLowerCase().replace(/[^a-z0-9]/gi, "_"),
              children,
            });
          }
        }
      }

      // After processing all other items, check if there's an _items array at this level
      // and add its contents as direct children (not grouped under "_items")
      if (dataNode._items && Array.isArray(dataNode._items)) {
        const itemRows = dataNode._items.map((item: any) => ({
          row_head_label: item.line_item,
          row_head_key: item.line_item
            .toLowerCase()
            .replace(/[^a-z0-9]/gi, "_"),
          us_gaap_name: item.us_gaap_name,
          data: sortedYears.map((y) => {
            const valObj = (item.values || []).find(
              (v: any) => v[y] !== undefined
            );
            return valObj
              ? {
                  val: valObj[y].number,
                  contextref: valObj["contextref"],
                  html_url: valObj[y].html_url,
                }
              : null;
          }),
        }));

        // Add these items directly to the rows array
        rows.push(...itemRows);
      }

      return rows;
    }

    // Step 3: Create table per top-level section (Assets, Liabilities and Equity)
    for (const [sectionLabel, sectionData] of Object.entries(topLevelData)) {
      const table: any = {
        table_label:
          sectionLabel
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase()) + " ($000)",
        headers,
        data: buildRowsRecursive(sectionData),
      };

      result.push(table);
    }

    return result;
  }

  getPeriodEndedDate(yearLabel: string): string {
    // yearLabel: "2022 FY" => "2022"
    const year = yearLabel.split(" ")[0];
    return `12/31/${year}`;
  }
  getCellColor(val: any): string {
    const numVal =
      typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);

    if (isNaN(numVal) || numVal === 0) {
      return "#ffffff"; // white for NA
    } else if (numVal < 0) {
      return "#e53e3e"; // red
    } else {
      return "#0d6efd"; // blue
    }
  }

  //range selection
  selectedRange: RangeValue = { min: 2015, max: 2024 };
  onRangeChange(range: RangeValue) {
    this.selectedRange = range;
    console.log("Range changed:", range);
    // Handle the range change here
    this._activeRoute.queryParams.subscribe((params) => {
      const id = params["id"];

      this.getBalanceSheetByPeriod(
        id,
        this.selectedRange.min,
        this.selectedRange.max
      );
    });
  }
}
