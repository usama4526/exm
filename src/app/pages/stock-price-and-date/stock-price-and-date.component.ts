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

@Component({
  standalone: true,
  selector: "app-stock-price-and-date",
  imports: [NgbModule, NgxSliderModule, CommonModule],
  templateUrl: "./stock-price-and-date.component.html",
  styleUrl: "./stock-price-and-date.component.scss",
})
export class StockPriceAndDateComponent implements OnInit {
  @ViewChild("plotlyChart", { static: true }) plotlyChart!: ElementRef;

  dates: string[] = [];
  prices: number[] = [];
  volumes: number[] = [];
  originalVolumes: number[] = []; // Store original volume values for tooltips

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
      .get("../../../assets/abbv-price-vol.xlsx", {
        responseType: "arraybuffer",
      })
      .subscribe({
        next: (data) => {
          try {
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            console.log("Excel data structure:", jsonData);

            // Check if we have data and a header row
            if (!jsonData || jsonData.length === 0) {
              console.error("Excel file is empty or has no data.");
              return;
            }

            // Find column indexes for 'Date', 'ABBV_Price', and 'ABBV_Vol'
            const headerRow = jsonData[0] as any[];
            console.log("Header row:", headerRow);

            if (!headerRow || !Array.isArray(headerRow)) {
              console.error("Header row is missing or invalid.");
              return;
            }

            // More robust column finding with fallbacks
            let dateIdx = -1;
            let priceIdx = -1;
            let volumeIdx = -1;

            // Based on the console output, the structure is [empty, 'ABBV_Price', 'ABBV_Vol']
            // The first column (index 0) is the date column, even though it appears empty
            // Let's check the actual data structure and handle this case
            console.log("Full header row:", headerRow);
            console.log("Header row length:", headerRow.length);

            // Check if we have the expected structure: [empty, 'ABBV_Price', 'ABBV_Vol']
            if (
              headerRow.length >= 3 &&
              (headerRow[1] === "ABBV_Price" ||
                headerRow[1]?.toLowerCase().includes("price")) &&
              (headerRow[2] === "ABBV_Vol" ||
                headerRow[2]?.toLowerCase().includes("vol"))
            ) {
              // Use the first column as date (index 0)
              dateIdx = 0;
              priceIdx = 1;
              volumeIdx = 2;

              console.log(
                "Using fixed column mapping - Date: 0, Price: 1, Volume: 2"
              );
            } else {
              // Fallback to searching for columns
              for (let i = 0; i < headerRow.length; i++) {
                const header = headerRow[i];
                if (header && typeof header === "string") {
                  const lowerHeader = header.toLowerCase();
                  if (lowerHeader.includes("date")) {
                    dateIdx = i;
                  } else if (
                    lowerHeader.includes("abbv_price") ||
                    lowerHeader.includes("price")
                  ) {
                    priceIdx = i;
                  } else if (
                    lowerHeader.includes("abbv_vol") ||
                    lowerHeader.includes("volume")
                  ) {
                    volumeIdx = i;
                  }
                }
              }
            }

            console.log(
              "Column indices - Date:",
              dateIdx,
              "Price:",
              priceIdx,
              "Volume:",
              volumeIdx
            );

            // Check if all required columns were found
            if (dateIdx === -1 || priceIdx === -1 || volumeIdx === -1) {
              console.error(
                "Required columns not found. Found columns:",
                headerRow
              );
              console.error(
                "Date index:",
                dateIdx,
                "Price index:",
                priceIdx,
                "Volume index:",
                volumeIdx
              );
              return;
            }

            // Collect all data
            const chartData: {
              date: string;
              price: number;
              volume: number;
              originalVolume: number;
            }[] = [];

            // Debug: Check first few data rows
            console.log("First few data rows:");
            for (let i = 1; i < Math.min(10, jsonData.length); i++) {
              const row = jsonData[i] as any[];
              console.log(`Row ${i}:`, row);
            }

            // Find where actual data starts (skip header rows)
            let dataStartIndex = 1;
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i] as any[];
              if (!row || !Array.isArray(row)) continue;

              const firstCell = row[dateIdx];
              // Check if this looks like actual data (numeric date or valid date string)
              if (
                firstCell &&
                (typeof firstCell === "number" ||
                  (typeof firstCell === "string" &&
                    !isNaN(Number(firstCell))) ||
                  (typeof firstCell === "string" &&
                    !firstCell.toLowerCase().includes("ticker") &&
                    !firstCell.toLowerCase().includes("date")))
              ) {
                dataStartIndex = i;
                console.log(`Data starts at row ${i}:`, row);
                break;
              }
            }

            console.log(`Starting data processing from row ${dataStartIndex}`);

            for (let i = dataStartIndex; i < jsonData.length; i++) {
              const row = jsonData[i] as any[];
              if (!row || !Array.isArray(row)) continue;

              const excelDate = row[dateIdx];
              const price = row[priceIdx];
              const volume = row[volumeIdx];

              // Skip rows that don't have valid data
              if (!excelDate || !price || !volume) {
                console.log(`Skipping row ${i} - missing data:`, row);
                continue;
              }

              // Validate that we have numeric data
              if (typeof price !== "number" || typeof volume !== "number") {
                console.log(`Skipping row ${i} - non-numeric data:`, row);
                continue;
              }

              console.log(
                `Processing row ${i}: Date=${excelDate}, Price=${price}, Volume=${volume}`
              );

              // Handle Excel date format
              let plotlyDate: string;
              try {
                if (typeof excelDate === "number") {
                  const dateObj = XLSX.SSF.parse_date_code(excelDate);
                  plotlyDate = `${dateObj.y}-${String(dateObj.m).padStart(
                    2,
                    "0"
                  )}-${String(dateObj.d).padStart(2, "0")}`;
                } else {
                  // If it's already a string, parse it
                  const date = new Date(excelDate);
                  if (isNaN(date.getTime())) {
                    console.log(
                      `Skipping row ${i} - invalid date: ${excelDate}`
                    );
                    continue;
                  }
                  plotlyDate = date.toISOString().split("T")[0];
                }

                const priceValue = Number(price);
                const volumeValue = Number(volume);

                if (!isNaN(priceValue) && !isNaN(volumeValue)) {
                  chartData.push({
                    date: plotlyDate,
                    price: priceValue,
                    volume: volumeValue, // Use original volume value
                    originalVolume: volumeValue, // Keep original value for tooltips
                  });
                }
              } catch (error) {
                console.log(`Error processing row ${i}:`, error, row);
                continue;
              }
            }

            console.log("Processed chart data:", chartData.length, "records");

            // Sort by date
            chartData.sort((a, b) => a.date.localeCompare(b.date));

            this.dates = chartData.map((item) => item.date);
            this.prices = chartData.map((item) => item.price);
            this.volumes = chartData.map((item) => item.volume);
            this.originalVolumes = chartData.map((item) => item.originalVolume);

            if (this.dates.length > 0) {
              this.currentIndex = 1;
              this.drawChart(1);
              this.startAnimation();
            } else {
              console.error(
                "No data was extracted from the Excel file. Check column names and data format."
              );
            }
          } catch (error) {
            console.error("Error processing Excel data:", error);
          }
        },
        error: (error) => {
          console.error(
            "Error fetching the Excel file. Make sure the file is in 'src/assets/abbv-price-vol.xlsx' and the path is correct.",
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
    }, 5);
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
    const customData = this.dates
      .slice(0, points)
      .map((_, i) => [this.prices[i], this.originalVolumes[i]]);
    const traceGradient: any = {
      x: this.dates.slice(0, points),
      y: this.prices.slice(0, points),
      mode: "lines",
      line: { color: "#00AEEF", width: 2 }, // Your main line color
      fill: "tozeroy",
      fillcolor: "rgba(0, 175, 239, 0.14)", // Light gradient effect
      name: "Date & Price",
      yaxis: "y",
      customdata: customData,
      hovertemplate:
        "Date: %{x}<br>Price: %{customdata[0]:.2f}<br>Volume: %{customdata[1]:,}<extra></extra>",
    };

