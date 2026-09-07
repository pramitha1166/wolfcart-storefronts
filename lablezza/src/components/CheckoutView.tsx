import { Cart, formatLKR, ShippingAddress, ShippingRate } from "../types";
import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Loader, ArrowLeft, ArrowRight, Check, MapPin, CreditCard, Truck } from "lucide-react";
import { Init as DirectPayInit } from "directpay-ipg-js";

interface CheckoutViewProps {
  cart: Cart | null;
  onSuccess: (orderId: string, method: "cod" | "payhere" | "bank_transfer" | "directpay", paymentData?: any) => void;
  onBack: () => void;
}

export default function CheckoutView({ cart, onSuccess, onBack }: CheckoutViewProps) {
  const [step, setStep] = useState<"info" | "shipping" | "payment">("info");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; amount: number } | null>(
    cart?.discountCode ? { code: cart.discountCode, amount: cart.discountAmount || 0 } : null
  );

  // Address State
  const [email, setEmail] = useState(() => localStorage.getItem("wc_checkout_email") || "");
  const [phone, setPhone] = useState(() => localStorage.getItem("wc_checkout_phone") || "");
  const [firstName, setFirstName] = useState(() => localStorage.getItem("wc_checkout_firstName") || "");
  const [lastName, setLastName] = useState(() => localStorage.getItem("wc_checkout_lastName") || "");
  const [address1, setAddress1] = useState(() => localStorage.getItem("wc_checkout_address1") || "");
  const [address2, setAddress2] = useState(() => localStorage.getItem("wc_checkout_address2") || "");
  const [city, setCity] = useState(() => localStorage.getItem("wc_checkout_city") || "");
  const [province, setProvince] = useState(() => localStorage.getItem("wc_checkout_province") || "");
  const [postalCode, setPostalCode] = useState(() => localStorage.getItem("wc_checkout_postalCode") || "");
  const [country, setCountry] = useState(() => localStorage.getItem("wc_checkout_country") || "LK"); // Default Sri Lanka

  // Shipping Rates & Selected Method
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  // Payment Configuration Options & Selected Gateway
  const [paymentOptions, setPaymentOptions] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const loadCheckoutConfig = async () => {
    try {
      const config = await api.getCheckoutConfig();
      const payments = config?.payment || [];
      setPaymentOptions(payments);
      setSelectedPayment(payments.length > 0 ? payments[0] : null);
    } catch (err) {
      console.error("[Failed to load checkout config]:", err);
      setPaymentOptions([]);
      setSelectedPayment(null);
    }
  };

  useEffect(() => {
    loadCheckoutConfig();
  }, []);

  const calculateTotal = () => {
    const cartSubtotal = cart?.subtotal || 0;
    const shippingCost = selectedRate?.price || 0;
    const discount = appliedCoupon?.amount || 0;
    return Math.max(0, cartSubtotal - discount + shippingCost);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !cart?.id) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const updatedCart = await api.applyCoupon(cart.id, couponCode.trim());
      setAppliedCoupon({
        code: updatedCart.discountCode || couponCode,
        amount: updatedCart.discountAmount || 0,
      });
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
      await api.removeCoupon(cart.id);
      setAppliedCoupon(null);
      setCouponCode("");
    } catch (err) {
      console.error(err);
    } finally {
      setCouponLoading(false);
    }
  };

  // Step 1: Submit info, query shipping rates dynamically
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart?.id || !email || !firstName || !lastName || !address1 || !city || !postalCode) return;

    // Save shipping address and contact info to localStorage
    localStorage.setItem("wc_checkout_email", email);
    localStorage.setItem("wc_checkout_phone", phone);
    localStorage.setItem("wc_checkout_firstName", firstName);
    localStorage.setItem("wc_checkout_lastName", lastName);
    localStorage.setItem("wc_checkout_address1", address1);
    localStorage.setItem("wc_checkout_address2", address2);
    localStorage.setItem("wc_checkout_city", city);
    localStorage.setItem("wc_checkout_province", province);
    localStorage.setItem("wc_checkout_postalCode", postalCode);
    localStorage.setItem("wc_checkout_country", country);

    try {
      setLoadingRates(true);
      setError(null);
      setStep("shipping");
      const rates = await api.getShippingRates(
        cart.id,
        { country, city, postalCode },
        cart.subtotal || 0,
        cart.itemCount || 1
      );
      if (rates && rates.length > 0) {
        // Double-safe mapping in case api.ts is cached in the browser
        const mappedRates = rates.map((r: any) => ({
          ...r,
          price: r.price !== undefined ? r.price : (r.amountCents ?? 0),
          isFree: r.isFree ?? (r.price === 0 || r.amountCents === 0),
        })) as ShippingRate[];
        setShippingRates(mappedRates);
        setSelectedRate(mappedRates[0]);
      } else {
        setShippingRates([]);
        setSelectedRate(null);
        setError("No shipping methods available for your address. Please verify your address details.");
      }
    } catch (err: any) {
      console.error(err);
      setShippingRates([]);
      setSelectedRate(null);
      setError(err?.message || "Failed to load shipping rates. Please try again.");
    } finally {
      setLoadingRates(false);
    }
  };

  // Step 2: Proceed to payment configurations selection
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRate) {
      setStep("payment");
    }
  };

  // Step 3: Trigger real order create, payment initiate and gateway redirect submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart?.id || !selectedRate || !selectedPayment) return;

    try {
      setSubmittingOrder(true);
      setError(null);

      // Create a fresh server-side cart and populate it with items to ensure the backend has the cart
      // "Here when creating order, please call add to cart apis as well."
      let finalCartId = cart.id;
      try {
        console.log("[Checkout] Creating and syncing fresh server-side cart...");
        const serverCart = await api.createCart();
        for (const item of cart.items) {
          await api.addToCart(serverCart.id, item.variantId, item.quantity);
        }
        finalCartId = serverCart.id;
        console.log(`[Checkout] Server-side cart synced successfully with ID: ${finalCartId}`);
      } catch (syncErr: any) {
        console.warn("[Checkout] Server-side cart synchronization failed. Using current cart ID as fallback:", syncErr);
      }

      const shippingAddress: ShippingAddress = {
        firstName,
        lastName,
        address1,
        address2: address2 || undefined,
        city,
        province: province || undefined,
        postalCode,
        country,
        phone,
      };

      // Create booking order using synced cart ID
      const order = await api.createOrder({
        cartId: finalCartId,
        email,
        shippingAddress,
        shippingMethodId: selectedRate.id,
        note: `Selected standard ${selectedPayment.name} gateway.`,
      });

      // Initiate payment
      const pData = await api.initiatePayment(order.id, selectedPayment.key);

      // Branch action results as described in the documentation
      if (pData.method === "directpay") {
        console.log("[DirectPay] Initiating checkout via npm module...");

        const dp = new DirectPayInit({
          signature: pData.params.signature,
          dataString: pData.params.data,
          stage: pData.sandbox ? "DEV" : "PROD",
          container: "directpay-container",
        });

        try {
          const dpResponse = await dp.doInAppCheckout();
          console.log("[DirectPay Success]:", dpResponse);
          onSuccess(order.id, "directpay", dpResponse);
        } catch (dpError: any) {
          console.error("[DirectPay Error]:", dpError);
          if (dpError?.dismissed || dpError?.cancelled || dpError?.code === "DISMISSED") {
            setError("Payment was cancelled. You can try again.");
          } else {
            setError(dpError?.message || "Payment gateway encountered an error.");
          }
          setSubmittingOrder(false);
        }
      } else if (pData.method === "payhere") {
        // Build hidden HTML form injection & submit for PayHere redirect
        const url = pData.payhereUrl;
        const params = pData.params;
        console.log(`[Checkout] Spawning external redirect form for PayHere -> ${url}`);
        const form = document.createElement("form");
        form.method = "POST";
        form.action = url;

        Object.entries(params).forEach(([key, val]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(val);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        // Cash on delivery or local transfer success directly
        onSuccess(order.id, pData.method, pData);
      }
    } catch (err: any) {
      console.error("[Checkout Submitting Error]:", err);
      setError(err?.message || "Failed to place your order. Please verify details and try again.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 fade-in" id="checkout-container">
      {/* Hidden mount point required by DirectPay IPG v3 SDK for doInAppCheckout */}
      <div id="directpay-container" style={{ display: "none" }} />
      {/* Steps progress breadcrumbs */}
      <div className="flex items-center gap-3 text-xs font-mono tracking-widest uppercase border-b border-line pb-5 mb-8">
        <span className={step === "info" ? "text-heading font-bold" : "text-muted"}>INFO</span>
        <span className="text-muted">/</span>
        <span className={step === "shipping" ? "text-heading font-bold" : "text-muted"}>SHIPPING</span>
        <span className="text-muted">/</span>
        <span className={step === "payment" ? "text-heading font-bold" : "text-muted"}>PAYMENT</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-mono p-4 rounded-lg uppercase tracking-wide mb-6">
          ⚠️ Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Fill Forms Panel */}
        <div className="lg:col-span-7 space-y-8">
          {step === "info" && (
            <form onSubmit={handleInfoSubmit} className="space-y-6" id="info-step-form">
              <div className="space-y-4">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-heading flex items-center gap-2">
                  <MapPin size={15} />
                  Customer Information
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-mono uppercase text-muted mb-1">Email address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="border border-line text-xs px-4 py-3 w-full outline-none focus:border-primary rounded-lg bg-black/5"
                      id="checkout-email"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-mono uppercase text-muted mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 77 XXX XXXX"
                      className="border border-line text-xs px-4 py-3 w-full outline-none focus:border-primary rounded-lg bg-black/5"
                      id="checkout-phone"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-heading">
                  Shipping Address
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-muted mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Saman"
                      className="border border-line text-xs px-4 py-3 w-full outline-none focus:border-primary rounded-lg bg-black/5"
                      id="checkout-firstname"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-muted mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Perera"
                      className="border border-line text-xs px-4 py-3 w-full outline-none focus:border-primary rounded-lg bg-black/5"
                      id="checkout-lastname"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono uppercase text-muted mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                      placeholder="Suite, apartment name, street block"
                      className="border border-line text-xs px-4 py-3 w-full outline-none focus:border-primary rounded-lg bg-black/5"
                      id="checkout-address1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono uppercase text-muted mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={address2}
                      onChange={(e) => setAddress2(e.target.value)}
                      placeholder="Apt, floor suite details"
                      className="border border-line text-xs px-4 py-3 w-full outline-none focus:border-primary rounded-lg bg-black/5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-muted mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Colombo"
                      className="border border-line text-xs px-4 py-3 w-full outline-none focus:border-primary rounded-lg bg-black/5"
                      id="checkout-city"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-muted mb-1">Province / State</label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="Western"
                      className="border border-line text-xs px-4 py-3 w-full outline-none focus:border-primary rounded-lg bg-black/5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-muted mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="00700"
                      className="border border-line text-xs px-4 py-3 w-full outline-none focus:border-primary rounded-lg bg-black/5"
                      id="checkout-postalcode"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-muted mb-1">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="border border-line text-xs px-4 py-3 w-full outline-none focus:border-primary rounded-lg bg-black/5"
                    >
                      <option value="LK">Sri Lanka (LK)</option>
                      <option value="US">United States (US)</option>
                      <option value="GB">United Kingdom (GB)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs font-mono uppercase tracking-wider text-muted hover:text-heading cursor-pointer"
                >
                  Return to Cart
                </button>
                <button
                  type="submit"
                  className="h-12 px-6 bg-primary hover:bg-primary text-primary-fg font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2 rounded-lg cursor-pointer"
                  id="submit-info-action"
                >
                  Continue to Shipping
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {step === "shipping" && (
            <form onSubmit={handleShippingSubmit} className="space-y-6" id="shipping-step-form">
              <div className="space-y-4">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-heading flex items-center gap-2">
                  <Truck size={15} />
                  Choose Delivery Method
                </h2>

                {loadingRates ? (
                  <div className="flex items-center gap-3 py-10 justify-center">
                    <Loader className="animate-spin text-muted" size={18} />
                    <span className="font-mono text-xs text-muted">Querying live courier dispatch indexes...</span>
                  </div>
                ) : (
                  <div className="space-y-3" id="shipping-rates-list">
                    {shippingRates.map((rate) => (
                      <label
                        key={rate.id}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${selectedRate?.id === rate.id ? "border-primary bg-black/5" : "border-line hover:border-primary bg-surface"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingRate"
                            checked={selectedRate?.id === rate.id}
                            onChange={() => setSelectedRate(rate)}
                            className="text-heading focus:ring-primary"
                          />
                          <div>
                            <span className="block text-xs font-mono font-bold text-body">{rate.name}</span>
                            <span className="block text-[11px] text-muted font-light mt-0.5">{rate.description}</span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-body">
                          {rate.price === 0 ? "Free" : formatLKR(rate.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep("info")}
                  className="text-xs font-mono uppercase tracking-wider text-muted hover:text-heading cursor-pointer"
                >
                  Return to Details
                </button>
                <button
                  type="submit"
                  disabled={!selectedRate}
                  className="h-12 px-6 bg-primary hover:bg-primary text-primary-fg font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2 rounded-lg cursor-pointer"
                  id="submit-shipping-action"
                >
                  Continue to Payment
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6" id="payment-step-form">
              <div className="space-y-4">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-heading flex items-center gap-2">
                  <CreditCard size={15} />
                  Select Gateway Provider
                </h2>

                <div className="space-y-3" id="payment-options-list">
                  {paymentOptions.map((opt) => (
                    <label
                      key={opt.key}
                      className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${selectedPayment?.key === opt.key ? "border-primary bg-black/5" : "border-line hover:border-primary bg-surface"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={selectedPayment?.key === opt.key}
                          onChange={() => setSelectedPayment(opt)}
                          className="text-heading focus:ring-primary"
                        />
                        <div>
                          <span className="block text-xs font-mono font-bold text-body">{opt.name}</span>
                          <span className="block text-[11px] text-muted font-light mt-0.5">{opt.description}</span>
                        </div>
                      </div>

                      {/* Sampath Bank details notice if Bank Transfer Selected */}
                      {opt.key === "bank_transfer" && selectedPayment?.key === "bank_transfer" && (
                        <div className="mt-3 bg-surface p-3 border border-line rounded text-[11px] text-muted space-y-1 font-mono">
                          <p className="font-bold underline">{opt.bankDetails?.bankName || "Sampath Bank"} Wire Credentials:</p>
                          <p>Bank: {opt.bankDetails?.bankName || "Sampath Bank PLC"}</p>
                          <p>Account: {opt.bankDetails?.accountName || "WolfCart (Pvt) Ltd"}</p>
                          <p>Branch: {opt.bankDetails?.branch || "Colombo 07"}</p>
                          <p className="text-[10px] text-muted font-light mt-1 italic">Account number will be revealed after order is placed.</p>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>


              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep("shipping")}
                  className="text-xs font-mono uppercase tracking-wider text-muted hover:text-heading cursor-pointer"
                >
                  Return to Shipping
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="h-12 px-8 bg-primary hover:bg-primary text-primary-fg font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2 rounded-lg cursor-pointer"
                  id="submit-payment-action"
                >
                  {submittingOrder ? (
                    <>
                      <Loader className="animate-spin" size={14} />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      Finalize & Pay {formatLKR(calculateTotal())}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Order Items Summary Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-black/5 border border-line rounded-lg p-6 space-y-6 sticky top-24">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-heading border-b border-line pb-3">
              Your Order Contents
            </h3>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {cart?.items.map((item) => (
                <div key={item.variantId} className="flex gap-3 text-xs">
                  <div className="h-16 w-12 bg-surface flex-shrink-0 border overflow-hidden">
                    <img src={item.imageUrl} alt={item.productName} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="font-semibold text-body leading-tight line-clamp-1">{item.productName}</h4>
                      <p className="text-[10px] font-mono text-muted mt-0.5">Size {item.variantTitle} × {item.quantity}</p>
                    </div>
                    <span className="font-mono text-heading font-medium">{formatLKR(item.lineTotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-t border-line" />

            {/* Coupon Input Area */}
            <div className="space-y-3">
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
                    className="bg-primary text-white px-4 py-2 text-xs font-mono uppercase tracking-wider rounded hover:opacity-90 disabled:opacity-50"
                  >
                    {couponLoading ? "Applying" : "Apply"}
                  </button>
                )}
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    disabled={couponLoading}
                    className="bg-black/5 text-body px-4 py-2 text-xs font-mono uppercase tracking-wider rounded hover:opacity-80 disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              {couponError && <p className="text-[10px] text-red-500 font-mono mt-1">{couponError}</p>}
            </div>

            <hr className="border-t border-line" />

            {/* Price Calculations breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <span>Items Subtotal</span>
                <span className="font-mono">{formatLKR(cart?.subtotal || 0)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-indigo-600 font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span className="font-mono">-{formatLKR(appliedCoupon.amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Shipping Method Cost</span>
                <span className="font-mono">
                  {selectedRate ? (selectedRate.price === 0 ? "Free" : formatLKR(selectedRate.price)) : "Calculated next"}
                </span>
              </div>
              <hr className="border-t border-line my-1.5" />
              <div className="flex justify-between text-heading text-sm font-semibold">
                <span>Total Amount Due</span>
                <span className="font-mono text-base font-bold">{formatLKR(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
