"use client";

import { useEffect, useReducer, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Search, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useWebsiteStore } from "@/lib/store/website-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Page {
  uuid: any;
  _id: string;
  title: string;
  slug: string;
  page404from?: string;
  RedirectPage?: string;
  is404Page: boolean;
  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescriptionAr?: string;
  metaDescriptionEn?: string;
  content?: string;
  status?: string;
  lastModified?: string;
  isHomePage?: boolean;
  order?: number;
}

interface NewRedirect {
  uuid: string;
  originalId?: string;
  fromPath: string;
  toPath: string;
  tempId?: string;
  isModified?: boolean;
}

const redirectSchema = z.object({
  fromPath: z
    .string()
    .min(1, { message: "Source path is required" })
    .startsWith("/", { message: "Path must start with /" })
    .refine((val) => val !== "//", "Invalid slug"),
  toPath: z
    .string()
    .min(1, { message: "Destination path is required" })
    .startsWith("/", { message: "Path must start with /" })
    .refine((val) => val !== "//", "Invalid slug"),
});

const formSchema = z.object({
  search: z.string().optional(),
  redirects: z.array(redirectSchema),
});

interface State {
  pages: Page[];
  loading: boolean;
  error: string | null;
}

interface NewRedirectsState {
  newRedirects: NewRedirect[];
}

