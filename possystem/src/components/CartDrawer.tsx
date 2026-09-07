import { useState } from "react";
import { Cart, formatLKR } from "../types";
import { api } from "../api";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart | null;
  onUpdateQty: (variantId: string, quantity: number) => Promise<void>;
  onRemoveItem: (variantId: string) => Promise<void>;
  onCheckout: () => void;
  onCartUpdated?: (cart: Cart) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  onCartUpdated,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const items = cart?.items || [];
  const itemCount = cart?.itemCount || 0;
  const subtotal = cart?.subtotal || 0;

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const appliedCoupon = cart?.discountCode ? { code: cart.discountCode, amount: cart.discountAmount || 0 } : null;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !cart?.id) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const updatedCart = await api.applyCoupon(cart.id, couponCode.trim());
      if (onCartUpdated) onCartUpdated(updatedCart);
      setCouponCode("");
    } catch (err: any) {
      setCouponError(err?.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!cart?.id) return;
    setCouponLoading(true);
    try {
      const updatedCart = await api.removeCoupon(cart.id);
      if (onCartUpdated) onCartUpdated(updatedCart);
    } catch (err) {
      console.error(err);
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-55 overflow-hidden fade-in" id="cart-drawer-overlay">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="pointer-events-auto w-screen max-w-md transform bg-surface shadow-2xl flex flex-col h-full border-l border-line">
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-body" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-heading">
                Shopping Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-muted hover:text-heading transition-colors cursor-pointer focus:outline-none"
              id="close-cart-drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Scrollable Items list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5" id="cart-drawer-items">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                <div className="h-12 w-12 rounded-full bg-black/5 flex items-center justify-center text-muted">
                  <ShoppingBag size={22} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold lowercase">your bag is empty</p>
                  <p className="text-[11px] text-muted font-light tracking-wide max-w-xxs leading-relaxed">
                    Browse our POS terminals, scanners and printers and add items to your cart to buy.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="border border-primary text-[10px] font-mono font-bold tracking-widest uppercase text-heading px-6 py-2.5 rounded hover:bg-primary hover:text-primary-fg transition-all cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="flex gap-4 pb-4 border-b border-line" id={`cart-item-${item.variantId}`}>
                  {/* Thumbnail */}
                  <div className="h-24 w-18 flex-shrink-0 overflow-hidden bg-black/5 border border-line">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200"}
                      alt={item.productName}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  {/* Core details Column */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xs font-semibold text-body leading-tight line-clamp-2">
                          {item.productName}
                        </h3>
                        <span className="font-mono text-xs font-semibold text-heading flex-shrink-0">
                          {formatLKR(item.lineTotal)}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-muted uppercase tracking-wider mt-1">
                        Size: {item.variantTitle || "Default"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Toggles */}
                      <div className="flex items-center border border-line h-8 bg-black/5/50 rounded">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.variantId, item.quantity - 1)}
                          className="px-2.5 text-muted hover:text-heading cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="font-mono text-[11px] font-medium text-body w-5 text-center px-0.5">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.variantId, item.quantity + 1)}
                          className="px-2.5 text-muted hover:text-heading cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Remove Trash */}
                      <button
                        onClick={() => onRemoveItem(item.variantId)}
                        className="p-1 text-muted hover:text-red-500 transition-colors focus:outline-none cursor-pointer"
                        id={`remove-${item.variantId}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer summary */}
          {items.length > 0 && (
            <div className="border-t border-line bg-black/5/55 p-6 space-y-4">
              
              {/* Coupon Input Area */}
              <div className="space-y-2 mb-4">
                <label className="block text-[10px] font-mono uppercase text-muted">Discount Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="border border-line text-xs px-3 py-2 flex-1 outline-none focus:border-primary rounded bg-surface font-mono uppercase"
                    disabled={couponLoading || !!appliedCoupon}
                  />
                  {!appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || couponLoading}
                      className="bg-primary text-white px-4 py-2 text-xs font-mono uppercase tracking-wider rounded hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  )}
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="bg-black/5 text-body px-4 py-2 text-xs font-mono uppercase tracking-wider rounded hover:opacity-80 cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-mono mt-1">{couponError}</p>}
              </div>

              <div className="flex items-center justify-between text-muted">
                <span className="text-xs font-mono uppercase tracking-wider">Subtotal</span>
                <span className="font-mono text-sm">{formatLKR(subtotal)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex items-center justify-between text-indigo-600 font-medium">
                  <span className="text-xs font-mono uppercase tracking-wider">Discount ({appliedCoupon.code})</span>
                  <span className="font-mono text-sm">-{formatLKR(appliedCoupon.amount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-line">
                <span className="text-sm font-mono uppercase tracking-wider text-heading font-bold">Total</span>
                <span className="font-mono text-lg font-bold text-heading">
                  {formatLKR(Math.max(0, subtotal - (appliedCoupon?.amount || 0)))}
                </span>
              </div>

              <p className="text-[10px] text-muted leading-relaxed font-light">
                Shipping rates are calculated dynamically during checkout.
              </p>

              <button
                onClick={onCheckout}
                className="w-full h-12 bg-primary text-primary-fg font-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 rounded-lg hover:bg-primary cursor-pointer focus:outline-none"
                id="cart-drawer-checkout"
              >
                Proceed to Checkout
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
