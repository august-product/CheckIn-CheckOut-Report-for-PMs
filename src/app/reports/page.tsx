"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { clearLoggedIn, getStoredUser } from "../../lib/auth";

type SortDirection = "asc" | "desc";

interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

type ReportRow = Record<string, unknown>;

type NormalizedPayload = ReportRow[];

const API_URL = "https://xdti-9vsw-swso.e2.xano.io/api:ejSfrA89:v3.2/reports/checkin";
const API_TOKEN = process.env.NEXT_PUBLIC_XANO_TOKEN ?? "c2qhHos3PjRegtqqnl0dYkrBY5EELJs1";

const REGIONS = [
  "Barcelona",
  "Cotswolds",
  "French Alps",
  "London",
  "Mallorca",
  "Paris",
  "Rome",
  "South of France",
  "Tuscany"
];

const HIDDEN_COLUMNS = new Set(["timestamp"]);
const END_COLUMNS = ["extras", "special_requests", "special requests"];
const YEAR_KEY_HINTS = ["check_in", "checkin", "start_date", "startdate", "arrival", "date"];

const ReportIcon = () => (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
  >
    <path
      d="M7 3h8l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 3v4h4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 12h6M9 16h6M9 8h2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
  >
    <path
      d="M12 4v10m0 0 4-4m-4 4-4-4M5 20h14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const normalizePayload = (payload: unknown): NormalizedPayload => {
  if (Array.isArray(payload)) return payload as ReportRow[];
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return ((payload as { data: ReportRow[] }).data) ?? [];
  }
  if (payload && typeof payload === "object") return [payload as ReportRow];
  return [];
};

