import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CheckboxNode } from "../../pages/screening/screening.component";

import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { TreeNodeComponent } from "../tree-node/tree-node.component";

export interface SelectionPayload {
  grouped: {
    GICS_SECTOR?: string[];
    GICS_GROUP?: string[];
    GICS_PRIMARY_INDUSTRY?: string[];
  };
  minimal: string[];
}
@Component({
  selector: "app-nested-checkboxes",
  imports: [CommonModule, FormsModule, TreeNodeComponent],
  templateUrl: "./nested-checkboxes.component.html",
  styleUrl: "./nested-checkboxes.component.scss",
})
export class NestedCheckboxesComponent {
  @Input() checkboxData: CheckboxNode[] = [];
  @Input() clearSectorSelection!: boolean;
  @Input() clearLocationSelection!: boolean;

  @Output() onClearSectorSelection = new EventEmitter<any>();
  @Output() onClearLocationSelection = new EventEmitter<any>();
  /** emits both grouped & minimal arrays */
  @Output() selectionChange = new EventEmitter<SelectionPayload>();

  onNodeToggled({ node, checked }: { node: CheckboxNode; checked: boolean }) {
    this.cascadeDown(node, checked);
    this.refreshParents(this.checkboxData);
    this.emitAll();
  }

  private cascadeDown(node: CheckboxNode, checked: boolean) {
    node.checked = checked;
    node.children?.forEach((c) => this.cascadeDown(c, checked));
  }

  private refreshParents(nodes: CheckboxNode[]): boolean {
    // returns true if any descendant is checked
    let any = false;
    for (const n of nodes) {
      let childAny = false;
      if (n.children) {
        childAny = this.refreshParents(n.children);
        // parent is checked only if *all* children are checked
        n.checked = n.children.every((c) => c.checked);
      }
      // leaf:
      if (!n.children?.length && n.checked) {
        childAny = true;
      }
      if (childAny) any = true;
    }
    return any;
  }

  private emitAll() {
    const grouped = this.buildGrouped();
    const minimal = this.buildMinimal(this.checkboxData);
    this.selectionChange.emit({ grouped, minimal });
  }

  private buildGrouped() {
    const sectors = new Set<string>();
    const groups = new Set<string>();
    const primaries = new Set<string>();
    const geographies = new Set<string>();
    const countries = new Set<string>();
    const regions = new Set<string>();
    const states = new Set<string>();
    const provinces = new Set<string>();

    // helper: does this node or any child under it have checked=true?
    const hasCheckedDescendant = (n: CheckboxNode): boolean => {
      if (n.checked && (!n.children || n.children.length === 0)) {
        // a checked leaf
        return true;
      }
      return (
        !!n.children && n.children.some((child) => hasCheckedDescendant(child))
      );
    };

    // helper: are all children of this node checked?
    const areAllChildrenChecked = (n: CheckboxNode): boolean => {
      if (!n.children || n.children.length === 0) return false;
      return n.children.every((child) => {
        if (!child.children || child.children.length === 0) {
          return child.checked;
        }
        return areAllChildrenChecked(child);
      });
    };

    // walk the tree:
    const walk = (n: CheckboxNode) => {
      // Handle GICS hierarchy
      if (n.type === "GICS_SECTOR" && hasCheckedDescendant(n)) {
        sectors.add(n.name);
      }
      if (n.type === "GICS_GROUP" && hasCheckedDescendant(n)) {
        groups.add(n.name);
      }
      if (n.type === "GICS_PRIMARY_INDUSTRY" && hasCheckedDescendant(n)) {
        primaries.add(n.name);
      }

      // Handle Location hierarchy
      if (n.keyValue === "STATE" && n.checked) {
        states.add(n.name);
      }
      if (n.keyValue === "US_REGION" && hasCheckedDescendant(n)) {
        // Add region if it has checked descendants or if it's directly checked
        if (n.checked || areAllChildrenChecked(n)) {
          regions.add(n.name);
        }
      }
      if (n.keyValue === "COUNTRY_NAME" && hasCheckedDescendant(n)) {
        // Add country if it has checked descendants or if it's directly checked
        if (n.checked || areAllChildrenChecked(n)) {
          countries.add(n.name);
        }
      }
      if (n.keyValue === "PROVINCE" && hasCheckedDescendant(n)) {
        // Add province if it has checked descendants or if it's directly checked
        if (n.checked || areAllChildrenChecked(n)) {
          provinces.add(n.name);
        }
      }
      if (n.keyValue === "GEOGRAPHY" && hasCheckedDescendant(n)) {
        // Add geography if it has checked descendants or if it's directly checked
        if (n.checked || areAllChildrenChecked(n)) {
          geographies.add(n.name);
        }
      }

      // Handle leaf nodes for GICS
      if ((!n.children || n.children.length === 0) && n.checked && n.type) {
        primaries.add(n.name);
      }

      n.children?.forEach(walk);
    };

    this.checkboxData.forEach(walk);

    // Create the result object
    const result: any = {
      GICS_SECTOR: Array.from(sectors),
      GICS_GROUP: Array.from(groups),
      GICS_PRIMARY_INDUSTRY: Array.from(primaries),
    };

    // Add all non-empty location arrays
    if (states.size > 0) {
      result.STATE = Array.from(states);
    }
    if (regions.size > 0) {
      result.US_REGION = Array.from(regions);
    }
    if (countries.size > 0) {
      result.COUNTRY_NAME = Array.from(countries);
    }
    if (geographies.size > 0) {
      result.GEOGRAPHY = Array.from(geographies);
    }
    if (provinces.size > 0) {
      result.PROVINCE = Array.from(provinces);
    }

    return result;
  }

  private buildMinimal(nodes: CheckboxNode[]): string[] {
    const result: string[] = [];

    const helper = (n: CheckboxNode) => {
      // if entire subtree is checked, grab this node and STOP
      const allDesc = this.nodeOrDescChecked(n);
      if (allDesc) {
        result.push(n.name);
      } else if (n.children && n.children.length) {
        // subtree partially selected: dive into children
        n.children.forEach((child) => helper(child));
      } else if (n.checked) {
        // leaf selected
        result.push(n.name);
      }
    };

    nodes.forEach(helper);
    return result;
  }

  private nodeOrDescChecked(n: CheckboxNode): boolean | undefined {
    if (!n.children || !n.children.length) return n.checked;
    return n.children.every((c) => this.nodeOrDescChecked(c));
  }

  onClearSector($event: any) {
    this.clearSectorSelection = false;
    this.onClearSectorSelection.emit(false);
  }
  onClearLocation($event: any) {
    this.clearLocationSelection = false;
    this.onClearLocationSelection.emit(false);
  }
}
