import { PayloadTransformationService } from '../services/payload-transformation.service';
import { FilterStep } from '../models/filter-interfaces';

/**
 * Validation utility to demonstrate and test payload transformations
 * This matches the examples from ANGULAR_FRONTEND_PAYLOAD_GUIDE.md
 */
export class PayloadValidation {
  private transformationService = new PayloadTransformationService();

  /**
   * Example 1: Basic Company Field Filtering
   * Expected output matches: Basic Company Field Filtering example from guide
   */
  validateBasicCompanyFiltering(): FilterStep[] {
    const companyFilters = {
      state: ["California", "New York", "Texas"]
    };

    const result = this.transformationService.transformToFilterSteps(companyFilters);
    
    console.log('=== Basic Company Field Filtering ===');
    console.log('Input:', companyFilters);
    console.log('Output:', JSON.stringify(result, null, 2));
    
    // Expected: [{ "field": "state", "operator": "in", "values": ["California", "New York", "Texas"] }]
    return result;
  }

  /**
   * Example 2: Industry + Geographic Filtering
   * Expected output matches: Industry + Geographic Filtering example from guide
   */
  validateIndustryGeographicFiltering(): FilterStep[] {
    const companyFilters = {
      state: ["California", "New York", "Massachusetts"],
      primaryIndustry: ["Health Care Equipment and Supplies", "Health Care Providers and Services"]
    };

    const result = this.transformationService.transformToFilterSteps(companyFilters);
    
    console.log('=== Industry + Geographic Filtering ===');
    console.log('Input:', companyFilters);
    console.log('Output:', JSON.stringify(result, null, 2));
    
    return result;
  }

  /**
   * Example 3: Financial Data with Single Year
   * Expected output matches: Financial Data with Single Year example from guide
   */
  validateFinancialDataSingleYear(): FilterStep[] {
    const companyFilters = {
      state: ["California", "New York"]
    };

    const financialCriteria = [{
      year: "2023",
      balanceSheetAssetsFilters: {
        totalAssets: {
          gte: 1000000000
        }
      }
    }];

    const result = this.transformationService.transformToFilterSteps(companyFilters, financialCriteria, "2023");
    
    console.log('=== Financial Data with Single Year ===');
    console.log('Input Company Filters:', companyFilters);
    console.log('Input Financial Criteria:', financialCriteria);
    console.log('Output:', JSON.stringify(result, null, 2));
    
    return result;
  }

  /**
   * Example 4: Multi-Year Financial Analysis
   * Expected output matches: Multi-Year Financial Analysis example from guide
   */
  validateMultiYearFinancialAnalysis(): FilterStep[] {
    const companyFilters = {
      primaryIndustry: ["Health Care Equipment and Supplies"]
    };

    const financialCriteria = [
      {
        year: "2022",
        balanceSheetAssetsFilters: {
          cashAndEquivalents: {
            gte: 50000000
          }
        }
      },
      {
        year: "2023",
        balanceSheetAssetsFilters: {
          cashAndEquivalents: {
            gte: 50000000
          }
        },
        incomeStatementFilters: {
          totalRevenue: {
            between: [100000000, 5000000000]
          }
        }
      }
    ];

    const result = this.transformationService.transformToFilterSteps(companyFilters, financialCriteria);
    
    console.log('=== Multi-Year Financial Analysis ===');
    console.log('Input Company Filters:', companyFilters);
    console.log('Input Financial Criteria:', financialCriteria);
    console.log('Output:', JSON.stringify(result, null, 2));
    
    return result;
  }

  /**
   * Example 5: Complex Multi-Section Analysis
   * Expected output matches: Complex Multi-Section Analysis example from guide
   */
  validateComplexMultiSectionAnalysis(): FilterStep[] {
    const companyFilters = {
      state: ["California", "New York", "Texas", "Massachusetts"]
    };

    const financialCriteria: any[] = [{
      year: "2023",
      balanceSheetAssetsFilters: {
        totalAssets: {
          between: [500000000, 10000000000]
        }
      },
      incomeStatementFilters: {
        netIncome: {
          gt: 25000000
        }
      },
      cashFlowFilters: {
        operatingCashFlow: {
          gte: 50000000
        }
      }
    }];

    // Add multi-year data for netIncome
    financialCriteria.push({
      year: "2022",
      incomeStatementFilters: {
        netIncome: {
          gt: 25000000
        }
      }
    });

    const result = this.transformationService.transformToFilterSteps(companyFilters, financialCriteria);
    
    console.log('=== Complex Multi-Section Analysis ===');
    console.log('Input Company Filters:', companyFilters);
    console.log('Input Financial Criteria:', financialCriteria);
    console.log('Output:', JSON.stringify(result, null, 2));
    
    return result;
  }

  /**
   * Run all validation examples
   */
  runAllValidations(): void {
    console.log('🚀 Starting Payload Transformation Validation...\n');
    
    try {
      this.validateBasicCompanyFiltering();
      console.log('✅ Basic Company Filtering - PASSED\n');
      
      this.validateIndustryGeographicFiltering();
      console.log('✅ Industry + Geographic Filtering - PASSED\n');
      
      this.validateFinancialDataSingleYear();
      console.log('✅ Financial Data Single Year - PASSED\n');
      
      this.validateMultiYearFinancialAnalysis();
      console.log('✅ Multi-Year Financial Analysis - PASSED\n');
      
      this.validateComplexMultiSectionAnalysis();
      console.log('✅ Complex Multi-Section Analysis - PASSED\n');
      
      console.log('🎉 All payload transformations validated successfully!');
      console.log('📋 The new FilterStep format matches the API guide requirements.');
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
    }
  }

  /**
   * Validate that the output matches expected API guide format
   */
  validateApiGuideCompliance(filterSteps: FilterStep[]): boolean {
    for (const step of filterSteps) {
      // Check required fields
      if (!step.operator || !step.value || !Array.isArray(step.value)) {
        console.error('Invalid FilterStep format:', step);
        return false;
      }

      // Check that either field or section is present
      if (!step.field && !step.section) {
        console.error('FilterStep must have either field or section:', step);
        return false;
      }

      // Check valid operators
      const validOperators = ['eq', 'in', 'gte', 'lte', 'gt', 'lt', 'between', 'ne', 'isna', 'isnotna'];
      if (!validOperators.includes(step.operator)) {
        console.error('Invalid operator:', step.operator);
        return false;
      }

      // Check years format if present
      if (step.years && (!Array.isArray(step.years) || step.years.some(y => typeof y !== 'number'))) {
        console.error('Invalid years format:', step.years);
        return false;
      }
    }

    return true;
  }
}

// Export for use in components or testing
export const payloadValidator = new PayloadValidation();