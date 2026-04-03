"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Chọn…",
  disabled,
  loading,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);

  const filtered = options.filter(
    (o) => !search || o.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((s) => s !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const remove = (val: string) => onChange(selected.filter((s) => s !== val));

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabels = selected
    .map((v) => options.find((o) => o.value === v)?.label ?? v)
    .sort();

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) setSearch("");
        }}
        className={cn(
          "flex min-h-[42px] w-full flex-wrap items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          "dark:border-gray-700 dark:bg-gray-950",
          "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          selected.length === 0 ? "text-gray-500" : "text-gray-900 dark:text-gray-100"
        )}
      >
        {loading ? (
          <span className="text-gray-400">Đang tải…</span>
        ) : selected.length === 0 ? (
          <span>{placeholder}</span>
        ) : (
          selectedLabels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-0.5 text-xs font-medium"
            >
              {label}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  const val = options.find((o) => o.label === label)?.value;
                  if (val) remove(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    const val = options.find((o) => o.label === label)?.value;
                    if (val) remove(val);
                  }
                }}
                className="ml-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                <X className="w-3 h-3" />
              </span>
            </span>
          ))
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm…"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-950 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-400">Không tìm thấy.</p>
            ) : (
              filtered.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(opt.value)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                      isSelected
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    {/* Checkbox indicator */}
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs font-bold",
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 dark:border-gray-600"
                      )}
                    >
                      {isSelected && "✓"}
                    </span>
                    {opt.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
