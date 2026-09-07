import React from "react";
import { CheckCircle2, ArrowRight, Receipt, HelpCircle, FileText } from "lucide-react";
import { formatLKR } from "../types";

interface SuccessViewProps {
  orderId: string;
  method: "cod" | "payhere" | "bank_transfer" | "directpay";
  onReset: () => void;
  paymentData?: any;
}

export default function SuccessView({ orderId, method, onReset, paymentData }: SuccessViewProps) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-8 fade-in" id="success-view-container">
      {/* Decorative Badge */}
      <div className="flex justify-center">
        <div className="h-16 w-16 bg-emerald-50 text-emerald-550 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 size={38} className="stroke-emerald-500" />
        </div>
      </div>

      <div className="space-y-3">
        <span className="font-mono text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 rounded-full px-3 py-1 uppercase tracking-widest">
          Sync Status: Transacted Successfully
        </span>
        <h1 className="font-display text-3xl font-black text-heading uppercase tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-muted text-xs tracking-wide max-w-md mx-auto font-light leading-relaxed">
          Your order is locked into our system logs. We will begin preparing your POS hardware for dispatch immediately.
        </p>
      </div>

      <div className="bg-black/5 border border-line rounded-lg p-5 text-left text-xs space-y-4">
        <div className="flex justify-between items-center text-muted font-mono">
          <span>Ledger Order ID</span>
          <span className="font-bold text-heading">{orderId}</span>
        </div>
        <div className="flex justify-between items-center text-muted font-mono">
          <span>Selected Gateway</span>
          <span className="capitalize font-bold text-heading">{method.replace("_", " ")}</span>
        </div>

        {method === "bank_transfer" && (
          <div className="mt-2 pt-3 border-t border-line space-y-2 text-muted font-mono text-[11px] leading-relaxed">
            <p className="font-bold text-heading flex items-center gap-1.5 uppercase">
              <Receipt size={13} />
              Bank Transfer Instructions:
            </p>
            {paymentData?.instructions ? (
              <p className="text-heading font-medium mb-2">{paymentData.instructions}</p>
            ) : (
              <p>1. Transfer the exact invoice total amount using online banking or CDM depositor.</p>
            )}
            
            <div className="bg-surface p-3 rounded border border-line mt-2 space-y-1 text-heading">
              <p className="font-semibold underline uppercase text-[9px] tracking-wider text-muted mb-1">Target Account Details:</p>
              <p><span className="text-muted">Bank:</span> {paymentData?.bankDetails?.bankName || "Sampath Bank PLC"}</p>
              <p><span className="text-muted">Account:</span> {paymentData?.bankDetails?.accountName || "WolfCart (Pvt) Ltd"}</p>
              <p><span className="text-muted">Number:</span> <strong className="text-xs bg-black/5 border px-1.5 py-0.5 rounded">{paymentData?.bankDetails?.accountNumber || "1204 5928 2039"}</strong></p>
              <p><span className="text-muted">Branch:</span> {paymentData?.bankDetails?.branch || "Colombo 07"}</p>
            </div>
            
            <p className="mt-2">2. Set the comments/reference field to exactly: <strong className="text-heading text-xs bg-surface border border-line px-1.5 py-0.5 rounded">{orderId}</strong></p>
            <p>3. Capture the digital transaction screenshot and dispatch it to <strong className="text-heading">support@lablezza.wolfcart.shop</strong></p>
          </div>
        )}

        {method === "cod" && (
          <p className="mt-2 pt-3 border-t border-line text-[11px] text-muted font-light flex items-start gap-1.5 leading-relaxed">
            <HelpCircle size={14} className="flex-shrink-0 text-muted" />
            Please prepare the exact cash notes for the courier. A verification dispatch confirmation SMS will hit your mobile phone shortly.
          </p>
        )}
      </div>

      <button
        onClick={onReset}
        className="w-full h-12 bg-primary text-primary-fg font-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 rounded-lg hover:bg-primary cursor-pointer focus:outline-none shadow-lg transition-all"
        id="success-home-btn"
      >
        Continue Shopping
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