    // Bar chart for Volume
    const trace1: any = {
      x: this.dates.slice(0, points),
      y: this.volumes.slice(0, points),
      type: "bar",
      name: "Date & Vol",
      marker: {
        color: "#4A4A4A",
        opacity: 0.8,
      },
      yaxis: "y2",
      customdata: customData,
      hovertemplate:
        "Date: %{x}<br>Price: %{customdata[0]:.2f}<br>Volume: %{customdata[1]:,}<extra></extra>",
    };

    const data: any[] = [trace1, traceGradient];

    const annotations: any[] = [
      {
        x: 1,
        y: -0.1,
        xref: "paper",
        yref: "paper",
        text: currentDateText,
        showarrow: false,
        xanchor: "right",
        yanchor: "bottom",
        font: { size: 20, color: "#FFFFFF" },
      },
    ];

    if (points > 12) {
      const lastDate = this.dates[points - 1];
      const lastPriceValue = this.prices[points - 1];
      annotations.push({
        x: lastDate,
        y: lastPriceValue,
        text: `Price<br>${lastPriceValue.toFixed(2)}`,
        showarrow: false,
        xanchor: "left",
        yanchor: "middle",
        font: { color: "#0066CC", size: 12, family: "Georgia" },
        xshift: 10,
      });
    }

