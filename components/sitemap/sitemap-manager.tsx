"use client";

import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useWebsiteStore } from "@/lib/store/website-store";

// Mock data - in a real app, this would come from MongoDB
const sitemapUrls = [
  {
    url: "/",
    lastModified: "2023-10-15",
    priority: "1.0",
    changeFreq: "weekly",
  },
  {
    url: "/about",
    lastModified: "2023-09-22",
    priority: "0.8",
    changeFreq: "monthly",
  },
  {
    url: "/services",
    lastModified: "2023-10-10",
    priority: "0.8",
    changeFreq: "monthly",
  },
  {
    url: "/contact",
    lastModified: "2023-08-05",
    priority: "0.5",
    changeFreq: "monthly",
  },
  {
    url: "/blog",
    lastModified: "2023-10-18",
    priority: "0.9",
    changeFreq: "daily",
  },
  {
    url: "/blog/getting-started-with-seo",
    lastModified: "2023-05-15",
    priority: "0.7",
    changeFreq: "yearly",
  },
  {
    url: "/blog/advanced-seo-techniques",
    lastModified: "2023-06-22",
    priority: "0.7",
    changeFreq: "yearly",
  },
  {
    url: "/blog/importance-of-meta-tags",
    lastModified: "2023-07-10",
    priority: "0.7",
    changeFreq: "yearly",
  },
];

interface SitemapUrl {
  url: string;
  lastModified: string;
  priority: string;
  changeFreq: string;
}

export function SitemapManager() {
  const { toast } = useToast();
  const selectedWebsite = useWebsiteStore((state) => state.selectedWebsite);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState("2023-10-18T14:30:00Z");
  const [sitemapData, setSitemapData] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedUrls, setParsedUrls] = useState<SitemapUrl[]>([]);

  const parseXmlData = (xmlString: string): SitemapUrl[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const urls = xmlDoc.getElementsByTagName("url");
    const parsedData: SitemapUrl[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      parsedData.push({
        url: url.getElementsByTagName("loc")[0]?.textContent || "",
        lastModified: url.getElementsByTagName("lastmod")[0]?.textContent || "",
        priority: url.getElementsByTagName("priority")[0]?.textContent || "",
        changeFreq:
          url.getElementsByTagName("changefreq")[0]?.textContent || "",
      });
    }

    return parsedData;
  };

  const regenerateSitemap = async () => {
    setIsRegenerating(true);
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://www.darbproductions.com/api/sitemap/sitemap",
      );
      if (!response.ok) {
        throw new Error("Failed to fetch sitemap");
      }
      console.log(`000000000`);
      const data = await response.text();
      console.log(`1111111111`);
      setSitemapData(data);
      console.log(`222222222`);
      const parsedData = parseXmlData(data);
      setParsedUrls(parsedData);
      console.log(`3333333333`);
      setLastGenerated(new Date().toISOString());
      console.log(`4444444444444`);
      toast({
        title: "Sitemap regenerated",
        description: "Your sitemap has been successfully regenerated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate sitemap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
      setIsLoading(false);
    }
  };

  const downloadSitemap = () => {
    if (sitemapData) {
      const blob = new Blob([sitemapData], { type: "application/xml" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sitemap.xml";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Sitemap downloaded",
        description: "Your sitemap.xml file has been downloaded.",
      });
    }
  };

  // Generate XML sitemap preview
  const generateXmlSitemap = () => {
    if (isLoading) {
      return "Loading sitemap data...";
    }
    return (
      sitemapData ||
      "No sitemap data available. Click 'Regenerate' to fetch the latest sitemap."
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Last generated:{" "}
            <time dateTime={lastGenerated}>
              {new Date(lastGenerated).toLocaleString()}
            </time>
          </p>
          <p className="text-sm text-muted-foreground">
            URL: https://{selectedWebsite?.domain || "example.com"}/sitemap.xml
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadSitemap}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={regenerateSitemap} disabled={isRegenerating}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`}
            />
            Regenerate
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="xml">XML</TabsTrigger>
          <TabsTrigger value="urls">URLs</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="space-y-4">
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold">
                    URL
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold">
                    Last Modified
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold">
                    Priority
                  </th>
                  <th className="px-4 py-3.5 text-left text-sm font-semibold">
                    Change Frequency
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-sm text-center">
                      Loading sitemap data...
                    </td>
                  </tr>
                ) : parsedUrls.length > 0 ? (
                  parsedUrls.map((item, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap px-4 py-2 text-sm font-medium">
                        {item.url}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm">
                        {item.lastModified}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm">
                        {item.priority}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm">
                        {item.changeFreq}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-sm text-center">
                      No sitemap data available. Click 'Regenerate' to fetch the
                      latest sitemap.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="xml">
          <Card>
            <CardContent className="p-4">
              <pre className="overflow-auto rounded-md bg-muted p-4 text-xs">
                {generateXmlSitemap()}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="urls" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              {isLoading ? (
                <p className="text-sm text-center">Loading URLs...</p>
              ) : parsedUrls.length > 0 ? (
                <ul className="space-y-2">
                  {parsedUrls.map((item, index) => (
                    <li key={index} className="text-sm">
                      {item.url}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-center">
                  No URLs available. Click 'Regenerate' to fetch the latest
                  sitemap.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="rounded-md border bg-muted/50 p-4">
        <h3 className="mb-2 font-medium">Sitemap Information</h3>
        <p className="text-sm text-muted-foreground">
          Your sitemap is automatically updated whenever you add, modify, or
          delete pages on your website. Search engines use this file to discover
          and index your content more efficiently.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          For best results, submit your sitemap URL to Google Search Console and
          other search engine webmaster tools.
        </p>
      </div>
    </div>
  );
}
