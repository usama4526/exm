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
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { ApiService } from "../../services/api.service";
import {
  RangeSliderComponent,
  RangeValue,
} from "../../components/range-slider/range-slider.component";

@Component({
  standalone: true,
  selector: "app-income-statement",
  imports: [
    NgbModule,
    NgxSliderModule,
    CommonModule,
    FormatNumberPipe,
    SidebarComponent,
    RangeSliderComponent,
  ],
  templateUrl: "./income-statement.component.html",
  styleUrls: ["./income-statement.component.scss"],
})
export class IncomeStatementComponent implements OnInit {
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
      term: "Net Cash Provided by Operating Activities",
      definition:
        "Net cash provided by operating activities represents the cash generated or consumed from the company's core business operations.",
      citation: "See ASC 230-10",
      full_defination:
        "Net cash provided by operating activities represents the cash generated or consumed from the company's core business operations. (See ASC 230-10)",
      tab: "key_highlights",
      term_key: "net_cash_operating_activities",
    },
    {
      term: "Net Cash Used in Investing Activities",
      definition:
        "Net cash used in investing activities represents cash flows from the acquisition and disposal of long-term assets and investments.",
      citation: "See ASC 230-10",
      full_defination:
        "Net cash used in investing activities represents cash flows from the acquisition and disposal of long-term assets and investments. (See ASC 230-10)",
      tab: "key_highlights",
      term_key: "net_cash_investing_activities",
    },
    {
      term: "Net Cash Used in Financing Activities",
      definition:
        "Net cash used in financing activities represents cash flows from transactions with owners and creditors.",
      citation: "See ASC 230-10",
      full_defination:
        "Net cash used in financing activities represents cash flows from transactions with owners and creditors. (See ASC 230-10)",
      tab: "key_highlights",
      term_key: "net_cash_financing_activities",
    },
  ];

  popoverTitle: string = "";
  popoverContent: string = "";
  getPopoverContent(termKey: string, row_head_label: string = "") {
    const item = this.definationList.find(
      (d) => d.term_key.toLowerCase() === termKey.toLowerCase()
    );
    if (!item) {
      if (row_head_label) {
        let row_head_label_short = row_head_label
          .split(/\s+/)
          .slice(0, 2)
          .map((word) => word.replace(/[^\w]/g, "").toLowerCase())
          .join(" ");
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
    const companyId = this._activeRoute.snapshot.params["id"];
    this._activeRoute.queryParams.subscribe((params) => {
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
      this.getIncomeStatementByPeriod(
        id,
        this.selectedRange.min,
        this.selectedRange.max
      );
    });
  }

  getIncomeStatementByPeriod(companyId: string, min: number, max: number) {
    this._apiService
      .getIncomeStatementDataByPeriod(companyId, min, max)
      .subscribe({
        next: (res: any) => {
          console.log("res", res);
          this.mockApiResponse = [res];
          this.hasResponse = true;
          this.financials = this.convertMockApiToFinancialsFullyGeneric(
            this.mockApiResponse
          );
          console.log(this.financials);
        },
        error: (err: any) => {
          console.log("err", err);
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
      if(sectionLabel=="Per Share Items"){
        const table: any = {
          table_label:
            sectionLabel
              .replace(/_/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase()) + '($)',
          headers,
          data: buildRowsRecursive(sectionData),
        };
        result.push(table);
        continue;
      }
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

      this.getIncomeStatementByPeriod(
        id,
        this.selectedRange.min,
        this.selectedRange.max
      );
    });
  }
}
