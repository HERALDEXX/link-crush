"use client";

import { useState } from "react";
import { apiService } from "@/lib/api";

interface URLShortenerFormProps {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  onShortened?: () => void;
}

export default function URLShortenerForm({
  showToast,
  onShortened,
}: URLShortenerFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    shortUrl: string;
    originalUrl: string;
  } | null>(null);

  const normalizeUrl = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)) {
      return trimmed;
    }

    return `https://${trimmed}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      showToast("Please enter a URL to shorten", "error");
      return;
    }

    const normalizedUrl = normalizeUrl(url);

    setLoading(true);
    setResult(null);

    try {
      const response = await apiService.shortenUrl(normalizedUrl);
      setResult({
        shortUrl: response.shortUrl!,
        originalUrl: response.originalUrl,
      });

      onShortened?.();

      if (response.message) {
        showToast(response.message, "info");
      } else {
        showToast("✨ URL shortened successfully!", "success");
      }
    } catch (error: any) {
      showToast(
        error.response?.data?.error || "Failed to shorten URL",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result?.shortUrl) return;

    try {
      await navigator.clipboard.writeText(result.shortUrl);
      showToast("🎉 Link copied to clipboard!", "success");
    } catch (error) {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const resetForm = () => {
    setUrl("");
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-indigo-500/30 to-purple-500/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-all duration-500 animate-pulse"></div>

        {/* Main container */}
        <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input section */}
            <div className="relative">
              <label className="block text-white/90 font-semibold text-lg mb-4">
                🔗 Enter your URL to transform
              </label>

              <div className="relative group/input">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/50 to-indigo-500/50 rounded-2xl blur opacity-0 group-hover/input:opacity-30 transition-all duration-300"></div>
                <input
                  type="text"
                  inputMode="url"
                  placeholder="your-super-long-url-here.com/with/many/parameters"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="relative w-full px-6 py-4 bg-white/10 backdrop-blur border border-white/30 rounded-2xl text-white placeholder-white/50 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 hover:bg-white/15 hover:border-white/40"
                  required
                  disabled={loading}
                />
                {url && !loading && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors duration-200"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="relative group/btn w-full py-4 px-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/10 to-purple-400/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center justify-center space-x-3">
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating magic...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6"
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
                    <span>✨ Shorten URL</span>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Loading animation */}
          {loading && (
            <div className="mt-8 text-center animate-fade-in">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <p className="text-white/80 font-medium">
                  Crafting your perfect short URL...
                </p>
              </div>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="mt-8 animate-fade-in">
              <div className="relative group/result">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl blur opacity-50"></div>
                <div className="relative bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-2xl p-6 backdrop-blur">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      🎉 Success! Your link is ready
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Short URL display */}
                    <div className="relative group/copy">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/10 rounded-xl blur opacity-0 group-hover/copy:opacity-50 transition-all duration-300"></div>
                      <div className="relative flex items-center bg-white/10 backdrop-blur rounded-xl border border-white/30 overflow-hidden">
                        <input
                          type="text"
                          value={result.shortUrl}
                          readOnly
                          className="flex-1 px-4 py-3 bg-transparent text-white font-mono text-lg focus:outline-none selection:bg-purple-500/30"
                        />
                        <button
                          onClick={copyToClipboard}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                        >
                          <div className="flex items-center space-x-2">
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
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <span>Copy</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Original URL preview */}
                    <div className="text-sm text-white/60">
                      <span className="font-medium">Original: </span>
                      <span className="font-mono break-all">
                        {result.originalUrl}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
