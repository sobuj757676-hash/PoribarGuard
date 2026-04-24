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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-6 w-full max-w-lg mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Manual Payment</h3>
                <button onClick={onCancel} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-emerald-800 dark:text-emerald-400 font-medium mb-2" dangerouslySetInnerHTML={{ __html: selectedMethod?.instructions || `আপনার এজেন্টকে এই নাম্বারে <span class="font-bold text-lg">${amount}৳</span> পাঠাতে বলুন এবং নিচের ফর্মটি পূরণ করুন।` }} />
                <div className="flex items-center justify-between mt-3 bg-white dark:bg-slate-800 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
                    <div className="flex items-center gap-3">
                        {selectedMethod?.logoUrl ? (
                            <Image src={selectedMethod.logoUrl} alt={selectedMethod.name} width={24} height={24} className="rounded-sm" />
                        ) : (
                            <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                        )}
                        <span className="font-black text-xl text-emerald-900 dark:text-emerald-300 tracking-wider">{selectedMethod?.phoneNumber || "N/A"}</span>
                    </div>
                    <button type="button" onClick={handleCopy} className="p-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-800 dark:hover:bg-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-md transition-colors" title="Copy Number">
                        <Copy className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {paymentMethods && paymentMethods.length > 1 && (
                    <div>
                        <label htmlFor="methodId" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Method</label>
                        <div className="grid grid-cols-2 gap-3">
                            {paymentMethods.map(m => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setMethodId(m.id)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${methodId === m.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'}`}
                                >
                                    {m.logoUrl && <Image src={m.logoUrl} alt={m.name} width={32} height={32} className="mb-2" />}
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (৳)</label>
                        <input
                            type="text"
                            id="amount"
                            aria-label="Amount sent"
                            value={amount}
                            disabled
                            className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label htmlFor="senderDigits" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Sender Last 3/4 Digits</label>
                        <input
                            type="text"
                            id="senderDigits"
                            aria-label="Sender Last Digits"
                            value={senderDigits}
                            onChange={(e) => setSenderDigits(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="e.g. 567"
                            required
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Screenshot Upload</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-800/50">
                        <div className="space-y-1 text-center">
                            {screenshotPreview ? (
                                <div className="relative w-32 h-40 mx-auto mb-4 rounded overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <Image src={screenshotPreview} alt="Screenshot Preview" layout="fill" objectFit="cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setScreenshotPreview(null); setScreenshotBase64(''); }}
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                            )}
                            <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                                <label
                                    htmlFor="screenshot-upload"
                                    className="relative cursor-pointer bg-white dark:bg-slate-900 rounded-md font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500 px-2 py-1"
                                >
                                    <span>Upload a file</span>
                                    <input id="screenshot-upload" name="screenshot-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                                </label>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        type="submit"
                        disabled={isSubmitting || !screenshotBase64 || senderDigits.length < 3}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Processing...</>
                        ) : (
                            <><CheckCircle className="-ml-1 mr-2 h-5 w-5" /> Submit Request</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
