"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  "Mallorca",
  "Tuscany",
  "French Alps",
  "Barcelona",
  "Cotswolds",
  "London",
  "South of France",
  "Rome",
  "Paris"
];

const HIDDEN_COLUMNS = new Set(["timestamp"]);

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
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc"
  });
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const headers = useMemo(() => {
    if (!filteredData[0]) return [];
    return Object.keys(filteredData[0]).filter(
      (key) => !HIDDEN_COLUMNS.has(key.toLowerCase())
    );
  }, [filteredData]);

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

  const fetchReport = useCallback(async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
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
        setError(err.response?.data?.message ?? err.message ?? "Error fetching data.");
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
    if (!search.trim()) {
      setFilteredData(data);
      return;
    }

    const q = search.toLowerCase();
    const filtered = data.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
    setFilteredData(filtered);
    setPage(1);
  }, [search, data]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const canGoBack = page > 1;
  const canGoForward = page < totalPages;

  return (
    <main className="bg-[#f6f0e6] text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-emerald-900/40 bg-[#26483f] shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-3 text-white">
          <img
            src="https://cdn.prod.website-files.com/675c4350f0adea479ba8dab7/67608186495a13bdfd03f020_Logo.svg"
            alt="Valeria Logo"
            className="h-6 w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
      </nav>

      <section className="mx-auto max-w-7xl p-6">
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-lg ring-1 ring-black/5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Generate Reservation Report</h2>
            <p className="text-sm text-gray-500">
              Filter by date range and region, then export the results as CSV.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:items-end">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Region
              </label>
              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option value="">All Regions</option>
                {REGIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-2 md:gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Start Date
                </label>
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
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  End Date
                </label>
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
            </div>

            <div className="flex md:justify-end">
              <button
                onClick={fetchReport}
                disabled={loading}
                className="mt-2 w-full min-w-[220px] rounded-xl bg-gradient-to-r from-brand-mustard to-amber-400 px-8 py-3 text-center text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 md:mt-0 md:w-auto"
              >
                {loading ? "Loading..." : "Generate Report"}
              </button>
            </div>
          </div>

          {data.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                onClick={exportCSV}
                className="inline-flex items-center justify-center rounded-xl border border-brand-green/80 bg-brand-green px-5 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-green/90 hover:shadow-lg"
              >
                Export CSV
              </button>

              <input
                type="text"
                placeholder="Search reservations..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2 text-sm shadow-sm transition focus:outline-none focus:ring-1 focus:ring-brand-mustard"
              />
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
                          <span>{key.replace(/_/g, " ")}</span>
                          {sortConfig.key === key && <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedData.map((row, rowIndex) => (
                    <tr
                      key={`row-${rowIndex}`}
                      className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {headers.map((header) => (
                        <td key={`${header}-${rowIndex}`} className="whitespace-nowrap border-t px-4 py-2 text-gray-800">
                          {String(row?.[header] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <span>
                Showing {pagedData.length} of {filteredData.length} results
              </span>
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
