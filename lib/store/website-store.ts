import { create } from "zustand";

// Website interfaces
interface Website {
  id: string;
  name: string;
  domain: string;
  createdAt: string; // Add this field
}

// BlogPost interfaces
interface BlogPost {
  _id: string;
  siteId: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  tags?: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ImageUpload interfaces
interface ImageUpload {
  _id: string;
  siteId: string;
  page: string;
  url: string;
  altText: string;
  uploadedAt: Date;
}

// MetaTitle interfaces
interface MetaTitle {
  _id: string;
  siteId: string;
  url: string;
  metaTitleAr: string;
  metaTitleEn: string;
  length: number;
  updatedAt: Date;
}

// MetaDescription interfaces
interface MetaDescription {
  _id: string;
  siteId: string;
  url: string;
  metaDescriptionAr: string;
  metaDescriptionEn: string;
  length: number;
  updatedAt: Date;
}

// Redirect interfaces
interface Redirect {
  _id: string;
  siteId: string;
  fromPath: string;
  toPath: string;
  createdAt: Date;
}

// SlugControl interfaces
interface SlugControl {
  _id: string;
  siteId: string;
  pageTitle: string;
  currentSlug: string;
  newSlug: string;
  updatedAt: Date;
}

// PageContent interfaces
interface PageContent {
  _id: string;
  siteId: string;
  url: string;
  title: string;
  description?: string;
  slug: string;
  content?: string;
  images: Array<{ url: string; alt: string }>;
  createdAt: Date;
  updatedAt: Date;
}

// Sitemap interfaces
interface SitemapUrl {
  loc: string;
  lastModified: Date;
  priority: number;
  changeFreq:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
}

interface Sitemap {
  _id: string;
  siteId: string;
  lastGenerated: Date;
  urls: SitemapUrl[];
}

interface Page {
  _id: string;
  title: string;
  slug: string;
  metaTitleAr: string;
  metaTitleEn: string;
  metaDescriptionAr: string;
  metaDescriptionEn: string;
  content: string;
  status: "draft" | "published";
  lastModified: string;
  isHomePage: boolean;
  order: number;
}

interface WebsiteState {
  // Website data
  websites: Website[];
  selectedWebsite: Website | null;

  // Data collections for each schema
  blogPosts: BlogPost[];
  imageUploads: ImageUpload[];
  metaTitles: MetaTitle[];
  metaDescriptions: MetaDescription[];
  redirects: Redirect[];
  slugControls: SlugControl[];
  pageContents: PageContent[];
  sitemap: Sitemap | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWebsites: () => Promise<void>;
  selectWebsite: (websiteId: string) => void;
  clearError: () => void;

  pages: Page[];
  fetchPages: (websiteId: string) => Promise<void>;
}

export const useWebsiteStore = create<WebsiteState>((set, get) => ({
  // Website data
  websites: [],
  selectedWebsite: null,

  // Data collections - initialized as empty
  blogPosts: [],
  imageUploads: [],
  metaTitles: [],
  metaDescriptions: [],
  redirects: [],
  slugControls: [],
  pageContents: [],
  sitemap: null,

  // UI state
  isLoading: false,
  error: null,

  fetchWebsites: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/websites/websites");
      if (!response.ok) {
        throw new Error("Failed to fetch websites");
      }
      const data = await response.json();
      console.log("Fetched websites:", data);
      set({ websites: data, isLoading: false });

      // Select the first website by default if none is selected
      if (!get().selectedWebsite && data.length > 0) {
        set({ selectedWebsite: data[0] });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        isLoading: false,
      });
    }
  },

  selectWebsite: (websiteId: string) => {
    const { websites } = get();
    const website = websites.find((site) => site.id === websiteId);
    if (website) {
      set({ selectedWebsite: website });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  pages: [],
  fetchPages: async (websiteId: string) => {
    if (!websiteId) {
      set({ error: "No website selected" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `/api/websites/pages?websiteId=${websiteId}`,
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch pages");
      }
      const data = await response.json();
      set({ pages: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching pages:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch pages",
        isLoading: false,
      });
    }
  },
}));
