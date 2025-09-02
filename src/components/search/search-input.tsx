"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Search,
  X,
  FileText,
  Users,
  LinkIcon,
  MessageSquare,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";

import { useSuggestedItems } from "@/lib/queries/useSuggestedItems";
import { useDynamicSuggestions } from "@/lib/queries/useSuggestedItems";
import { useRecentSearches } from "@/lib/queries/useRecentSearches";
import { SearchItem } from "@/types/search.types";
import { Skeleton } from "@/components/ui/skeleton";
import { getSourceIcon } from "@/utils/search.util";

interface SearchInputProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  showChatToggle?: boolean;
}

const getIcon = (type: SearchItem["type"]) => {
  switch (type) {
    case "file":
      return <FileText className="w-6 h-6 text-blue-500" />;
    case "spreadsheet":
      return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
    case "presentation":
      return <Presentation className="w-6 h-6 text-orange-500" />;
    case "document":
      return <FileText className="w-6 h-6 text-purple-500" />;
    case "link":
      return <LinkIcon className="w-6 h-6 text-gray-500" />;
    case "person":
      return <Users className="w-6 h-6 text-indigo-500" />;
    case "message":
      return <MessageSquare className="w-6 h-6 text-pink-500" />;
    case "query":
      return <Search className="w-4 h-4 text-gray-500" />;
    default:
      return <FileText className="w-6 h-6 text-gray-500" />;
  }
};

// Helper to map dynamic suggestion type to SearchItem["type"]
const mapDynamicTypeToIconType = (type: string): SearchItem["type"] => {
  switch (type) {
    case "spell_correction":
      return "query"; // Use the Lucide Search icon for spell_correction
    case "file":
    case "spreadsheet":
    case "presentation":
    case "document":
    case "link":
    case "person":
    case "message":
    case "query":
      return type;
    default:
      return "file";
  }
};

// Helper function to highlight query text in suggestions
const highlightQueryText = (text: string, query: string) => {
  if (!query.trim()) return text;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const queryIndex = textLower.indexOf(queryLower);

  if (queryIndex === -1) return text;

  const beforeMatch = text.slice(0, queryIndex);
  const match = text.slice(queryIndex, queryIndex + query.length);
  const afterMatch = text.slice(queryIndex + query.length);

  return (
    <>
      {beforeMatch}
      <span className="bg-yellow-200 dark:bg-yellow-800 font-semibold">
        {match}
      </span>
      {afterMatch}
    </>
  );
};

// Helper type guards
function isDynamicSuggestionItem(item: unknown): item is { text: string } {
  return typeof (item as Record<string, unknown>).text === "string";
}
function isRecentSearch(item: unknown): item is { query: string } {
  return (
    typeof (item as Record<string, unknown>).query === "string" &&
    typeof (item as Record<string, unknown>).searched_at === "string"
  );
}
function isSuggestedItem(
  item: unknown
): item is { title: string; isSuggested: true } {
  return (
    (item as Record<string, unknown>).isSuggested === true &&
    typeof (item as Record<string, unknown>).title === "string"
  );
}

