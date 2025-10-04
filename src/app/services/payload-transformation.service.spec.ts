import { TestBed } from "@angular/core/testing";
import { PayloadTransformationService } from "./payload-transformation.service";
import { FilterStep } from "../models/filter-interfaces";

describe("PayloadTransformationService", () => {
  let service: PayloadTransformationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayloadTransformationService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("transformSectorSelection", () => {
    it("should transform sector selection to FilterStep", () => {
      const sectorSelection = {
        GICS_PRIMARY_INDUSTRY: [
          "Health Care Equipment and Supplies",
          "Health Care Providers and Services",
        ],
      };

      const result = service.transformSectorSelection(sectorSelection);

      expect(result).toEqual([
        {
          field: "primaryIndustry",
          operator: "in",
          value: [
            "Health Care Equipment and Supplies",
            "Health Care Providers and Services",
          ],
        },
      ]);
    });

    it("should return empty array for empty sector selection", () => {
      const sectorSelection = {};
      const result = service.transformSectorSelection(sectorSelection);
      expect(result).toEqual([]);
    });
  });

  describe("transformLocationSelection", () => {
    it("should transform location selection to FilterStep", () => {
      const locationSelection = {
        grouped: {
          STATE: ["California", "New York"],
          US_REGION: ["West", "Mid Atlantic"],
        },
      };

      const result = service.transformLocationSelection(locationSelection);

      expect(result).toContain({
        field: "state",
        operator: "in",
        value: ["California", "New York"],
      });

      expect(result).toContain({
        field: "usRegion",
        operator: "in",
        value: ["West", "Mid Atlantic"],
      });
    });
  });

  describe("transformCompanyTypeSelection", () => {
    it("should transform company type and status to FilterStep", () => {
      const companyType = { COMPANY_TYPE: ["Public"] };
      const companyStatus = { COMPANY_STATUS: ["Active"] };

      const result = service.transformCompanyTypeSelection(
        companyType,
        companyStatus
      );

      expect(result).toContain({
        field: "companyType",
        operator: "in",
        value: ["Public"],
      });

      expect(result).toContain({
        field: "companyStatus",
        operator: "in",
        value: ["Active"],
      });
    });
  });

  describe("transformFinancialMetrics", () => {
    it("should transform financial metrics with min/max to FilterStep", () => {
      const financialMetrics = {
        TOTAL_REVENUE__LATEST_FISCAL_YEAR____000__1: {
          min: 1000000,
          max: 5000000,
        },
        NET_INCOME__LATEST_FISCAL_YEAR____000__1: { min: 50000 },
      };

      const result = service.transformFinancialMetrics(
        financialMetrics,
        "2023"
      );

      expect(result).toContain({
        section: "incomeStatement",
        field: "totalRevenue",
        operator: "between",
        value: ["1000000", "5000000"],
        years: [2023],
      });

      expect(result).toContain({
        section: "incomeStatement",
        field: "netIncome",
        operator: "gte",
        value: ["50000"],
        years: [2023],
      });
    });
  });

  describe("transformNewCriteria", () => {
    it("should transform new criteria from dropdown to FilterStep", () => {
      const newCriteriaData = {
        balanceSheetAssetsFilters: {
          totalAssets: {
            gte: 1000000000,
          },
        },
        incomeStatementFilters: {
          totalRevenue: {
            between: [100000000, 5000000000],
          },
        },
      };

      const result = service.transformNewCriteria(newCriteriaData, "2023");

      expect(result).toContain(
        jasmine.objectContaining({
          section: "balanceSheetAssets",
          field: "totalAssets",
          operator: "gte",
          value: "1000000000",
          years: [2023],
        })
      );

      expect(result).toContain(
        jasmine.objectContaining({
          section: "incomeStatement",
          field: "totalRevenue",
          operator: "between",
          value: ["100000000", "5000000000"],
          years: [2023],
        })
      );
    });

    it("should extract year from FY2024 format correctly", () => {
      const newCriteriaData = {
        balanceSheetAssetsFilters: {
          totalAssets: {
            gte: 1000000000,
          },
        },
      };

      const result = service.transformNewCriteria(newCriteriaData, "FY2024");

      expect(result).toContain(
        jasmine.objectContaining({
          section: "balanceSheetAssets",
          field: "totalAssets",
          operator: "gte",
          value: "1000000000",
          years: [2024],
        })
      );
    });

    it("should handle missing year parameter gracefully", () => {
      const newCriteriaData = {
        balanceSheetAssetsFilters: {
          totalAssets: {
            gte: 1000000000,
          },
        },
      };

      const result = service.transformNewCriteria(newCriteriaData);

      // Should use current year as fallback
      const currentYear = new Date().getFullYear();
      expect(result).toContain(
        jasmine.objectContaining({
          section: "balanceSheetAssets",
          field: "totalAssets",
          operator: "gte",
          value: "1000000000",
          years: [currentYear],
        })
      );
    });
  });

  describe("combineFilterSteps", () => {
    it("should combine filter steps and remove duplicates", () => {
      const steps1: FilterStep[] = [
        { field: "state", operator: "in", value: ["California"] },
      ];
      const steps2: FilterStep[] = [
        { field: "state", operator: "in", value: ["California"] }, // duplicate
        { field: "primaryIndustry", operator: "in", value: ["Technology"] },
      ];

      const result = service.combineFilterSteps(steps1, steps2);

      expect(result.length).toBe(2);
      expect(result).toContain(
        jasmine.objectContaining({
          field: "state",
          operator: "in",
          value: ["California"],
        })
      );
      expect(result).toContain(
        jasmine.objectContaining({
          field: "primaryIndustry",
          operator: "in",
          value: ["Technology"],
        })
      );
    });
  });

  describe("Integration Test - Complex Payload", () => {
    it("should transform complex legacy payload to FilterStep format matching API guide examples", () => {
      // Test data matching the API guide examples
      const companyFilters = {
        state: ["California", "New York", "Massachusetts"],
        primaryIndustry: [
          "Health Care Equipment and Supplies",
          "Health Care Providers and Services",
        ],
      };

      const financialCriteria = [
        {
          year: "2023",
          balanceSheetAssetsFilters: {
            totalAssets: { gte: 1000000000 },
            cashAndEquivalents: { gte: 50000000 },
          },
          incomeStatementFilters: {
            totalRevenue: { between: [100000000, 5000000000] },
            netIncome: { gt: 25000000 },
          },
        },
      ];

      const result = service.transformToFilterSteps(
        companyFilters,
        financialCriteria,
        "2023"
      );

      // Verify company field transformations
      expect(result).toContain(
        jasmine.objectContaining({
          field: "state",
          operator: "in",
          value: ["California", "New York", "Massachusetts"],
        })
      );

      expect(result).toContain(
        jasmine.objectContaining({
          field: "primaryIndustry",
          operator: "in",
          value: [
            "Health Care Equipment and Supplies",
            "Health Care Providers and Services",
          ],
        })
      );

      // Verify financial data transformations
      expect(result).toContain(
        jasmine.objectContaining({
          section: "balanceSheetAssets",
          field: "totalAssets",
          operator: "gte",
          value: ["1000000000"],
          years: [2023],
        })
      );

      expect(result).toContain(
        jasmine.objectContaining({
          section: "balanceSheetAssets",
          field: "cashAndEquivalents",
          operator: "gte",
          values: ["50000000"],
          years: [2023],
        })
      );

      expect(result).toContain(
        jasmine.objectContaining({
          section: "incomeStatement",
          field: "totalRevenue",
          operator: "between",
          values: ["100000000", "5000000000"],
          years: [2023],
        })
      );

      expect(result).toContain(
        jasmine.objectContaining({
          section: "incomeStatement",
          field: "netIncome",
          operator: "gt",
          values: ["25000000"],
          years: [2023],
        })
      );

      console.log("Transformed FilterSteps:", JSON.stringify(result, null, 2));
    });
  });
});
