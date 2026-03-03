"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, CheckCheck, Phone, Video, MoreVertical, Paperclip, Camera, Mic } from "lucide-react";

export default function WhatsAppExplainer() {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    // The chat script: simulating a real conversation
    const chatMessages = [
        {
            id: 1,
            sender: "me", // The curious parent (e.g., Kalam Bhai)
            text: "রহিম ভাই, ছেলেটা সারাদিন কী করে খুব টেনশন লাগে। ফোন দিলে ধরে না।",
            time: "১০:৪৫ এএম"
        },
        {
            id: 2,
            sender: "them", // The experienced parent (e.g., Rahim Bhai)
            text: "আরে ভাই, আমি তো PoribarGuard ব্যবহার করি। টেনশন একদম জিরো।",
            time: "১০:৪৭ এএম"
        },
        {
            id: 3,
            sender: "me",
            text: "কীভাবে? ফোন না ধরলে বুঝবেন কেমনে সে কোথায়?",
            time: "১০:৪৮ এএম"
        },
        {
            id: 4,
            sender: "them",
            text: "এই দেখ, আমি দুবাই বসে অ্যাপ থেকে 'Live Camera' অন করে দেখি আমার ছেলে এখন পড়তে বসেছে।",
            time: "১০:৫০ এএম",
            attachment: "camera" // Triggers a video/image attachment
        },
        {
            id: 5,
            sender: "me",
            text: "বাহ! আর যদি সে ঘরে না থাকে?",
            time: "১০:৫২ এএম"
        },
        {
            id: 6,
            sender: "them",
            text: "তাহলে 'Live Mic' দিয়ে তার আশেপাশের আওয়াজ শুনি। বুঝতে পারি বন্ধুদের সাথে আড্ডা দিচ্ছে নাকি ক্লাসে আছে।",
            time: "১০:৫৪ এএম",
            attachment: "audio" // Triggers an audio note attachment
        },
        {
            id: 7,
            sender: "them",
            text: "তুমি অ্যাপটা নামিয়ে নাও। কোন টেকনিক্যাল ঝামেলা নাই, ১ মিনিটেই সেটআপ।",
            time: "১০:৫৫ এএম"
        }
    ];

    // Auto-advance the chat
    useEffect(() => {
        if (currentMessageIndex < chatMessages.length) {
            const timer = setTimeout(() => {
                setCurrentMessageIndex(prev => prev + 1);
            }, 3500); // 3.5 seconds delay between messages
            return () => clearTimeout(timer);
        }
    }, [currentMessageIndex, chatMessages.length]);

    return (
        <section className="py-24 bg-gray-50 border-y border-gray-100 relative overflow-hidden">

            {/* Background WhatsApp Doodle Pattern (Subtle) */}
            <div className="absolute inset-0 opacity-5 bg-[url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] bg-repeat z-0"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold tracking-widest text-emerald-600 uppercase mb-3">সবচেয়ে সহজে বুঝুন</h2>
                    <h3 className="text-3xl md:text-5xl font-black text-gray-900" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                        রহিম ভাই যেমন দুবাই থেকে নিশ্চিন্তে আছেন
                    </h3>
                    <p className="mt-4 text-xl text-gray-500 font-medium max-w-2xl mx-auto" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                        কোনো জটিল টেকনোলজি নয়। ঠিক হোয়াটসঅ্যাপের মতোই সহজে সন্তানের খোঁজ রাখুন।
                    </p>
                </div>

                <div className="max-w-md mx-auto relative">

                    {/* Phone Frame */}
                    <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl border-[6px] border-gray-200 relative overflow-hidden">

                        {/* WhatsApp Header */}
                        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-md rounded-t-[2.2rem]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden border border-white/20">
                                    <img src="https://i.pravatar.cc/150?img=11" alt="Rahim Bhai" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[15px] leading-tight" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>রহিম ভাই (দুবাই)</h4>
                                    <p className="text-[11px] text-white/80">online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-white p-1">
                                <Video className="w-5 h-5" />
                                <Phone className="w-5 h-5 ml-2" />
                                <MoreVertical className="w-5 h-5 ml-1" />
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="bg-[#efeae2] h-[550px] overflow-hidden flex flex-col p-4 relative">

                            {/* Date Bubble */}
                            <div className="flex justify-center mb-6">
                                <div className="bg-[#e1f5fe] text-gray-600 text-[11px] font-bold px-3 py-1 rounded-lg uppercase shadow-sm">
                                    Today
                                </div>
                            </div>

                            {/* Messages Sequence */}
                            <div className="flex-1 flex flex-col gap-3">
                                <AnimatePresence>
                                    {chatMessages.slice(0, currentMessageIndex).map((msg) => (
                                        <ChatMessage key={msg.id} message={msg} />
                                    ))}
                                </AnimatePresence>

                                {/* Typing Indicator */}
                                <AnimatePresence>
                                    {currentMessageIndex < chatMessages.length && chatMessages[currentMessageIndex].sender === "them" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-white px-4 py-2 rounded-2xl rounded-tl-none self-start shadow-sm border border-gray-100 flex items-center gap-1 w-16 h-10"
                                        >
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-2 h-2 bg-gray-400 rounded-full"></motion.div>
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full"></motion.div>
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full"></motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                        </div>

                        {/* Input Area */}
                        <div className="bg-[#f0f0f0] px-2 py-3 flex items-center gap-2 rounded-b-[2.2rem]">
                            <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 shadow-sm border border-gray-200">
                                <span className="text-gray-400 text-[15px]" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>মেসেজ লিখুন...</span>
                                <Paperclip className="w-5 h-5 text-gray-500 ml-auto" />
                                <Camera className="w-5 h-5 text-gray-500 ml-4" />
                            </div>
                            <div className="w-10 h-10 bg-[#128c7e] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                                <Mic className="w-5 h-5" />
                            </div>
                        </div>

                    </div>

                    {/* Replay Button */}
                    {currentMessageIndex >= chatMessages.length && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setCurrentMessageIndex(0)}
                            className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-white text-[#128c7e] font-bold px-6 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            দেখুন কিভাবে
                        </motion.button>
                    )}

                </div>
            </div>
        </section>
    );
}