export default function SearchInput({
  initialQuery = "",
  onSearch,
  showChatToggle = true,
}: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { data: recentSearches = [] } = useRecentSearches();
  const { data: suggestedItems = [] } = useSuggestedItems();
  const { data: dynamicSuggestions = [], isLoading: isDynamicLoading } =
    useDynamicSuggestions(query, 300);

  // Sliced arrays for consistent navigation and rendering
  const recentSearchesFiltered = recentSearches
    .filter((item) => item.query !== "")
    .slice(0, 5);
  const suggestedItemsSliced = suggestedItems.slice(0, 3);

  const allSuggestions =
    query.length > 0
      ? isDynamicLoading
        ? []
        : dynamicSuggestions.length > 0
        ? dynamicSuggestions
        : [{ text: query, type: "query" }]
      : [
          ...recentSearchesFiltered,
          ...suggestedItemsSliced.map((item) => ({
            ...item,
            isSuggested: true,
          })),
        ];

  useEffect(() => {
    if (!showSuggestions) setFocusedIndex(-1);
    // Don't automatically focus the first item when suggestions appear
  }, [
    showSuggestions,
    query,
    isDynamicLoading,
    dynamicSuggestions,
    recentSearches,
    suggestedItems,
    allSuggestions.length,
  ]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowSuggestions(true);
    // Reset focus when user starts typing
    setFocusedIndex(-1);
  };

  const handleSearch = useCallback(
    (searchTerm: string) => {
      if (searchTerm.trim()) {
        setShowSuggestions(false);
        if (onSearch) {
          onSearch(searchTerm);
        } else {
          router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
      }
    },
    [onSearch, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // If a suggestion is focused, search for that suggestion
      if (focusedIndex >= 0 && allSuggestions.length > 0) {
        const focusedItem = allSuggestions[focusedIndex];
        if (focusedItem) {
          // Handle different types of suggestions
          if ("text" in focusedItem) {
            // Dynamic suggestion
            handleSearch(focusedItem.text);
          } else if ("query" in focusedItem) {
            // Recent search
            setQuery(focusedItem.query);
            handleSearch(focusedItem.query);
          } else if ("title" in focusedItem) {
            // Suggested item
            handleSearch(focusedItem.title);
          }
        }
      } else {
        // No suggestion focused, search for current query
        handleSearch(query);
      }
      return;
    }
    if (!showSuggestions || allSuggestions.length === 0) return;
    if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      // If no item is focused, start from the first item
      if (focusedIndex === -1) {
        setFocusedIndex(0);
      } else {
        setFocusedIndex((prev) => (prev + 1) % allSuggestions.length);
      }
    } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      // If no item is focused, start from the last item
      if (focusedIndex === -1) {
        setFocusedIndex(allSuggestions.length - 1);
      } else {
        setFocusedIndex(
          (prev) => (prev - 1 + allSuggestions.length) % allSuggestions.length
        );
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    if (suggestionsRef.current && focusedIndex >= 0) {
      const container = suggestionsRef.current;
      const item = container.querySelectorAll('[role="option"]')[
        focusedIndex
      ] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex, showSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  return (
    <div className="relative w-full">
      {showChatToggle && (
        <div className="flex items-center mb-4 space-x-4">
          <Button
            variant="ghost"
            className="text-pink-600 dark:text-pink-400 border-b-2 border-pink-600 dark:border-pink-400 rounded-none px-1 pb-2"
          >
            <Search className="w-4 h-4 mr-2" /> Search
          </Button>
          <Button variant="ghost" className="text-muted-foreground">
            <MessageSquare className="w-4 h-4 mr-2" /> Chat
          </Button>
          <div className="ml-auto text-xs text-muted-foreground hidden md:block">
            Chat{" "}
            <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              Shift
            </kbd>{" "}
            +{" "}
            <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              Enter
            </kbd>
          </div>
        </div>
      )}
      <div className="relative">
        {" "}
        {/* Wrapper for input and its direct icons */}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Ask anything..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-controls="search-suggestions-listbox"
          aria-activedescendant={
            showSuggestions && focusedIndex >= 0
              ? `search-suggestion-${focusedIndex}`
              : ""
          }
          className={cn(
            "w-full z-50 pl-10 pr-10 py-6 text-base shadow-sm border-none outline-none focus:outline-none focus:ring-0 focus:border-none rounded-full",
            showSuggestions ? "rounded-b-[0px] rounded-t-[25px]" : ""
          )}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 z-10"
            onClick={() => {
              setQuery("");
              setShowSuggestions(false);
              // Navigate back to home page
              router.push("/home");
              inputRef.current?.focus();
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        {showSuggestions && (
        <Card
          className="absolute z-10 w-full bg-card shadow-lg rounded-b-md rounded-t-none border border-input border-t-0 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring py-0"
          ref={suggestionsRef}
        >
          <CardContent
            className="py-2 max-h-[400px] overflow-y-auto"
            id="search-suggestions-listbox"
            role="listbox"
            aria-label="Search suggestions"
          >
            {query.length > 0 ? (
              isDynamicLoading ? (
                <div className="py-2">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="flex items-center p-3 gap-3">
                      <Skeleton className="w-6 h-6 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : dynamicSuggestions.length > 0 ? (
                dynamicSuggestions.map((item, idx) => {
                  // const isClickable = !!item.url;
                  const content = (
                    <>
                      {item.icon && (
                        <span className="mr-3 text-xl">{item.icon}</span>
                      )}
                      {/* {item.integration && !item.icon && (
                        <span className="text-xs text-muted-foreground mr-3">
                          {getSourceIcon(item.integration, 32)}
                        </span>
                      )} */}
                      {/* {item.type === "spell_correction" && !item.icon && (
                        <div className="mr-3">
                          {getIcon(mapDynamicTypeToIconType(item.type))}
                        </div>
                      )} */}
                      <div className="flex-grow">
                        <p className="font-medium text-sm">
                          {highlightQueryText(item.text, query)}
                        </p>
                        {/* {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )} */}
                        {/* {item.document_title && ( 
                          <p className="text-xs text-muted-foreground">
                            {highlightQueryText(item.document_title, query)}
                          </p>
                        )} */}
                      </div>
                      {/* {item.url && (
                        <span className="ml-2">
                          <LinkIcon className="w-4 h-4 text-blue-500" />
                        </span>
                      )} */}
                      {/* {item.type !== "spell_correction" &&
                        !item.icon &&
                        !item.url && (
                          <div className="mr-3">
                            {getIcon(mapDynamicTypeToIconType(item.type))}
                          </div>
                        )} */}
                    </>
                  );
                  return false ? (
                    <a
                      key={item.text + idx}
                      id={`search-suggestion-${idx}`}
                      role="option"
                      aria-selected={focusedIndex === idx ? "true" : "false"}
                      className={cn(
                        "flex items-center p-3 hover:bg-muted rounded-md cursor-pointer transition-colors",
                        focusedIndex === idx ? "bg-muted" : ""
                      )}
                      // href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        // Don't trigger search, just open link
                        e.stopPropagation();
                      }}
                      onMouseEnter={() => setFocusedIndex(idx)}
                    >
                      {content}
                    </a>
                  ) : (
                    <div
                      key={item.text + idx}
                      id={`search-suggestion-${idx}`}
                      role="option"
                      aria-selected={focusedIndex === idx ? "true" : "false"}
                      className={cn(
                        "flex items-center p-3 hover:bg-muted rounded-md cursor-pointer",
                        focusedIndex === idx ? "bg-muted" : ""
                      )}
                      onClick={() => handleSearch(item.text)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                    >
                      {content}
                    </div>
                  );
                })
              ) : (
                <div
                  id="search-suggestion-0"
                  role="option"
                  aria-selected={focusedIndex === 0 ? "true" : "false"}
                  className={cn(
                    "flex items-center p-3 hover:bg-muted rounded-md cursor-pointer",
                    focusedIndex === 0 ? "bg-muted" : ""
                  )}
                  onClick={() => handleSearch(query)}
                  onMouseEnter={() => setFocusedIndex(0)}
                >
                  <div className="mr-3">{getIcon("query")}</div>
                  <div className="flex-grow">
                    <p className="font-medium text-sm">
                      {highlightQueryText(query, query)}
                    </p>
                    {/* <p className="text-xs text-muted-foreground">
                      Search for &quot;{query}&quot;
                    </p> */}
                  </div>
                </div>
              )
            ) : (
              <>
                {recentSearchesFiltered.map((item, idx) => (
                  <div
                    key={idx}
                    id={`search-suggestion-${idx}`}
                    role="option"
                    aria-selected={focusedIndex === idx ? "true" : "false"}
                    className={cn(
                      "flex items-center p-3 hover:bg-muted rounded-md cursor-pointer",
                      focusedIndex === idx ? "bg-muted" : ""
                    )}
                    onClick={() => {
                      setQuery(item.query);
                      handleSearch(item.query);
                    }}
                    onMouseEnter={() => setFocusedIndex(idx)}
                  >
                    <div className="mr-3 flex items-center">
                      {/* {getSourceIcon(item.integration || "", 28)} */}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-sm">
                        {highlightQueryText(item.query, query)}
                      </p>
                      {item.document_title && (
                        <p className="text-xs text-muted-foreground">
                          {highlightQueryText(item.document_title, query)}
                        </p>
                      )}
                    </div>
                    {item.results_count !== undefined && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {item.results_count} results
                      </span>
                    )}
                  </div>
                ))}
                {suggestedItemsSliced.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">
                      Suggested
                    </div>
                    {suggestedItemsSliced.map((item, idx) => {
                      const suggestionIdx = recentSearchesFiltered.length + idx;
                      return (
                        <Button
                          key={item.title + idx}
                          id={`search-suggestion-${suggestionIdx}`}
                          role="option"
                          aria-selected={
                            focusedIndex === suggestionIdx ? "true" : "false"
                          }
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-sm text-muted-foreground hover:text-primary",
                            focusedIndex === suggestionIdx ? "bg-muted" : ""
                          )}
                          onClick={() => handleSearch(item.title)}
                          onMouseEnter={() => setFocusedIndex(suggestionIdx)}
                        >
                          {/* <FileText className="w-4 h-4 mr-2" />{" "} */}
                          {getSourceIcon(item.integration_type)}
                          {highlightQueryText(item.title, query)}
                        </Button>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
