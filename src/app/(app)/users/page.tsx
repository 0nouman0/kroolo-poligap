"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useCompanyStore } from "@/stores/company-store";
import { useUserStore } from "@/stores/user-store";
import { useMember } from "@/hooks/useMember";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterList } from "@mui/icons-material";

export type MemberIntegration = {
  imageUrl: string;
  name: string;
  userStatus: string | null; // e.g., "ACTIVE", "INACTIVE", "DELETED", or null
};

export type Member = {
  _id: string;
  designation: string;
  role: string;
  integrations: MemberIntegration[];
  userId: string;
  email: string;
  name: string;
  status: string;
  dob: string;
  mobile: string;
  profileImage: string;
  profileCreatedOn: string;
  banner: string | null;
  createdAt: string;
  reportingManager: { name: string; email: string } | null;
  createdBy: { name: string; email: string } | null;
  // ...add any other fields as needed
};

export default function Component() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy] = useState("relevance");

  // New state for filter category and filter value
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<
    string | null
  >(null);
  const [selectedFilterValue, setSelectedFilterValue] = useState<string | null>(
    null
  );

  // New state for showing/hiding filter dropdown
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Ref for filter dropdown
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Check if click is on SelectContent (dropdown options)
      const selectContent = document.querySelector(
        "[data-radix-popper-content-wrapper]"
      );
      if (selectContent && selectContent.contains(target)) {
        return; // Don't close if clicking on dropdown options
      }

      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(target)
      ) {
        setShowFilterDropdown(false);
      }
    }

    if (showFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterDropdown]);

  const selectedCompany = useCompanyStore((s) => s.selectedCompany);
  const companyId = selectedCompany?.companyId;
  const currentUserRole = selectedCompany?.role;
  const { userData } = useUserStore();

  const {
    data: teamMembers = [],
    error,
    isLoading,
  } = useMember(companyId || ""); // or skip fetching if companyId is falsy

  console.log("teamMembers   ======> ", teamMembers);
  console.log("currentUserRole   ======> ", currentUserRole);

  // Helper to get unique values for a given filter category
  function getUniqueFilterValues(category: string) {
    const values = new Set<string>();
    teamMembers.forEach((member) => {
      switch (category) {
        case "Status":
          if (member.status) values.add(member.status);
          break;
        case "Role":
          if (member.role) values.add(member.role);
          break;
        case "Reporting Manager":
          if (member.reportingManager?.name)
            values.add(member.reportingManager.name);
          break;
        case "Created By":
          if (member.createdBy?.name) values.add(member.createdBy.name);
          break;
        case "Created On":
          if (member.createdAt) {
            const dateStr = new Date(member.createdAt).toLocaleDateString(
              undefined,
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            );
            values.add(dateStr);
          }
          break;
        default:
          break;
      }
    });
    return Array.from(values);
  }

  // Filtered people based on search and filter dropdown
  const filteredPeople = teamMembers.filter((person) => {
    const matchesSearch = person.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Apply filter dropdown if selected
    let matchesFilter = true;
    if (selectedFilterCategory && selectedFilterValue) {
      switch (selectedFilterCategory) {
        case "Status":
          matchesFilter = person.status === selectedFilterValue;
          break;
        case "Role":
          matchesFilter = person.role === selectedFilterValue;
          break;
        case "Reporting Manager":
          matchesFilter = person.reportingManager?.name === selectedFilterValue;
          break;
        case "Created By":
          matchesFilter = person.createdBy?.name === selectedFilterValue;
          break;
        case "Created On":
          const createdOnStr = person.createdAt
            ? new Date(person.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "";
          matchesFilter = createdOnStr === selectedFilterValue;
          break;
        default:
          matchesFilter = true;
      }
    }

    return matchesSearch && matchesFilter;
  });

  // Dynamic user counts
  const totalUsers = teamMembers.length;
  const activeUsers = teamMembers.filter((m) => m.status === "ACTIVE").length;

  // Sorting logic
  const sortedPeople = useMemo(() => {
    if (sortBy === "relevance") return filteredPeople;
    const sorted = [...filteredPeople];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "designation") {
      sorted.sort((a, b) =>
        (a.designation || "").localeCompare(b.designation || "")
      );
    } else if (sortBy === "createdAt") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return sorted;
  }, [filteredPeople, sortBy]);

  // Sort Owners to the top only after filtering and sorting
  const sortedAndFilteredPeople = useMemo(() => {
    return [...sortedPeople].sort((a, b) => {
      if (a.role === "Owner" && b.role !== "Owner") return -1;
      if (a.role !== "Owner" && b.role === "Owner") return 1;
      return 0;
    });
  }, [sortedPeople]);

  function getInitials(name: string): string {
    if (!name) return "";

    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <h1 className="base-heading font-semibold">Users</h1>
              <Badge
                variant="secondary"
                className="text-13 ml-2 relative"
                style={{ top: "-4px" }}
              >
                {filteredPeople.length.toLocaleString()}
              </Badge>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search user"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-8 h-8 w-56 bg-white dark:bg-background border border-gray-200 dark:border-gray-600 rounded-sm text-sm focus:border-base-purple text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter button with applied filter text */}
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-1 h-8 px-3 bg-white dark:bg-background border border-gray-200 dark:border-gray-600 rounded-sm text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-accent"
                  aria-label="Filter"
                >
                  {/* <Filter className="h-4 w-4" /> */}
                  <FilterList
                    className="placeholder-text"
                    fontSize="small"
                    sx={{ fontSize: "16px" }}
                  />
                  {selectedFilterCategory && selectedFilterValue ? (
                    <>
                      <span>Filter: {selectedFilterValue}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFilterCategory(null);
                          setSelectedFilterValue(null);
                          setShowFilterDropdown(false);
                        }}
                        className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        aria-label="Clear filter"
                      >
                        &times;
                      </button>
                    </>
                  ) : (
                    <span>Filter</span>
                  )}
                </button>

                {/* Filter dropdown panel */}
                {showFilterDropdown && (
                  <div
                    ref={filterDropdownRef}
                    className="absolute top-full right-0 mt-1 bg-white dark:bg-background border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 p-1 popover-shadow"
                  >
                    <div className="flex gap-2">
                      <Select
                        value={selectedFilterCategory || ""}
                        onValueChange={(value) => {
                          setSelectedFilterCategory(value || null);
                          setSelectedFilterValue(null);
                        }}
                      >
                        <SelectTrigger className="h-7 w-48 bg-white dark:bg-background border border-gray-200 dark:border-gray-600 rounded-sm text-13 text-gray-900 dark:text-gray-100">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-background border border-gray-200 dark:border-gray-600 shadow-lg popover-shadow">
                          <SelectItem value="Status">Status</SelectItem>
                          <SelectItem value="Role">Role</SelectItem>
                          <SelectItem value="Reporting Manager">
                            Reporting Manager
                          </SelectItem>
                          <SelectItem value="Created By">Created By</SelectItem>
                          <SelectItem value="Created On">Created On</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedFilterValue || ""}
                        onValueChange={(value) => {
                          setSelectedFilterValue(value || null);
                          setShowFilterDropdown(false);
                        }}
                        disabled={!selectedFilterCategory}
                      >
                        <SelectTrigger className="h-7 w-48 bg-white dark:bg-background border border-gray-200 dark:border-gray-600 rounded-sm text-13 text-gray-900 dark:text-gray-100">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-background border border-gray-200 dark:border-gray-600 shadow-lg popover-shadow">
                          {selectedFilterCategory &&
                            getUniqueFilterValues(selectedFilterCategory).map(
                              (val) => (
                                <SelectItem key={val} value={val}>
                                  {val}
                                </SelectItem>
                              )
                            )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center gap-3 -mb-3">
            <div className="flex flex-row gap-4 items-center">
              <div className="flex items-center text-sm font-semibold">
                Account:&nbsp;
                <span className="inline-block text-sm font-normal text-ellipsis max-w-[70%] overflow-hidden whitespace-nowrap">
                  {selectedCompany?.name || "-"}
                </span>
                {(currentUserRole === "Owner" ||
                  currentUserRole === "Admin") && (
                  <span className="text-sm text-gray-500 dark:text-gray-300 font-normal">
                    &nbsp;(ID:{" "}
                    {selectedCompany?.companyId?.slice(-8) || "--------"})
                  </span>
                )}
              </div>

              <div className="flex flex-row gap-2">
                <div className="px-2 py-[2px] bg-sky-200 text-black text-xs font-normal rounded hover:bg-sky-200 cursor-pointer">
                  Total Users: {totalUsers}
                </div>
                <div className="px-2 py-[2px] bg-purple-200 text-black text-xs font-normal rounded hover:bg-purple-200 cursor-pointer">
                  Active Users: {activeUsers}
                </div>
                <div className="px-2 py-[2px] bg-red-300 text-black text-xs font-normal rounded hover:bg-red-300 cursor-pointer">
                  Paid Users: 0
                </div>
              </div>
            </div>

            {/* {["Owner"].includes("Owner") && 10 >= 10 && (
              <div className="flex items-center gap-2 pr-3">
                <div className="text-sm text-orange-500 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[18px] w-[18px] text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M12 5.5C7.80558 5.5 4.5 8.80558 4.5 13C4.5 17.1944 7.80558 20.5 12 20.5C16.1944 20.5 19.5 17.1944 19.5 13C19.5 8.80558 16.1944 5.5 12 5.5Z"
                    />
                  </svg>
                  Reached maximum{" "}
                  <span className="font-semibold">Paid User</span> limit
                </div>
                <div className="relative group">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-500 cursor-pointer"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                    />
                  </svg>
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-white border border-gray-300 text-gray-800 text-xs px-2 py-1 rounded shadow w-64">
                    Active users is used to calculate user limit. You can either
                    delete or deactivate a user to stay within user limit.
                  </div>
                </div>
                <button
                  onClick={() => (window.location.href = "/settings/checkout")}
                  className="text-indigo-600 text-sm font-medium hover:underline"
                >
                  Add users
                </button>
              </div>
            )} */}
          </div>

          {/* Results Count and Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-auto min-w-[140px] h-9 bg-background text-foreground border-input [&>svg]:hidden">
                <div className="flex items-center gap-2">
                  <span>
                    Sort by:{" "}
                    {sortBy === "relevance"
                      ? "Relevance"
                      : sortBy === "name"
                      ? "Name"
                      : sortBy === "designation"
                      ? "Designation"
                      : sortBy === "createdAt"
                      ? "Created At"
                      : sortBy}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="designation">Designation</SelectItem>
                <SelectItem value="createdAt">Created At</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </div>

        {/* People Table (replaces People Grid) */}
        {error ? (
          <div className="col-span-full">
            <div className="flex justify-center items-center gap-2 py-8">
              <span>Error:</span>
              <span className="text-sm text-error-red ">
                These is some problem in fetching members data
              </span>
            </div>
          </div>
        ) : (
          <Table className="bg-background rounded-lg border-t border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400">
            <TableHeader className="text-13">
              <TableRow className="border-b border-gray-100 dark:border-gray-700 hover:bg-transparent h-7">
                <TableHead className="font-medium py-0 text-gray-500 dark:text-gray-100 h-7">
                  Name
                </TableHead>
                <TableHead className="font-medium py-0 text-gray-500 dark:text-gray-100 h-7">
                  Status
                </TableHead>
                <TableHead className="font-medium py-0 text-gray-500 dark:text-gray-100 h-7">
                  Role
                </TableHead>
                <TableHead className="font-medium py-0 text-gray-500 dark:text-gray-100 h-7">
                  Reporting Manager
                </TableHead>
                <TableHead className="font-medium py-0 text-gray-500 dark:text-gray-100 h-7">
                  Created By
                </TableHead>
                <TableHead className="font-medium py-0 text-gray-500 dark:text-gray-100 h-7">
                  Created On
                </TableHead>
                {/* <TableHead className="px-4 py-3"></TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, idx) => (
                    <TableRow
                      key={"skeleton-" + idx}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-transparent"
                    >
                      <TableCell className="px-3 py-1">
                        <div className="flex items-center gap-3 min-w-0">
                          <Skeleton className="h-8 w-8" />
                          <div className="min-w-0 w-full">
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-1">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell className="px-3 py-1">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell className="px-3 py-1">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="px-3 py-1">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="px-3 py-1 hidden lg:table-cell">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="px-3 py-1 hidden lg:table-cell">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                : sortedAndFilteredPeople.map((member) => (
                    <TableRow
                      key={member._id.toString()}
                      className="text-13 border-b border-gray-100 dark:border-gray-700 hover:bg-transparent"
                    >
                      <TableCell className="px-3 py-1">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={member.profileImage || "/placeholder.svg"}
                              alt={member.name}
                            />
                            <AvatarFallback
                              className={`text-white font-medium bg-green-400`}
                            >
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-900 dark:text-gray-100">
                                {member.name}
                              </span>
                              {member.email === userData?.email && (
                                <Badge className="bg-white dark:bg-background text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-[4px] px-1 py-0.5 text-xs font-medium card-border">
                                  You
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground truncate">
                              {member.email || "-"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-1">
                        <Badge
                          variant="secondary"
                          className="bg-[#acdc79] text-[#25301b] dark:bg-[#25301b] dark:text-[#acdc79]"
                        >
                          {member.status
                            ? member.status.charAt(0).toUpperCase() +
                              member.status.slice(1).toLowerCase()
                            : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-1">
                        <span className="text-gray-900 dark:text-gray-100">
                          {member?.role === "Owner"
                            ? "Org Owner"
                            : member?.role === "Admin"
                            ? "Org Admin"
                            : member?.role}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-1">
                        <span className="text-gray-900 dark:text-gray-100">
                          {member.reportingManager?.name || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-1 hidden lg:table-cell">
                        <span className="text-gray-900 dark:text-gray-100">
                          {member.createdBy?.name || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-1 hidden lg:table-cell">
                        <span className="text-gray-900 dark:text-gray-100">
                          {member.createdAt
                            ? new Date(member.createdAt)
                                .toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                                .replace(/(\w+)\s+(\d+)/, "$1, $2")
                            : "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        )}

        {/* No Results */}
        {filteredPeople.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-13">
              No users found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