type Action =
  | { type: "SET_PAGES"; payload: Page[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_PAGE"; payload: Page }
  | { type: "REMOVE_PAGE"; payload: number };

type NewRedirectsAction =
  | { type: "ADD_NEW_REDIRECT"; payload: NewRedirect }
  | {
      type: "UPDATE_EXISTING_REDIRECT";
      payload: { originalId: string; fromPath: string; toPath: string };
    }
  | {
      type: "UPDATE_NEW_REDIRECT";
      payload: { uuid: string; fromPath?: string; toPath?: string };
    }
  | { type: "REMOVE_NEW_REDIRECT"; payload: string }
  | { type: "CLEAR_NEW_REDIRECTS" }
  | { type: "SET_NEW_REDIRECTS"; payload: NewRedirect[] };

const initialState: State = {
  pages: [],
  loading: true,
  error: null,
};

const initialNewRedirectsState: NewRedirectsState = {
  newRedirects: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PAGES":
      return { ...state, pages: action.payload, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "ADD_PAGE":
      return { ...state, pages: [...state.pages, action.payload] };
    case "REMOVE_PAGE":
      return {
        ...state,
        pages: state.pages.filter((_, i) => i !== action.payload),
      };
    default:
      return state;
  }
}

function newRedirectsReducer(
  state: NewRedirectsState,
  action: NewRedirectsAction,
): NewRedirectsState {
  switch (action.type) {
    case "ADD_NEW_REDIRECT":
      return {
        ...state,
        newRedirects: [...state.newRedirects, action.payload],
      };
    case "UPDATE_NEW_REDIRECT":
      return {
        ...state,
        newRedirects: state.newRedirects.map((redirect) =>
          redirect.uuid === action.payload.uuid
            ? {
                ...redirect,
                ...(action.payload.fromPath !== undefined && {
                  fromPath: action.payload.fromPath,
                }),
                ...(action.payload.toPath !== undefined && {
                  toPath: action.payload.toPath,
                }),
              }
            : redirect,
        ),
      };
    case "REMOVE_NEW_REDIRECT":
      return {
        ...state,
        newRedirects: state.newRedirects.filter(
          (redirect) => redirect.uuid !== action.payload,
        ),
      };
    case "CLEAR_NEW_REDIRECTS":
      return {
        ...state,
        newRedirects: [],
      };
    case "SET_NEW_REDIRECTS":
      return {
        ...state,
        newRedirects: action.payload,
      };
    default:
      return state;
  }
}

export function RedirectsForm() {
  const { toast } = useToast();
  const { selectedWebsite } = useWebsiteStore();
  const [deleted, setDeleted] = useState<number>();

  const [state, dispatch] = useReducer(reducer, initialState);
  const [newRedirectsState, dispatchNewRedirects] = useReducer(
    newRedirectsReducer,
    initialNewRedirectsState,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
      redirects: [],
    },
  });

  useEffect(() => {
    async function fetchPages() {
      if (!selectedWebsite?.id) return;
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const res = await fetch(
          `/api/websites/pages?websiteId=${selectedWebsite.id}`,
        );
        if (!res.ok) throw new Error("Failed to fetch pages");
        const data = await res.json();
        console.log("pages", data);
        const pagesArray = Array.isArray(data) ? data : [];
        dispatch({ type: "SET_PAGES", payload: pagesArray });

        const existingRedirectPages = pagesArray.filter(
          (page: Page) => page.RedirectPage,
        );

        const existingRedirects = existingRedirectPages.map((page) => ({
          fromPath: `/${page.slug}`,
          toPath: page.RedirectPage || "",
        }));

        const newRedirectsForForm = newRedirectsState.newRedirects.map(
          (nr) => ({
            fromPath: nr.fromPath,
            toPath: nr.toPath,
          }),
        );

        form.setValue("redirects", [
          ...existingRedirects,
          ...newRedirectsForForm,
        ]);
      } catch (error) {
        console.error("Error fetching pages:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to load redirects" });
        toast({
          title: "Error",
          description: "Failed to load redirects",
          variant: "destructive",
        });
      }
    }

    fetchPages();
  }, [selectedWebsite, form, toast, deleted]);

  function getAvailablePages(
    index: number,
    currentPath: string,
    field: "fromPath" | "toPath",
  ) {
    const currentRedirects = form.getValues().redirects;
    const usedPaths = currentRedirects?.map((r) => r[field]) || [];

    // Get the other field's value (if from, get to, and vice versa)
    const otherField = field === "fromPath" ? "toPath" : "fromPath";
    const otherValue = currentRedirects[index]?.[otherField];

    return state.pages.filter((page) => {
      if (!page || !page.slug) return false;
      const path = `/${page.slug}`;

      // If this is the current path, allow it
      if (path === currentPath) return true;

      // Don't show the page if it's selected in the other dropdown
      if (path === otherValue) return false;

      // Don't show if used in other redirects
      return !usedPaths.includes(path);
    });
  }

  function isNewRedirect(index: number): boolean {
    const existingRedirectsCount = state.pages.filter(
      (page) => page.RedirectPage,
    ).length;
    return index >= existingRedirectsCount;
  }

  function getNewRedirectByIndex(index: number): NewRedirect | null {
    const existingRedirectsCount = state.pages.filter(
      (page) => page.RedirectPage,
    ).length;
    const newRedirectIndex = index - existingRedirectsCount;
    return newRedirectsState.newRedirects[newRedirectIndex] || null;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    dispatch({ type: "SET_ERROR", payload: null });

    if (!selectedWebsite?.id) {
      dispatch({
        type: "SET_ERROR",
        payload: "No website selected. Please select a website first.",
      });
      return;
    }

    try {
      const newRedirects = newRedirectsState.newRedirects.filter(
        (r) => !r.originalId,
      );
      const modifiedRedirects = newRedirectsState.newRedirects.filter(
        (r) => r.originalId,
      );

      for (const redirect of modifiedRedirects) {
        const originalPage = state.pages.find(
          (p) => p.uuid === redirect.originalId,
        );
        const toPage = state.pages.find(
          (p) => `/${p.slug}` === redirect.toPath,
        );

        if (!originalPage || !toPage) {
          dispatch({
            type: "SET_ERROR",
            payload: `Page not found: ${redirect.fromPath} or ${redirect.toPath}`,
          });
          return;
        }

        const fromResponse = await fetch(
          `/api/websites/pages?websiteId=${selectedWebsite.id}&pageuuid=${originalPage.uuid}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              RedirectPage: redirect.toPath,
              page404from: null,
              is404Page: true,
            }),
          },
        );

        if (!fromResponse.ok) throw new Error("Failed to update source page");

        const toResponse = await fetch(
          `/api/websites/pages?websiteId=${selectedWebsite.id}&pageuuid=${toPage.uuid}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              page404from: redirect.fromPath,
              RedirectPage: null,
              is404Page: false,
            }),
          },
        );

        if (!toResponse.ok)
          throw new Error("Failed to update destination page");
      }

      for (const redirect of newRedirects) {
        const fromPage = state.pages.find(
          (p) => `/${p.slug}` === redirect.fromPath,
        );
        const toPage = state.pages.find(
          (p) => `/${p.slug}` === redirect.toPath,
        );

        if (!fromPage || !toPage) {
          dispatch({
            type: "SET_ERROR",
            payload: `Page not found: ${redirect.fromPath} or ${redirect.toPath}`,
          });
          return;
        }

        const fromResponse = await fetch(
          `/api/websites/pages?websiteId=${selectedWebsite.id}&pageuuid=${fromPage.uuid}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              RedirectPage: redirect.toPath,
              // page404from: null,
              is404Page: true,
            }),
          },
        );

        if (!fromResponse.ok) throw new Error("Failed to create redirect");

        const toResponse = await fetch(
          `/api/websites/pages?websiteId=${selectedWebsite.id}&pageuuid=${toPage.uuid}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              page404from: redirect.fromPath,
              // RedirectPage: null,
              // is404Page: false,
            }),
          },
        );

        if (!toResponse.ok)
          throw new Error("Failed to update destination page");
      }

      // Clear all redirects after successful save
      dispatchNewRedirects({ type: "CLEAR_NEW_REDIRECTS" });

      // مسح كل الصفوف من الـ state
      dispatch({ type: "SET_PAGES", payload: [] });
      form.setValue("redirects", []);

      toast({
        title: "Success",
        description: "Redirects updated successfully",
      });

      // إعادة جلب البيانات من الAPI
      const refreshedData = await fetch(
        `/api/websites/pages?websiteId=${selectedWebsite.id}`,
      );
      if (refreshedData.ok) {
        const freshPages = await refreshedData.json();
        const pagesArray = Array.isArray(freshPages) ? freshPages : [];
        dispatch({ type: "SET_PAGES", payload: pagesArray });

        // تحديث الـ form بالبيانات الجديدة
        const refreshedRedirects = pagesArray
          .filter((page: Page) => page.RedirectPage)
          .map((page: Page) => ({
            fromPath: `/${page.slug}`,
            toPath: page.RedirectPage || "",
          }));

        form.setValue("redirects", refreshedRedirects);
      }
    } catch (error) {
      console.error("Error saving redirects:", error);
      dispatch({
        type: "SET_ERROR",
        payload:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    }
  }

  function addRedirect() {
    // التحقق من وجود redirect جديد غير محفوظ
    const hasUnsavedRedirect = newRedirectsState.newRedirects.some(
      (r) => !r.originalId,
    );

    if (hasUnsavedRedirect) {
      toast({
        title: "Warning",
        description: "Please save the current redirect before adding a new one",
        variant: "destructive",
      });
      return;
    }

    // Use a temporary empty redirect object
    const newRedirect: NewRedirect = {
      uuid: crypto.randomUUID(), // إنشاء UUID فوراً
      fromPath: "",
      toPath: "",
    };

    dispatchNewRedirects({ type: "ADD_NEW_REDIRECT", payload: newRedirect });

    const currentRedirects = form.getValues().redirects;
    form.setValue("redirects", [
      ...currentRedirects,
      { fromPath: "", toPath: "" },
    ]);
  }

  async function removeRedirect(index: number) {
    if (isNewRedirect(index)) {
      const newRedirect = getNewRedirectByIndex(index);
      if (newRedirect) {
        dispatchNewRedirects({
          type: "REMOVE_NEW_REDIRECT",
          payload: newRedirect.uuid,
        });
      }

      const currentRedirects = form.getValues().redirects;
      const updatedRedirects = currentRedirects.filter((_, i) => i !== index);
      form.setValue("redirects", updatedRedirects);

      return;
    }
    const pageToRemove = state.pages.find(
      (page) =>
        page.RedirectPage &&
        `/${page.slug}` === form.getValues().redirects[index].fromPath,
    );
    if (!pageToRemove || !selectedWebsite?.id) return;
    try {
      const response = await fetch(
        `/api/websites/pages?websiteId=${selectedWebsite.id}&pageuuid=${pageToRemove.uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            RedirectPage: null,
            is404Page: false,
          }),
        },
      );
      if (!response.ok) throw new Error("Failed to update page");

      // مسح كل الصفوف من الـ state
      dispatch({ type: "SET_PAGES", payload: [] });
      form.setValue("redirects", []);

      // إعادة جلب البيانات من الAPI
      const refreshedData = await fetch(
        `/api/websites/pages?websiteId=${selectedWebsite.id}`,
      );
      if (refreshedData.ok) {
        const freshPages = await refreshedData.json();
        const pagesArray = Array.isArray(freshPages) ? freshPages : [];

        // وضع البيانات الجديدة في الـ state
        dispatch({ type: "SET_PAGES", payload: pagesArray });

        // تحديث الـ form بالبيانات الجديدة
        const refreshedRedirects = pagesArray
          .filter((page: Page) => page.RedirectPage)
          .map((page: Page) => ({
            fromPath: `/${page.slug}`,
            toPath: page.RedirectPage || "",
          }));

        form.setValue("redirects", refreshedRedirects);
      }

      setDeleted(Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000);
      toast({
        title: "Success",
        description: "Redirect removed successfully",
      });
    } catch (error) {
      console.error("Error removing redirect:", error);
      toast({
        title: "Error",
        description: "Failed to remove redirect",
        variant: "destructive",
      });
    }
  }

  const handleDropdownChange = (
    index: number,
    field: "fromPath" | "toPath",
    value: string,
  ) => {
    const currentRedirects = [...form.getValues().redirects];
    currentRedirects[index][field] = value;
    form.setValue("redirects", currentRedirects);

    const isExisting =
      index < state.pages.filter((page) => page.RedirectPage).length;

    if (isExisting) {
      const originalPage = state.pages.filter((page) => page.RedirectPage)[
        index
      ];
      const existingModification = newRedirectsState.newRedirects.find(
        (r) => r.originalId === originalPage.uuid,
      );

      if (existingModification) {
        dispatchNewRedirects({
          type: "UPDATE_NEW_REDIRECT",
          payload: {
            uuid: existingModification.uuid,
            [field]: value,
          },
        });
      } else {
        dispatchNewRedirects({
          type: "ADD_NEW_REDIRECT",
          payload: {
            uuid: crypto.randomUUID(),
            originalId: originalPage.uuid,
            fromPath: currentRedirects[index].fromPath,
            toPath: currentRedirects[index].toPath,
            isModified: true,
          },
        });
      }
    } else if (isNewRedirect(index)) {
      const newRedirect = getNewRedirectByIndex(index);
      if (newRedirect) {
        dispatchNewRedirects({
          type: "UPDATE_NEW_REDIRECT",
          payload: {
            uuid: newRedirect.uuid,
            [field]: value,
          },
        });
      }
    }
  };

  if (!selectedWebsite) {
    return <div>Select a website first</div>;
  }

  const getPlaceholder = (value: string) => {
    if (!value) return "Select a page";
    const page = state.pages.find((p) => `/${p.slug}` === value);
    return page?.title || "Invalid page";
  };

  return (
    <Form {...form}>
      {state.loading ? (
        <div>Loading...</div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem className="flex-1 max-w-sm">
                  <FormLabel>Search Redirects</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search redirects..."
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addRedirect}
              className="mt-8"
              disabled={newRedirectsState.newRedirects.some(
                (r) => !r.originalId,
              )}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Redirect
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From (404 Page)</TableHead>
                  <TableHead>To (301 Redirect)</TableHead>
                  <TableHead>Page Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.watch("redirects").map((redirect, index) => {
                  const availableFromPages = getAvailablePages(
                    index,
                    redirect.fromPath,
                    "fromPath",
                  );
                  const availableToPages = getAvailablePages(
                    index,
                    redirect.toPath,
                    "toPath",
                  );
                  const isNew = isNewRedirect(index);
                  const newRedirect = getNewRedirectByIndex(index);
                  const existingPage = state.pages.find(
                    (p) => `/${p.slug}` === redirect.fromPath,
                  );

                  return (
                    <TableRow
                      key={
                        isNew
                          ? `new-${newRedirect?.uuid || crypto.randomUUID()}`
                          : `existing-${existingPage?.uuid || crypto.randomUUID()}`
                      }
                    >
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`redirects.${index}.fromPath`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                {/* الdropdown الاول */}
                                <Select
                                  value={field.value}
                                  onValueChange={(value) =>
                                    handleDropdownChange(
                                      index,
                                      "fromPath",
                                      value,
                                    )
                                  }
                                  disabled={
                                    !isNew &&
                                    !newRedirectsState.newRedirects.some(
                                      (r) =>
                                        r.originalId ===
                                        state.pages.find(
                                          (p) =>
                                            `/${p.slug}` === redirect.fromPath,
                                        )?.uuid,
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    disabled={
                                      !isNew &&
                                      !newRedirectsState.newRedirects.some(
                                        (r) =>
                                          r.originalId ===
                                          state.pages.find(
                                            (p) =>
                                              `/${p.slug}` ===
                                              redirect.fromPath,
                                          )?.uuid,
                                      )
                                    }
                                  >
                                    <SelectValue
                                      placeholder={getPlaceholder(field.value)}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableFromPages.map((p, index) => (
                                      <SelectItem
                                        key={`from-${p.uuid || `temp-${index}`}`}
                                        value={`/${p.slug}`}
                                      >
                                        {p.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`redirects.${index}.toPath`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                {/* الdropdown الثاني */}
                                <Select
                                  value={field.value}
                                  onValueChange={(value) =>
                                    handleDropdownChange(index, "toPath", value)
                                  }
                                  disabled={!isNew}
                                >
                                  <SelectTrigger disabled={!isNew}>
                                    <SelectValue
                                      placeholder={getPlaceholder(field.value)}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableToPages.map((p, index) => (
                                      <SelectItem
                                        key={`to-${p.uuid || `temp-${index}`}`}
                                        value={`/${p.slug}`}
                                      >
                                        {p.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        {state.pages.find(
                          (p) => `/${p.slug}` === redirect.fromPath,
                        )?.title || "New Redirect"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            newRedirectsState.newRedirects.some(
                              (r) =>
                                r.originalId ===
                                state.pages.find(
                                  (p) => `/${p.slug}` === redirect.fromPath,
                                )?.uuid,
                            )
                              ? "bg-blue-100 text-blue-800"
                              : isNew
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {newRedirectsState.newRedirects.some(
                            (r) =>
                              r.originalId ===
                              state.pages.find(
                                (p) => `/${p.slug}` === redirect.fromPath,
                              )?.uuid,
                          )
                            ? "Modified"
                            : isNew
                              ? "New"
                              : "Saved"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRedirect(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {newRedirectsState.newRedirects.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unsaved Changes</AlertTitle>
              <AlertDescription>
                You have{" "}
                {
                  newRedirectsState.newRedirects.filter((r) => !r.originalId)
                    .length
                }{" "}
                new redirect(s) that haven't been saved yet. Please save before
                adding more redirects.
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit">Save Changes</Button>
        </form>
      )}
    </Form>
  );
}
