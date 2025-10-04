import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from "@angular/router";
import { filter, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

interface MenuItem {
  label: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  expanded: boolean;
}

@Component({
  selector: "app-sidebar",
  imports: [RouterModule, CommonModule],
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.scss",
})
export class SidebarComponent implements OnInit, OnDestroy {
  router = inject(Router);
  activeRoute = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  private readonly STORAGE_KEY = 'sidebar-expanded-state';

  menuSections: MenuSection[] = [
    {
      title: "Company Profile",
      expanded: false,
      items: [
       
        { label: "Business Description", route: "business-info" },
        { label: "Corporate Governance", route: "#" },
        { label: "Compensation", route: "#" },
      ]
    },
    {
      title: "Comparables",
      expanded: false,
      items: [
        {
          label: "Peers",
          route: "#",
          children: [
            { label: "Highlights", route: "#" },
            { label: "Financial Data", route: "#" },
            { label: "Operating Statistics", route: "#" },
            { label: "Trading multiples", route: "#" },
          ],
          expanded: false,
        },
        { label: "Transaction", route: "#" },
      ]
    },
    {
      title: "Financials",
      expanded: false,
      items: [
        { label: "Income Statement", route: "income-statement" },
        { label: "Balance Sheet", route: "balance-sheet" },
        { label: "Cash Flow", route: "cash-flows" },
        { label: "Financial Ratio Analysis", route: "performance-analysis" },
        { label: "Transaction Multiples", route: "#" }
      ]
    },
    {
      title: "Transactions",
      expanded: false,
      items: [
        { label: "M&A", route: "#" },
        { label: "Offerings", route: "#" },
        { label: "Takeover Defense", route: "#" }
      ]
    },
    {
      title: "Corporate Issuance",
      expanded: false,
      items: [
        { label: "Bond", route: "#" },
        { label: "Equity", route: "#" }
      ]
    },
    {
      title: "Events and Filings",
      expanded: false,
      items: [
        { label: "Filings and Reports", route: "#" },
        { label: "Transcript and Investor Presentation", route: "#" }
      ]
    },
    {
      title: "Ownership",
      expanded: false,
      items: [
        { label: "Shareholder Ownership", route: "#" },
        { label: "Ownership Structure", route: "#" }
      ]
    }
  ];

  ngOnInit() {
    this.loadExpandedState();
    this.setInitialExpandedState();
    
    // Listen for route changes to maintain expanded state
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.setInitialExpandedState();
        this.saveExpandedState();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getRouterURL() {
    return this.router.url;
  }

  navigate(path: string) {
    if (path !== "#") {
      this.router.navigate([path], { queryParamsHandling: "preserve" });
    }
  }

  toggleSection(index: number) {
    this.menuSections[index].expanded = !this.menuSections[index].expanded;
    this.saveExpandedState();
  }

  isActive(route?: string): boolean {
    if (!route || route === "#") return false;
    return this.getRouterURL().includes(route);
  }

  private setInitialExpandedState() {
    const currentRoute = this.getRouterURL();
    
    this.menuSections.forEach(section => {
      // If section is already expanded (from localStorage), keep it expanded
      if (section.expanded) {
        return;
      }
      
      // Check if current route matches any item in this section
      const hasActiveRoute = section.items.some(item => {
        const selfActive = item.route && item.route !== '#' && currentRoute.includes(item.route);
        const childActive = (item.children || []).some(child => child.route && child.route !== '#' && currentRoute.includes(child.route as string));
        // Auto-expand the item if any child is active
        if (childActive) {
          item.expanded = true;
        }
        return selfActive || childActive;
      });
      
      if (hasActiveRoute) {
        section.expanded = true;
      }
    });
  }

  toggleItem(sectionIndex: number, itemIndex: number) {
    const item = this.menuSections[sectionIndex].items[itemIndex];
    if (!item.children || item.children.length === 0) {
      return;
    }
    item.expanded = !item.expanded;
    this.saveExpandedState();
  }

  private saveExpandedState() {
    const expandedState = this.menuSections.map(section => ({
      title: section.title,
      expanded: section.expanded,
      items: section.items
        .filter(i => i.children && i.children.length)
        .map(i => ({ label: i.label, expanded: !!i.expanded }))
    }));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(expandedState));
  }

  private loadExpandedState() {
    try {
      const savedState = localStorage.getItem(this.STORAGE_KEY);
      if (savedState) {
        const expandedState = JSON.parse(savedState);
        this.menuSections.forEach(section => {
          const savedSection = expandedState.find((s: any) => s.title === section.title);
          if (savedSection) {
            section.expanded = savedSection.expanded;
            if (Array.isArray(savedSection.items)) {
              section.items.forEach(item => {
                if (item.children && item.children.length) {
                  const savedItem = savedSection.items.find((it: any) => it.label === item.label);
                  if (savedItem) {
                    item.expanded = !!savedItem.expanded;
                  }
                }
              });
            }
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load sidebar expanded state:', error);
    }
  }
}
