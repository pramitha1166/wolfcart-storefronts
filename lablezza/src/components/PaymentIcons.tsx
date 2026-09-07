import React from "react";

export function PaymentIcons({ className = "", iconClassName = "h-5" }: { className?: string; iconClassName?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Visa */}
      <img src="/images/visa-logo.jpg" alt="Visa" className={`${iconClassName} w-auto object-contain rounded-[2px] border border-line`} />
      {/* Mastercard */}
      <img src="/images/mastercard-logo.png" alt="Mastercard" className={`${iconClassName} w-auto object-contain rounded-[2px] border border-line bg-surface p-[1px]`} />
      {/* Amex */}
      <img src="/images/amex-logo.png" alt="Amex" className={`${iconClassName} w-auto object-contain rounded-[2px] border border-line bg-surface`} />
      {/* FriMi */}
      <img src="/images/frimi-logo.png" alt="FriMi" className={`${iconClassName} w-auto object-contain rounded-[2px] border border-line`} />
    </div>
  );
}
