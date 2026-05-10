import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Upload, Phone, CheckCircle, AlertCircle, X, Copy } from 'lucide-react';
import Image from 'next/image';

export default function ManualPaymentForm({ packageId, amount, packageName, onCancel, onSuccess, paymentMethods, initialMethodId }) {
    const defaultMethod = paymentMethods?.find(m => m.id === initialMethodId) || paymentMethods?.[0];
    const [methodId, setMethodId] = useState(defaultMethod?.id || '');
    const [senderDigits, setSenderDigits] = useState('');
    const [screenshotBase64, setScreenshotBase64] = useState('');
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedMethod = paymentMethods?.find(m => m.id === methodId);

    const handleCopy = () => {
        if (selectedMethod?.phoneNumber) {
            navigator.clipboard.writeText(selectedMethod.phoneNumber);
            toast.success("Number copied to clipboard");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Ensure it's an image
        if (!file.type.startsWith('image/')) {
            toast.error("Please upload a valid image file.");
            return;
        }

        // Limit size (e.g. 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File is too large. Max size is 5MB.");
            return;
        }

        setScreenshotPreview(URL.createObjectURL(file));

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setScreenshotBase64(reader.result);
        };
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            toast.error("Failed to read file.");
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (senderDigits.length < 3) {
            toast.error("Please enter the last 3 or 4 digits of the sender number.");
            return;
        }

        if (!screenshotBase64) {
            toast.error("Please upload a screenshot of the payment.");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/subscriptions/manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId,
                    method: selectedMethod?.name || 'Manual',
                    amount,
                    senderDigits,
                    screenshotUrl: screenshotBase64
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("আপনার পেমেন্ট রিকোয়েস্ট জমা হয়েছে। ভেরিফিকেশনের জন্য অপেক্ষা করুন।");
                if (onSuccess) onSuccess(data.payment);
            } else {
                toast.error(data.error || "Failed to submit request.");
            }
        } catch (err) {
            toast.error("A network error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            {/* Title */}
            <div className="mb-4">
                <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">Manual Payment</h2>
                <p className="text-sm text-slate-500">Send money to our number and submit proof below.</p>
            </div>

            {/* Merchant Number Card */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 mb-5">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-2" dangerouslySetInnerHTML={{ __html: selectedMethod?.instructions || `Send <span class="font-bold">৳${amount}</span> to our merchant number:` }} />
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
                    <div className="flex items-center gap-3 min-w-0">
                        {selectedMethod?.logoUrl ? (
                            <Image src={selectedMethod.logoUrl} alt={selectedMethod.name} width={24} height={24} className="rounded-sm flex-shrink-0" />
                        ) : (
                            <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
                        )}
                        <span className="font-black text-lg md:text-xl text-emerald-900 dark:text-emerald-300 tracking-wider truncate">{selectedMethod?.phoneNumber || "N/A"}</span>
                    </div>
                    <button type="button" onClick={handleCopy} className="p-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-md transition-colors flex-shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center" title="Copy Number">
                        <Copy className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Method Selector */}
                {paymentMethods && paymentMethods.length > 1 && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Select Method</label>
                        <div className="grid grid-cols-2 gap-2">
                            {paymentMethods.map(m => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setMethodId(m.id)}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-bold min-h-[48px] ${methodId === m.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'}`}
                                >
                                    {m.logoUrl && <Image src={m.logoUrl} alt={m.name} width={20} height={20} className="rounded-sm" />}
                                    {m.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Amount & Sender Digits */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="amount" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Amount (৳)</label>
                        <input
                            type="text"
                            id="amount"
                            aria-label="Amount sent"
                            value={amount}
                            disabled
                            className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed font-semibold"
                        />
                    </div>
                    <div>
                        <label htmlFor="senderDigits" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Last 3-4 Digits</label>
                        <input
                            type="text"
                            id="senderDigits"
                            aria-label="Sender Last Digits"
                            value={senderDigits}
                            onChange={(e) => setSenderDigits(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="e.g. 567"
                            required
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow font-semibold"
                        />
                    </div>
                </div>

                {/* Screenshot Upload */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Payment Screenshot</label>
                    <div className="flex justify-center px-4 py-5 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-xl hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors bg-slate-50 dark:bg-slate-800/30">
                        <div className="space-y-2 text-center">
                            {screenshotPreview ? (
                                <div className="relative w-28 h-36 mx-auto rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <Image src={screenshotPreview} alt="Screenshot Preview" layout="fill" objectFit="cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setScreenshotPreview(null); setScreenshotBase64(''); }}
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black min-h-[28px] min-w-[28px] flex items-center justify-center"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <Upload className="mx-auto h-8 w-8 text-slate-400" />
                            )}
                            <div className="flex text-sm justify-center">
                                <label
                                    htmlFor="screenshot-upload"
                                    className="relative cursor-pointer rounded-md font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 px-2 py-1 min-h-[36px] flex items-center"
                                >
                                    <span>{screenshotPreview ? 'Change file' : 'Upload a file'}</span>
                                    <input id="screenshot-upload" name="screenshot-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                                </label>
                            </div>
                            <p className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting || !screenshotBase64 || senderDigits.length < 3}
                    className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20 min-h-[52px] active:scale-[0.98]"
                >
                    {isSubmitting ? (
                        <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Processing...</>
                    ) : (
                        <><CheckCircle className="-ml-1 mr-2 h-5 w-5" /> Submit Payment Request</>
                    )}
                </button>
            </form>
        </div>
    );
}