    const layout: any = {
      title: {
        text: "Abbvie Stock Price and Volume",
        font: { size: 24, family: "Georgia", color: "#FFFFFF" },
      },
      showlegend: false,
      grid: {
        rows: 2,
        columns: 1,
        pattern: "independent",
        rowheight: [0.7, 0.3],
      },
      hovermode: "x unified",
      xaxis: {
        range: [this.dates[0], xAxisEndDate.toISOString().split("T")[0]],
        showgrid: true,
        gridcolor: "rgba(51, 51, 51, 0.1)",
        tickformat: "%Y",
        domain: [0, 1],
        row: 1,
        tickfont: { size: 12 },
        dtick: "M12",
        showspikes: true,
        spikemode: "across", // or 'toaxis'
        spikesnap: "cursor",
        spikethickness: 1,
        spikecolor: "#AAAAAA",
        spikedash: "solid",
      },
      xaxis2: {
        range: [this.dates[0], xAxisEndDate.toISOString().split("T")[0]],
        showgrid: true,
        gridcolor: "rgba(51, 51, 51, 0.1)",
        tickformat: "%Y",
        domain: [0, 1],
        row: 2,
        tickfont: { size: 12 },
        showspikes: true,
        spikemode: "across",
        spikesnap: "cursor",
        spikethickness: 1,
        spikecolor: "#AAAAAA",
        spikedash: "solid",
      },
      yaxis: {
        showgrid: true,
        gridcolor: "rgba(51, 51, 51, 0.1)",
        domain: [0.3, 1],
        side: "right",
        tickfont: { size: 12 },
        showspikes: true,
        spikemode: "across",
        spikesnap: "cursor",
        spikethickness: 1,
        spikecolor: "#AAAAAA",
        spikedash: "solid",
      },
      yaxis2: {
        showgrid: true,
        gridcolor: "rgba(51, 51, 51, 0.1)",
        domain: [0, 0.25],
        side: "right",
        tickformat: "~s",
        tickfont: { size: 12 },
        showspikes: true,
        spikemode: "across",
        spikesnap: "cursor",
        spikethickness: 1,
        spikecolor: "#AAAAAA",
        spikedash: "solid",
      },
      plot_bgcolor: "#111111",
      paper_bgcolor: "#111111",
      font: { color: "#FFFFFF", family: "Georgia" },
      annotations: annotations,
      margin: { l: 80, r: 140, t: 100, b: 80 },
      autosize: true,
      height: undefined,
      width: undefined,
    };

    const config: any = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
      displaylogo: false,
      toImageButtonOptions: {
        format: "png" as const,
        filename: "abbvie-stock-chart",
        height: 600,
        width: 800,
        scale: 2,
      },
    };

    Plotly.newPlot(this.plotlyChart.nativeElement, data, layout, config);
  }
}