export default function CheckinReportPage() {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(dayjs().add(7, "day").toDate());
  const [region, setRegion] = useState<string>("");
  const [data, setData] = useState<ReportRow[]>([]);
  const [filteredData, setFilteredData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hiddenStatuses, setHiddenStatuses] = useState({ in: false, out: false });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc"
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [userDisplayName, setUserDisplayName] = useState("Account Profile");
  const handleLogout = useCallback(() => {
    clearLoggedIn();
    window.location.assign("/");
  }, []);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored?.name) {
      setUserDisplayName(stored.name);
    }
  }, []);

  const statusKey = useMemo(() => {
    if (!data[0]) return null;
    const candidates = ["status", "type", "direction"];
    const keys = Object.keys(data[0]);
    return (
      keys.find((key) => {
        const value = String(data[0]?.[key] ?? "").toLowerCase();
        const keyMatch = candidates.some((candidate) => key.toLowerCase().includes(candidate));
        const valueMatch = value === "in" || value === "out";
        return keyMatch || valueMatch;
      }) ?? null
    );
  }, [data]);

  const headers = useMemo(() => {
    if (!filteredData[0]) return [];
    const keys = Object.keys(filteredData[0]).filter(
      (key) => !HIDDEN_COLUMNS.has(key.toLowerCase())
    );

    const normalized = [...keys];
    const typeIndex = normalized.findIndex((key) => key.toLowerCase() === "type");

    if (typeIndex >= 0) {
      const [typeKey] = normalized.splice(typeIndex, 1);
      const bookingIndex = normalized.findIndex((key) => key.toLowerCase() === "booking_id");
      const nameIndex = normalized.findIndex((key) => key.toLowerCase() === "name");

      let targetIndex = normalized.length;
      if (bookingIndex >= 0) {
        targetIndex = bookingIndex + 1;
      } else if (nameIndex >= 0) {
        targetIndex = nameIndex;
      }
      normalized.splice(Math.min(targetIndex, normalized.length), 0, typeKey);
    }

    const regular = normalized.filter((key) => !END_COLUMNS.includes(key.toLowerCase()));
    const prioritizedEnd = normalized.filter((key) => END_COLUMNS.includes(key.toLowerCase()));
    return [...regular, ...prioritizedEnd];
  }, [filteredData]);

  const formatHeaderLabel = useCallback((key: string) => {
    const normalized = key.replace(/_/g, " ");
    if (normalized.trim().toLowerCase() === "in/out") {
      return "Check In/Out";
    }
    if (/^property$/i.test(normalized)) {
      return "PROPERTY";
    }
    return normalized;
  }, []);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = String(a?.[sortConfig.key as keyof ReportRow] ?? "");
      const bv = String(b?.[sortConfig.key as keyof ReportRow] ?? "");
      return sortConfig.direction === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const formatCellValue = useCallback((header: string, value: unknown) => {
    const text = String(value ?? "");
    if (!text) return "";
    if (text.trim().toLowerCase() === "homeowner") return "Homeowner";
    if (header.toLowerCase() === "property") {
      return text.toUpperCase();
    }
    return text;
  }, []);

  const getRowYear = useCallback((row: ReportRow) => {
    for (const key of Object.keys(row)) {
      const lowerKey = key.toLowerCase();
      if (!YEAR_KEY_HINTS.some((hint) => lowerKey.includes(hint))) continue;
      const value = row[key];
      const parsed = dayjs(String(value));
      if (parsed.isValid()) {
        return parsed.format("YYYY");
      }
    }
    return null;
  }, []);

  const hasMultipleYears = useMemo(() => {
    const years = new Set<string>();
    pagedData.forEach((row) => {
      const year = getRowYear(row);
      if (year) years.add(year);
    });
    return years.size > 1;
  }, [pagedData, getRowYear]);

  const toggleHiddenStatus = (status: "in" | "out") => {
    setHiddenStatuses((prev) => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const toggleHideBoth = () => {
    setHiddenStatuses((prev) => {
      const nextValue = !(prev.in && prev.out);
      return { in: nextValue, out: nextValue };
    });
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const fetchReport = useCallback(async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (!region) {
      setError("Select Region");
      return;
    }

    if (!API_TOKEN) {
      setError("Missing API token. Set NEXT_PUBLIC_XANO_TOKEN in .env.local.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(API_URL, {
        params: {
          token: API_TOKEN,
          start_date: dayjs(startDate).format("YYYY-MM-DD"),
          end_date: dayjs(endDate).format("YYYY-MM-DD"),
          destination: region || undefined,
          format: "json"
        }
      });

      const rows = normalizePayload(response.data);
      setData(rows);
      setFilteredData(rows);
      setPage(1);

      if (!rows.length) setError("No results found.");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        const friendlyMessage = message?.includes("Missing param: destination") ? "Select Region" : message;
        setError(friendlyMessage ?? err.message ?? "Error fetching data.");
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, region]);

  const exportCSV = useCallback(() => {
    if (!data.length) return;
    const csvHeaders = Object.keys(data[0] ?? {});
    const csv = [csvHeaders.join(",")]
      .concat(
        data.map((row) => csvHeaders.map((header) => JSON.stringify(row[header] ?? "")).join(","))
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `checkin_report_${Date.now()}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 2000);
  }, [data]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc"
        };
      }
      return { key, direction: "asc" };
    });
  };

  useEffect(() => {
    let next = data;

    if (search.trim()) {
      const q = search.toLowerCase();
      next = next.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
    }

    if (statusKey) {
      next = next.filter((row) => {
        const value = String(row?.[statusKey] ?? "").toLowerCase();
        if (hiddenStatuses.in && value === "in") return false;
        if (hiddenStatuses.out && value === "out") return false;
        return true;
      });
    }

    setFilteredData(next);
    setPage(1);
  }, [search, data, hiddenStatuses, statusKey]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const canGoBack = page > 1;
  const canGoForward = page < totalPages;
  const canFilterByStatus = Boolean(statusKey);
  const hideBothChecked = hiddenStatuses.in && hiddenStatuses.out;

  return (
    <main className="bg-[#f6f0e6] text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-emerald-900/40 bg-[#26483f] shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-white">
          <Image
            src="https://cdn.prod.website-files.com/675c4350f0adea479ba8dab7/67608186495a13bdfd03f020_Logo.svg"
            alt="Valeria Logo"
            width={120}
            height={24}
            className="h-6 w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
            priority
          />
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/account" className="transition hover:text-amber-200">
              {userDisplayName}
            </Link>
            <span className="h-5 w-px bg-white/40" aria-hidden="true" />
            <button
              onClick={handleLogout}
              className="text-left transition hover:text-amber-200"
              type="button"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl p-6">
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-lg ring-1 ring-black/5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Reservation Report</h2>
            <p className="text-sm text-gray-500">
              Create a Reservation Report by using the Region, Check In & Check Out dates. Use the search field to filter the search results. Download a CSV, if needed.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:items-end">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Region</label>
              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className={`w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                  region ? "text-gray-700" : "text-[#a0a0a0]"
                }`}
              >
                <option value="">Select Region</option>
                {REGIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd MMMM yyyy"
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate ?? undefined}
                dateFormat="dd MMMM yyyy"
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div className="flex md:justify-end">
              <button
                onClick={fetchReport}
                disabled={loading}
                className="mt-2 flex w-full min-w-[320px] items-center justify-center gap-2 rounded-xl bg-[#2f7f5f] px-12 py-3 text-center text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#27654c] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 md:mt-0 md:w-auto"
              >
                <ReportIcon />
                <span>{loading ? "Loading..." : "Generate Reservation Report"}</span>
              </button>
            </div>
          </div>

          {data.length > 0 && (
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-lg ring-1 ring-black/5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex flex-1 items-center rounded-xl border border-gray-200 px-3 shadow-sm transition focus-within:ring-1 focus-within:ring-brand-mustard">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4 text-gray-400"
                  >
                    <path
                      d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0 0 5.5 5.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search Reservations"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full border-none bg-transparent p-2 text-sm focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <label
                    htmlFor="hide-in"
                    className={`flex items-center gap-2 text-xs ${canFilterByStatus ? "text-gray-700" : "text-gray-400"}`}
                  >
                    <input
                      type="checkbox"
                      id="hide-in"
                      checked={hiddenStatuses.in}
                      onChange={() => toggleHiddenStatus("in")}
                      disabled={!canFilterByStatus}
                      className="h-4 w-4 rounded border-gray-300 text-[#316354] focus:ring-[#316354] accent-[#316354] disabled:cursor-not-allowed disabled:opacity-40"
                    />
                    Hide &quot;In&quot;
                  </label>

                  <label
                    htmlFor="hide-out"
                    className={`flex items-center gap-2 text-xs ${canFilterByStatus ? "text-gray-700" : "text-gray-400"}`}
                  >
                    <input
                      type="checkbox"
                      id="hide-out"
                      checked={hiddenStatuses.out}
                      onChange={() => toggleHiddenStatus("out")}
                      disabled={!canFilterByStatus}
                      className="h-4 w-4 rounded border-gray-300 text-[#316354] focus:ring-[#316354] accent-[#316354] disabled:cursor-not-allowed disabled:opacity-40"
                    />
                    Hide &quot;Out&quot;
                  </label>

                  <button
                    onClick={exportCSV}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-green/80 bg-brand-green px-5 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green/90 hover:shadow-lg"
                  >
                    <DownloadIcon />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        {loading && <p className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">Fetching reservations...</p>}

        {!loading && data.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/90 shadow-xl ring-1 ring-black/5">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    {headers.map((key) => (
                      <th
                        key={key}
                        className="cursor-pointer px-4 py-3 hover:bg-gray-200"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={formatHeaderLabel(key) === "Check In/Out" ? "normal-case" : undefined}>
                            {formatHeaderLabel(key)}
                          </span>
                          {sortConfig.key === key && <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let previousYear: string | null = null;
                    return pagedData.map((row, rowIndex) => {
                      const year = hasMultipleYears ? getRowYear(row) : null;
                      const showYearRow = Boolean(year && year !== previousYear);
                      if (year) {
                        previousYear = year;
                      }

                      return (
                        <Fragment key={`row-group-${rowIndex}`}>
                          {showYearRow && (
                            <tr className="bg-gray-100">
                              <td colSpan={headers.length} className="px-4 py-2 text-xs font-semibold uppercase text-gray-500">
                                {year}
                              </td>
                            </tr>
                          )}
                          <tr className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            {headers.map((header) => (
                              <td key={`${header}-${rowIndex}`} className="whitespace-nowrap border-t px-4 py-2 text-gray-800">
                                {formatCellValue(header, row?.[header])}
                              </td>
                            ))}
                          </tr>
                        </Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <span>
                Showing {pagedData.length} of {filteredData.length} results
              </span>

              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                  className="rounded-md border border-gray-300 p-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-mustard"
                >
                  {[10, 25, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => canGoBack && setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={!canGoBack}
                    className="rounded-full border border-gray-300 px-4 py-1 text-sm font-medium transition hover:border-brand-mustard hover:text-brand-mustard disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => canGoForward && setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={!canGoForward}
                    className="rounded-full border border-gray-300 px-4 py-1 text-sm font-medium transition hover:border-brand-mustard hover:text-brand-mustard disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
