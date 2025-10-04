import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { LabelType, Options } from "@angular-slider/ngx-slider";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
  ChangeDetectorRef,
  Renderer2,
  inject,
} from "@angular/core";
import {
  NgbModule,
  NgbModal,
  NgbModalRef,
  NgbCarousel,
} from "@ng-bootstrap/ng-bootstrap";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { MarkdownModule, MarkdownService } from "ngx-markdown";
import { ApiService } from "../../services/api.service";
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  standalone: true,
  selector: "app-business-info",
  imports: [
    NgbModule,
    NgxSliderModule,
    CommonModule,
    MarkdownModule,
    SidebarComponent,
  ],
  templateUrl: "./business-info.component.html",
  styleUrl: "./business-info.component.scss",
})
export class BusinessInfoComponent implements OnInit {
  constructor(
    private router: Router,
    private http: HttpClient,
    private modalService: NgbModal,
    private markdownService: MarkdownService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
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

  getRouterURL() {
    return this.router.url;
  }
  navigate(url: string) {
    this.router.navigate([url]);
  }
  showHeadings: boolean = false;
  financials: any = [];
  htmlContent: string = "";
  htmlContentLeft: string = "";
  htmlContentRight: string = "";
  headings: { id: string; level: number; text: string }[] = [];

  // Carousel properties
  carouselSlides: {
    title: string;
    content: string;
    contentLeft: string;
    contentRight: string;
    id: string;
    needsTwoColumns: boolean;
  }[] = [];
  currentSlideIndex: number = 0;
  showCarousel: boolean = true; // Default to carousel view

  @ViewChild("contentContainer", { static: false })
  contentContainer!: ElementRef;
  @ViewChild("carousel", { static: false }) carousel!: NgbCarousel;
  _activeRoute = inject(ActivatedRoute);
  _apiService = inject(ApiService);
  ngOnInit() {
    this._activeRoute.queryParams.subscribe((params) => {
      const ticker = params["ticker"];
      const id = params["id"];
      this._apiService.getCompanyBusinessInfo(ticker).subscribe({
        next: (res) => {
          console.log(res);
          this.htmlContent = res.markdown;

          const midpoint = Math.floor(res.markdown.length / 2);

          // Smart split: avoid cutting mid-word
          const leftEnd = res.markdown.indexOf("\n", midpoint);
          this.htmlContentLeft = res.markdown.slice(0, leftEnd);
          this.htmlContentRight = res.markdown.slice(leftEnd);

          // Create carousel slides from content
          this.createCarouselSlides(res.markdown);
        },
        error: (err) => {
          console.log(err);
        },
      });
    });

    // this.http
    //   .get("assets/business_desc.md", { responseType: "text" })
    //   .subscribe((data) => {
    //     this.htmlContent = data;

    //     const midpoint = Math.floor(data.length / 2);

    //     // Smart split: avoid cutting mid-word
    //     const leftEnd = data.indexOf("\n", midpoint);
    //     this.htmlContentLeft = data.slice(0, leftEnd);
    //     this.htmlContentRight = data.slice(leftEnd);

    //     // Create carousel slides from content
    //     this.createCarouselSlides(data);
    //   });
  }

  createCarouselSlides(content: string): void {
    // Split content by headings (lines that start with **)
    const sections = content
      .split(/(?=^\*\*[^*]+\*\*)/m)
      .filter((section) => section.trim());

    this.carouselSlides = sections.map((section, index) => {
      const lines = section.split("\n");
      const titleLine = lines[0];
      // Extract title from **Title** format
      const titleMatch = titleLine.match(/\*\*([^*]+)\*\*/);
      const title = titleMatch ? titleMatch[1].trim() : titleLine.trim();

      // Keep the original markdown format for the content, including the heading
      const content = section.trim();

      // Check if content is long enough to need 2 columns (more than 1000 characters)
      const needsTwoColumns = content.length > 1000;
      console.log(
        `Slide ${index}: ${title}, Content length: ${content.length}, Needs 2 columns: ${needsTwoColumns}`
      );

      // Split content for 2 columns if needed
      let contentLeft = "";
      let contentRight = "";

      if (needsTwoColumns) {
        const midpoint = Math.floor(content.length / 2);
        const leftEnd = content.indexOf("\n", midpoint);
        contentLeft = content.slice(0, leftEnd);
        contentRight = content.slice(leftEnd);
      }

      return {
        title: title || `Section ${index + 1}`,
        content: content,
        contentLeft: contentLeft,
        contentRight: contentRight,
        id: `slide-${index}`,
        needsTwoColumns: needsTwoColumns,
      };
    });

    // If no sections found, create a single slide
    if (this.carouselSlides.length === 0) {
      this.carouselSlides = [
        {
          title: "Business Description",
          content: content,
          contentLeft: "",
          contentRight: "",
          id: "slide-0",
          needsTwoColumns: content.length > 1000,
        },
      ];
    }

    this.cdr.detectChanges();

    // Extract headings for sidebar
    this.extractCarouselHeadings();
  }

  onMarkdownReady() {
    // Headings are already extracted in createCarouselSlides
    // No need to extract again
  }

  // Extract headings from carousel content
  extractCarouselHeadings(): void {
    // Extract main headings from carousel slides for table of contents
    this.headings = [];

    this.carouselSlides.forEach((slide, index) => {
      // Extract main heading from slide title (removes ** from **Heading**)
      const title = slide.title.replace(/\*\*/g, "");

      this.headings.push({
        id: slide.id,
        level: 1,
        text: title,
      });
    });

    this.showHeadings = true;
    this.cdr.detectChanges();
  }

  toggleHeadings() {
    this.showHeadings = !this.showHeadings;
  }

  toggleView() {
    this.showCarousel = !this.showCarousel;
  }

  handleNavAndToggle() {
    if (this.router.url !== "/business-info") {
      this.router.navigate(["/business-info"]);
    } else {
      this.toggleHeadings();
    }
  }

  // Carousel navigation methods
  nextSlide() {
    if (this.carousel) {
      this.carousel.next();
    }
  }

  prevSlide() {
    if (this.carousel) {
      this.carousel.prev();
    }
  }

  goToSlide(index: number) {
    if (this.carousel) {
      this.carousel.select(`slide-${index}`);
    }
  }

  onSlideChange(event: any) {
    this.currentSlideIndex = parseInt(event.current.replace("slide-", ""));
  }

  //  extractHeadings(): void {
  //   if (this.contentContainer) {
  //     const strongTags = this.contentContainer.nativeElement.querySelectorAll('p > strong') as NodeListOf<HTMLElement>;

  //     const headings: { id: string; level: number; text: string }[] = [];
  //     Array.from(strongTags).forEach((el: HTMLElement, i) => {
  //       const parent = el.parentElement;
  //       if (parent && el.textContent?.trim() === parent.textContent?.trim()) {
  //         const id = `heading-${i}`;
  //         this.renderer.setAttribute(parent, 'id', id);
  //         headings.push({
  //           id,
  //           level: 2,
  //           text: el.textContent?.trim() || '',
  //         });
  //       }
  //     });

  //     this.headings = headings;
  //     if (this.router.url === '/business-info') {
  //       this.showHeadings = true;
  //     }

  //     this.cdr.detectChanges();
  //   }
  // }

  scrollTo(id: string): void {
    // Check if we're in carousel view
    if (this.showCarousel && this.carouselSlides.length > 0) {
      // Find the slide index by id
      const slideIndex = this.carouselSlides.findIndex(
        (slide) => slide.id === id
      );
      if (slideIndex !== -1 && this.carousel) {
        this.carousel.select(id);
        this.currentSlideIndex = slideIndex;
      }
    } else {
      // Original two-column view logic
      const container = this.contentContainer.nativeElement;

      // Temporarily disable columns
      container.style.columnCount = "1";

      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        element.classList.add("highlight");

        setTimeout(() => {
          element.classList.remove("highlight");
          container.style.columnCount = "2"; // Restore after scroll
        }, 1500);
      }
    }
  }
}
