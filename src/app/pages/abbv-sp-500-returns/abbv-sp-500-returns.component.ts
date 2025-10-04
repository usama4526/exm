import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { LabelType, Options } from "@angular-slider/ngx-slider";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
} from "@angular/core";
import { NgbModule, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import * as Plotly from "plotly.js-dist-min";
import * as XLSX from "xlsx";

// PlotlyModule.plotlyjs = PlotlyJS

@Component({
  standalone: true,
  selector: "app-abbv-sp-500-returns",
  imports: [NgbModule, NgxSliderModule, CommonModule],
  templateUrl: "./abbv-sp-500-returns.component.html",
  styleUrl: "./abbv-sp-500-returns.component.scss",
})
export class AbbvSP500ReturnsComponent implements OnInit {
  @ViewChild("plotlyChart", { static: true }) plotlyChart!: ElementRef;

  dates: string[] = [];
  abbvReturns: number[] = [];
  spxReturns: number[] = [];

  interval: any;
  currentIndex = 1;

  constructor(
    private router: Router,
    private http: HttpClient,
    private modalService: NgbModal
  ) {}

  getRouterURL() {
    return this.router.url;
  }
  navigate(url: string) {
    this.router.navigate([url]);
  }

  ngOnInit() {
    this.fetchExcelData();
  }

  fetchExcelData() {
    this.http
      .get("../../../assets/abbv-vs-sp500-returns.xlsx", {
        responseType: "arraybuffer",
      })
      .subscribe({
        next: (data) => {
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Find the actual header row (skip empty rows)
          let headerRowIndex = 0;
          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (
              row &&
              row.length > 0 &&
              row.some(
                (cell) =>
                  cell &&
                  typeof cell === "string" &&
                  (cell.toLowerCase().includes("abbv_ret_month") ||
                    cell.toLowerCase().includes("spx_ret_month"))
              )
            ) {
              headerRowIndex = i;
              break;
            }
          }

          const headerRow = jsonData[headerRowIndex] as any[];
          console.log("Actual header row index:", headerRowIndex);
          console.log("Raw header row:", headerRow);
          console.log("All data rows:", jsonData.slice(0, 5)); // Show first 5 rows for debugging

          // Safe header processing with null checks - look for exact column names
          const dateIdx = 0; // First column is always date in this format
          const abbvIdx = headerRow.findIndex(
            (h) =>
              h &&
              typeof h === "string" &&
              h.toLowerCase().includes("abbv_ret_month")
          );
          const spxIdx = headerRow.findIndex(
            (h) =>
              h &&
              typeof h === "string" &&
              h.toLowerCase().includes("spx_ret_month")
          );

          console.log("Column indexes found:", { dateIdx, abbvIdx, spxIdx });

          // If columns not found, try alternative names
          let actualDateIdx = dateIdx;
          let actualAbbvIdx = abbvIdx;
          let actualSpxIdx = spxIdx;

          if (abbvIdx === -1) {
            actualAbbvIdx = headerRow.findIndex(
              (h) =>
                h && typeof h === "string" && h.toLowerCase().includes("abbv")
            );
          }
          if (spxIdx === -1) {
            actualSpxIdx = headerRow.findIndex(
              (h) =>
                h && typeof h === "string" && h.toLowerCase().includes("spx")
            );
          }

          console.log("Column indexes:", {
            dateIdx: actualDateIdx,
            abbvIdx: actualAbbvIdx,
            spxIdx: actualSpxIdx,
          });
          console.log("Headers:", headerRow);

          // Check if all required columns were found
          if (
            actualDateIdx === -1 ||
            actualAbbvIdx === -1 ||
            actualSpxIdx === -1
          ) {
            console.error("Required columns not found in Excel file:");
            console.error("Date column found:", actualDateIdx !== -1);
            console.error("ABBV column found:", actualAbbvIdx !== -1);
            console.error("SPX column found:", actualSpxIdx !== -1);
            console.error("Available headers:", headerRow);
            return;
          }

          // Collect monthly returns data
          const monthlyData: {
            date: string;
            abbvReturn: number;
            spxReturn: number;
          }[] = [];

          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];

            // Check if row exists and has required data
            if (
              !row ||
              row.length <
                Math.max(actualDateIdx, actualAbbvIdx, actualSpxIdx) + 1
            ) {
              console.warn(`Skipping row ${i}: insufficient data`);
              continue;
            }

            const dateValue = row[actualDateIdx];
            const abbvReturn = row[actualAbbvIdx];
            const spxReturn = row[actualSpxIdx];

            if (
              dateValue !== null &&
              dateValue !== undefined &&
              abbvReturn !== null &&
              abbvReturn !== undefined &&
              spxReturn !== null &&
              spxReturn !== undefined
            ) {
              // Handle Excel date format
              let plotlyDate: string;
              if (typeof dateValue === "number") {
                const dateObj = XLSX.SSF.parse_date_code(dateValue);
                plotlyDate = `${dateObj.y}-${String(dateObj.m).padStart(
                  2,
                  "0"
                )}-${String(dateObj.d).padStart(2, "0")}`;
              } else {
                // If it's already a string, parse it
                const date = new Date(dateValue);
                plotlyDate = date.toISOString().split("T")[0];
              }

              const abbvValue = Number(abbvReturn);
              const spxValue = Number(spxReturn);

              console.log(
                `Row ${i}: Date=${dateValue}, ABBV=${abbvValue}, SPX=${spxValue}`
              );

              if (!isNaN(abbvValue) && !isNaN(spxValue)) {
                monthlyData.push({
                  date: plotlyDate,
                  abbvReturn: abbvValue * 100, // 0.0182 -> 1.82
                  spxReturn: spxValue * 100, // 0.0111 -> 1.11
                });
              }
            }
          }

          // Sort by date and extract arrays
          monthlyData.sort((a, b) => a.date.localeCompare(b.date));

          this.dates = monthlyData.map((item) => item.date);
          this.abbvReturns = monthlyData.map((item) => item.abbvReturn);
          this.spxReturns = monthlyData.map((item) => item.spxReturn);

          console.log("Final processed data:");
          console.log("Dates:", this.dates.slice(0, 5));
          console.log("ABBV Returns:", this.abbvReturns);
          console.log("SPX Returns:", this.spxReturns);

          if (this.dates.length > 0) {
            this.currentIndex = 1;
            this.drawChart(1);
            this.startAnimation();
          } else {
            console.error(
              "No data was extracted from the Excel file. Check column names and data format."
            );
          }
        },
        error: (error) => {
          console.error(
            "Error fetching the Excel file. Make sure the file is in 'src/assets/data.xlsx' and the path is correct.",
            error
          );
        },
      });
  }

  startAnimation() {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (this.currentIndex < this.dates.length) {
        this.currentIndex++;
        this.drawChart(this.currentIndex);
      } else {
        clearInterval(this.interval);
      }
    }, 10);
  }

  drawChart(points: number) {
    const date = new Date(this.dates[points - 1]);
    const monthName = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const currentDateText = `${monthName} ${year}`;

    // Dynamically calculate the end of the x-axis range for padding
    const lastVisibleDate = new Date(this.dates[points - 1]);
    const xAxisEndDate = new Date(lastVisibleDate);
    // Add 6 months padding to the end of the x-axis
    xAxisEndDate.setMonth(xAxisEndDate.getMonth() + 6);

    // Marker sizes: 0 for all points except the last one
    const markerSizes = new Array(points).fill(0);
    if (points > 0) {
      markerSizes[points - 1] = 6;
    }

    // ABBV line (Gold/Orange)
    const trace1 = {
      x: this.dates.slice(0, points),
      y: this.abbvReturns.slice(0, points),
      mode: "lines+markers",
      name: "ABBV",
      line: { color: "#FF8C00", width: 2 }, // Orange line
      marker: { color: "#FF8C00", size: markerSizes },
    };

    // SPX line (Blue)
    const trace2 = {
      x: this.dates.slice(0, points),
      y: this.spxReturns.slice(0, points),
      mode: "lines+markers",
      name: "S&P 500 (TR)",
      line: { color: "#1E90FF", width: 2 }, // Blue line
      marker: { color: "#1E90FF", size: markerSizes },
    };

    const data = [trace1, trace2];

    const annotations: any[] = [
      {
        x: 1,
        y: -0.1,
        xref: "paper",
        yref: "paper",
        text: currentDateText,
        showarrow: false,
        xanchor: "right",
        yanchor: "top",
        font: { size: 20, family: "Georgia" },
      },
    ];

    // Add value annotations for both lines
    if (points > 12) {
      const lastDate = this.dates[points - 1];
      const lastAbbvValue = this.abbvReturns[points - 1];
      const lastSpxValue = this.spxReturns[points - 1];

      annotations.push({
        x: lastDate,
        y: lastAbbvValue,
        text: `ABBV<br>${lastAbbvValue.toFixed(2)}%`,
        showarrow: false,
        xanchor: "left",
        yanchor: "middle",
        font: { color: "#FF8C00", size: 12, family: "Georgia" },
        xshift: 10,
      });

      annotations.push({
        x: lastDate,
        y: lastSpxValue,
        text: ` S&P 500 (TR)<br>${lastSpxValue.toFixed(2)}%`,
        showarrow: false,
        xanchor: "left",
        yanchor: "middle",
        font: { color: "#1E90FF", size: 12, family: "Georgia" },
        xshift: 10,
      });
    }

    const layout = {
      title: {
        text: "	Abbvie Stock Returns vs. S&P 500 Returns",
        font: { size: 24, family: "Georgia" },
      },
      xaxis: {
        // title: { text: 'Total return, %', font: { family: 'Georgia' } },
        range: [this.dates[0], xAxisEndDate.toISOString().split("T")[0]],
        showgrid: true,
        gridcolor: "#333",
        tickformat: "%Y",
        tickfont: { family: "Georgia" },
      },
      yaxis: {
        // title: { text: 'Total return, %', font: { family: 'Georgia' } },
        showgrid: true,
        gridcolor: "#333",
        range: [-30, 30],
        tickfont: { family: "Georgia" },
        ticksuffix: "%",
        tickformat: ".2f",
        tickmode: "auto",
        nticks: 10,
      },
      plot_bgcolor: "#000",
      paper_bgcolor: "#000",
      font: { color: "#fff", family: "Georgia" },
      annotations: annotations,
      showlegend: false,
    };
    Plotly.newPlot(this.plotlyChart.nativeElement, data, layout as any, {
      responsive: true,
    });
  }
}
