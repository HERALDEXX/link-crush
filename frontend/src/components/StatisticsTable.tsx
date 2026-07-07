"use client";

import { useState, useEffect, useCallback } from "react";
import { URLStats, User } from "@/lib/types";
import { apiService } from "@/lib/api";

interface StatisticsTableProps {
  user: User | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  refreshTrigger?: number;
}

export default function StatisticsTable({
  user,
  showToast,
  refreshTrigger = 0,
}: StatisticsTableProps) {
  const [stats, setStats] = useState<URLStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"clickCount" | "dateAdded">(
    "clickCount",
  );
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getStats();
      setStats(data);
    } catch (error: any) {
      showToast("Failed to load statistics", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Sort stats based on current criteria
  const sortedStats = [...stats].sort((a, b) => {
    let comparison = 0;

    if (sortBy === "clickCount") {
      comparison = a.clickCount - b.clickCount;
    } else {
      // For dateAdded, we'll use the array index as a proxy for creation time
      // In a real app, you'd have actual timestamps from the API
      const aIndex = stats.findIndex((s) => s.shortCode === a.shortCode);
      const bIndex = stats.findIndex((s) => s.shortCode === b.shortCode);
      comparison = aIndex - bIndex;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  useEffect(() => {
    loadStats();
  }, [loadStats, refreshTrigger]);

  const copyShortUrl = async (shortCode: string) => {
    const shortUrl = `${process.env.NEXT_PUBLIC_SHORT_URL_BASE}/${shortCode}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      showToast("🔗 Link copied to clipboard!", "success");
    } catch (error) {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const deleteUrl = async (shortCode: string) => {
    if (!user) {
      showToast("You must be logged in to delete a link.", "error");
      return;
    }

    try {
      await apiService.deleteUrl(shortCode);
      setStats((prev) => prev.filter((stat) => stat.shortCode !== shortCode));
      showToast(`🗑️ Deleted ${shortCode}`, "success");
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to delete URL.";
      showToast(message, "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur opacity-30"></div>
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-white/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    📊 URL Analytics
                  </h2>
                  <p className="text-white/70">
                    Track your shortened URLs and their performance
                  </p>
                </div>
              </div>
            </div>

            {/* Loading content */}
            <div className="p-8">
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-white/20 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin"></div>
                </div>
                <div className="text-center">
                  <p className="text-white/90 font-semibold text-lg mb-2">
                    Loading your analytics...
                  </p>
                  <p className="text-white/60">
                    Gathering your URL performance data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
        <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    📊 URL Analytics
                  </h2>
                  <p className="text-white/70">
                    Track your shortened URLs and their performance
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-4">
                  {/* Sorting Controls */}
                  <div className="flex items-center space-x-3">
                    {/* Sort Criteria Dropdown */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) =>
                          setSortBy(
                            e.target.value as "clickCount" | "dateAdded",
                          )
                        }
                        className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer hover:bg-white/15 transition-all duration-300"
                      >
                        <option
                          value="clickCount"
                          className="bg-gray-900 text-white"
                        >
                          📊 Click Count
                        </option>
                        <option
                          value="dateAdded"
                          className="bg-gray-900 text-white"
                        >
                          📅 Date Added
                        </option>
                      </select>
                    </div>

                    {/* Sort Order Toggle */}
                    <button
                      onClick={toggleSortOrder}
                      className="group relative px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-xl transition-all duration-300 transform hover:scale-105"
                      title={`Sort ${
                        sortOrder === "desc" ? "Descending" : "Ascending"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-white/80 text-sm font-medium">
                          {sortOrder === "desc" ? "↓" : "↑"}
                        </span>
                        <span className="text-white/60 text-xs">
                          {sortOrder === "desc" ? "DESC" : "ASC"}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Total URLs Counter */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {stats.length}
                    </div>
                    <div className="text-sm text-white/60">Total URLs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {stats.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full flex items-center justify-center border border-white/10">
                    <svg
                      className="w-12 h-12 text-white/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No URLs yet
                </h3>
                <p className="text-white/60 mb-6 max-w-md mx-auto">
                  Start by shortening your first URL above and watch your
                  analytics come to life!
                </p>
                <div className="inline-flex items-center space-x-2 text-purple-300 font-medium">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  <span>Create your first short URL above</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedStats.map((stat, index) => (
                  <div
                    key={stat.shortCode}
                    onMouseEnter={() => setHoveredRow(stat.shortCode)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className="group relative animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl blur transition-all duration-300 ${
                        hoveredRow === stat.shortCode
                          ? "opacity-40"
                          : "opacity-0"
                      }`}
                    ></div>

                    <div
                      className={`relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 ${
                        hoveredRow === stat.shortCode
                          ? "transform scale-[1.02]"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 flex-1">
                          {/* Short Code */}
                          <div className="flex-shrink-0">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                  />
                                </svg>
                              </div>
                              <div>
                                <div className="font-mono text-lg font-bold text-white bg-gradient-to-r from-purple-200 to-indigo-200 bg-clip-text">
                                  {stat.shortCode}
                                </div>
                                <div className="text-sm text-white/50">
                                  Short Code
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Original URL */}
                          <div className="flex-1 min-w-0">
                            <div className="text-white/90 font-medium truncate mb-1">
                              {stat.originalUrl}
                            </div>
                            <a
                              href={stat.originalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 text-indigo-300 hover:text-indigo-200 transition-colors duration-200 text-sm"
                            >
                              <span>Visit original</span>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          </div>

                          {/* Click Count */}
                          <div className="flex-shrink-0 text-center">
                            <div className="relative inline-block">
                              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-xl blur"></div>
                              <div className="relative px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-xl backdrop-blur">
                                <div className="text-2xl font-bold text-green-300">
                                  {stat.clickCount}
                                </div>
                                <div className="text-xs text-green-200/80 font-medium">
                                  clicks
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-6">
                          <button
                            onClick={() => copyShortUrl(stat.shortCode)}
                            className="group/btn relative px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-400/30 hover:border-indigo-400/50 text-indigo-300 hover:text-indigo-200 font-medium rounded-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              <span>Copy</span>
                            </div>
                          </button>

                          {user && (
                            <button
                              onClick={() => deleteUrl(stat.shortCode)}
                              className="group/btn relative px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-400/30 hover:border-red-400/50 text-red-300 hover:text-red-200 font-medium rounded-xl transition-all duration-300 transform hover:scale-105"
                            >
                              <div className="flex items-center space-x-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                <span>Delete</span>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