// Sub-component for individual chat bubbles
function ChatMessage({ message }) {
    const isMe = message.sender === "me";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex flex-col max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}
        >
            <div
                className={`relative px-3 pt-2 pb-5 rounded-2xl shadow-sm border border-black/5 text-[15px] leading-snug ${isMe
                        ? 'bg-[#dcf8c6] rounded-tr-none ml-auto'
                        : 'bg-white rounded-tl-none mr-auto'
                    }`}
                style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}
            >
                {/* Message Text */}
                <span className="text-gray-900">{message.text}</span>

                {/* Attachments */}
                {message.attachment === "camera" && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-black/10 relative h-32 w-full">
                        <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Camera Feed" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex flex-col justify-between p-2">
                            <div className="flex justify-between items-start">
                                <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1"><div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> Live</span>
                                <span className="bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Front Cam</span>
                            </div>
                        </div>
                    </div>
                )}

                {message.attachment === "audio" && (
                    <div className="mt-2 bg-gray-100 rounded-full px-4 py-2 flex items-center gap-3 w-48 border border-gray-200">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                        </div>
                        <div className="border-b-2 border-dashed border-gray-400 w-full mb-1"></div>
                        <img src="https://i.pravatar.cc/150?img=11" alt="Rahim" className="w-6 h-6 rounded-full shrink-0" />
                    </div>
                )}

                {/* Time and Read Receipt */}
                <div className={`absolute bottom-1 right-2 flex items-center gap-1 text-[10px] ${isMe ? 'text-green-800/60' : 'text-gray-400'}`}>
                    <span>{message.time}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" />}
                </div>
            </div>
        </motion.div>
    );
}
