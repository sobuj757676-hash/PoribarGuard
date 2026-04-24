import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Upload, Phone, CheckCircle, AlertCircle, X } from 'lucide-react';
import Image from 'next/image';

export default function ManualPaymentForm({ packageId, amount, packageName, onCancel, onSuccess }) {
    const [method, setMethod] = useState('bKash');
    const [senderDigits, setSenderDigits] = useState('');
    const [screenshotBase64, setScreenshotBase64] = useState('');
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const bKashNumber = "017XXXXXXXX"; // TODO: Could fetch from SystemConfig
    const nagadNumber = "018XXXXXXXX";

    const currentNumber = method === 'bKash' ? bKashNumber : nagadNumber;

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
                    method,
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

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800 dark:text-amber-400 font-medium mb-2">
                    আপনার এজেন্টকে এই নাম্বারে <span className="font-bold text-lg">{amount}৳</span> পাঠাতে বলুন এবং নিচের ফর্মটি পূরণ করুন।
                </p>
                <div className="flex items-center gap-2 mt-2">
                    <Phone className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                    <span className="font-black text-xl text-amber-900 dark:text-amber-300">{currentNumber}</span>
                    <span className="text-xs uppercase bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded font-bold ml-2">Personal</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="method" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                    <select
                        id="method"
                        aria-label="Payment Method"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                    </select>
                </div>

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
