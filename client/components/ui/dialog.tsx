"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          "relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800", className)}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-lg font-semibold text-gray-900 dark:text-white", className)}>{children}</h2>;
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-gray-500 mt-1", className)}>{children}</p>;
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3", className)}>{children}</div>;
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "destructive" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open, title, message, confirmLabel = "Xác nhận",
  confirmVariant = "destructive", loading = false, onConfirm, onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="max-w-sm">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </DialogHeader>
      <DialogContent>
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={loading}
          className={confirmVariant === "destructive" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
        >
          {loading ? "Đang xử lý…" : confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
