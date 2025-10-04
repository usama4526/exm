import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayloadTransformationService } from '../../services/payload-transformation.service';
import { ApiService } from '../../services/api.service';
import { FilterStep } from '../../models/filter-interfaces';

interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  payload: any;
  transformedPayload?: FilterStep[];
  error?: string;
}

interface DebugLog {
  timestamp: string;
  message: string;
}

@Component({
  selector: 'app-payload-debug-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payload-debug-test.component.html',
  styleUrl: './payload-debug-test.component.scss'
})
export class PayloadDebugTestComponent {
  private transformationService = inject(PayloadTransformationService);
  private apiService = inject(ApiService);

  testResults: TestResult[] = [];
  debugLogs: DebugLog[] = [];

  // Test payloads
  private readonly TEST_PAYLOADS = {
    totalAssets: [
      {
        "section": "company",
        "field": "state", 
        "operator": "in",
        "value": ["Delaware", "New York", "California"]
      },
      {
        "section": "balanceSheetAssets",
        "field": "totalAssets",
        "operator": "gt",
        "value": "100",
        "years": [2023]
      }
    ],
    totalEquity: [
      {
        "section": "company",
        "field": "state",
        "operator": "in", 
        "value": ["Delaware", "New York", "California"]
      },
      {
        "section": "balanceSheetEquityFilters",
        "field": "totalEquity",
        "operator": "gt",
        "value": ["100"],
        "years": [2023]
      }
    ],
    totalLiabilities: [
      {
        "section": "company",
        "field": "state",
        "operator": "in",
        "value": ["Delaware", "New York"]
      },
      {
        "section": "balanceSheetLiabilitiesFilters", 
        "field": "totalLiabilities",
        "operator": "gte",
        "value": ["50"],
        "years": [2023]
      }
    ],
    multipleFilters: [
      {
        "section": "company",
        "field": "state",
        "operator": "in",
        "value": ["Delaware", "New York"]
      },
      {
        "section": "balanceSheetAssets",
        "field": "totalAssets", 
        "operator": "gt",
        "value": "1000",
        "years": [2023]
      },
      {
        "section": "balanceSheetEquityFilters",
        "field": "totalEquity",
        "operator": "gt", 
        "value": ["500"],
        "years": [2023]
      }
    ],
    betweenOperator: [
      {
        "section": "company",
        "field": "state",
        "operator": "in",
        "value": ["Delaware"]
      },
      {
        "section": "balanceSheetEquityFilters",
        "field": "totalEquity",
        "operator": "between",
        "value": ["100", "1000"],
        "years": [2023]
      }
    ]
  };

  runAllTests(): void {
    this.clearResults();
    this.addDebugLog('🚀 Starting comprehensive payload tests...');
    
    this.testTotalAssets();
    this.testTotalEquity();
    this.testTotalLiabilities();
    this.testMultipleFilters();
    this.testBetweenOperator();
    
    this.addDebugLog('✅ All tests completed');
  }

  testTotalAssets(): void {
    this.runTest('Total Assets (Working Baseline)', this.TEST_PAYLOADS.totalAssets);
  }

  testTotalEquity(): void {
    this.runTest('Total Equity (Previously Failing - Now Fixed)', this.TEST_PAYLOADS.totalEquity);
  }

  testTotalLiabilities(): void {
    this.runTest('Total Liabilities', this.TEST_PAYLOADS.totalLiabilities);
  }

  testMultipleFilters(): void {
    this.runTest('Multiple Balance Sheet Filters', this.TEST_PAYLOADS.multipleFilters);
  }

  testBetweenOperator(): void {
    this.runTest('Between Operator (Should use array format)', this.TEST_PAYLOADS.betweenOperator);
  }

  private runTest(testName: string, payload: any): void {
    this.addDebugLog(`🔍 Testing: ${testName}`);
    
    try {
      // Test the API call
      this.apiService.getProgressiveCounts(payload).subscribe({
        next: (response: any) => {
          const responseInfo = response?.counts ?
            `Response received with ${response.counts.length} counts` :
            `Response received with totalCount: ${response?.totalCount || 'unknown'}`;
          
          this.addTestResult({
            testName,
            success: true,
            message: `API call successful. ${responseInfo}`,
            payload,
            transformedPayload: payload
          });
          this.addDebugLog(`✅ ${testName}: SUCCESS`);
        },
        error: (error) => {
          this.addTestResult({
            testName,
            success: false,
            message: 'API call failed',
            payload,
            error: error.message || JSON.stringify(error)
          });
          this.addDebugLog(`❌ ${testName}: FAILED - ${error.message}`);
        }
      });
    } catch (error: any) {
      this.addTestResult({
        testName,
        success: false,
        message: 'Test execution failed',
        payload,
        error: error.message || JSON.stringify(error)
      });
      this.addDebugLog(`❌ ${testName}: ERROR - ${error.message}`);
    }
  }

  private addTestResult(result: TestResult): void {
    this.testResults.push(result);
  }

  private addDebugLog(message: string): void {
    this.debugLogs.push({
      timestamp: new Date().toLocaleTimeString(),
      message
    });
  }

  clearResults(): void {
    this.testResults = [];
    this.debugLogs = [];
  }
}