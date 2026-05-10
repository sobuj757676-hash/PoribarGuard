"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSupportTickets, useSupportTicket, useCreateSupportTicket, useReplyToSupportTicket } from "@/hooks/useApi";
import { useSocket } from "@/context/SocketContext";
import { Loader2, Plus, Send, MessageCircle, AlertCircle, Paperclip, X, Download, ChevronLeft, ShieldCheck, HeartPulse, Shield, CreditCard, HelpCircle, MapPin, Smartphone, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function SupportPage() {
    const t = useTranslations("Dashboard");
    const [statusFilter, setStatusFilter] = useState("OPEN");
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [search, setSearch] = useState("");
    const [isMobileThreadOpen, setIsMobileThreadOpen] = useState(false);

    const { tickets, isLoading, mutate } = useSupportTickets(statusFilter, search);
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;
        const handler = () => mutate();
        socket.on('ticket_created', handler);
        socket.on('ticket_updated', handler);
        socket.on('ticket_message_created', handler);
        return () => {
            socket.off('ticket_created', handler);
            socket.off('ticket_updated', handler);
            socket.off('ticket_message_created', handler);
        };
    }, [socket, mutate]);

    const handleTicketCreated = (ticket) => {
        setSelectedTicketId(ticket.id);
        setIsMobileThreadOpen(true);
        mutate();
    };

    const handleSelectTicket = (id) => {
        setSelectedTicketId(id);
        setIsMobileThreadOpen(true);
    };

    return (
        <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 pb-20 md:pb-10 font-sans">
            {/* Premium Reassuring Header */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white px-4 md:px-8 py-8 md:py-12 relative overflow-hidden shrink-0">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',backgroundSize:'20px 20px'}}></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="max-w-5xl mx-auto relative z-10">
                    <button 
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-emerald-100 hover:text-white mb-6 transition-colors group w-fit"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm uppercase tracking-wider">Back to Dashboard</span>
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-xs font-bold mb-4 shadow-sm">
                            <HeartPulse className="w-4 h-4 text-emerald-100" />
                            <span className="text-emerald-50">24/7 Priority Support</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">How can we help?</h1>
                        <p className="text-emerald-100 text-sm md:text-base font-medium">We know technical issues can be stressful. Our team is here to get your family back to safety instantly.</p>
                    </div>
                    <CreateTicketButton onCreated={handleTicketCreated} />
                </div>
            </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 layout-container">
                <div className="flex flex-col lg:flex-row gap-6 h-[calc(100dvh-280px)] min-h-[500px]">
                    
                    {/* LEFTSIDE: TICKET LIST */}
                    <div className="flex flex-col w-full lg:w-1/3 shrink-0 h-full">
                        {/* Animated Filter Pills */}
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 hide-scrollbar">
                            {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => {
                                const isActive = statusFilter === s;
                                return (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`px-4 py-2 text-xs font-bold rounded-full transition-all shrink-0 whitespace-nowrap shadow-sm border ${
                                            isActive
                                                ? "bg-emerald-600 text-white border-emerald-600"
                                                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        {s.replace("_", " ")}
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Search Bar */}
                        <div className="relative mb-4 shrink-0">
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow shadow-sm"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* List Container */}
                        <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-safe">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                    <p className="text-sm font-medium animate-pulse">Loading your tickets...</p>
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                                        <ShieldCheck className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Everything looks good!</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">If you ever hit a bump, our support team is 24/7 ready to assist you. Just tap 'Open Ticket' above.</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {tickets.map((ticket, i) => {
                                        const isSelected = selectedTicketId === ticket.id;
                                        return (
                                            <motion.button
                                                key={ticket.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                onClick={() => handleSelectTicket(ticket.id)}
                                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                                                    isSelected 
                                                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 shadow-md ring-1 ring-emerald-500/20" 
                                                        : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-gray-700"
                                                }`}
                                            >
                                                {/* Unread Indicator dot */}
                                                {ticket.unreadByRequester > 0 && (
                                                    <div className="absolute top-4 right-4 w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                                                )}

                                                <div className="flex flex-col gap-1 pr-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black tracking-wider text-gray-400 dark:text-gray-500">#{ticket.ticketNumber}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                            ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-700' :
                                                            ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                            ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}>{ticket.status.replace("_", " ")}</span>
                                                    </div>
                                                    <h4 className={`font-semibold text-sm line-clamp-1 ${isSelected ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-900 dark:text-gray-100'}`}>
                                                        {ticket.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                                                        {ticket.description || "No description"}
                                                    </p>
                                                    <div className="text-[10px] text-gray-400 font-medium mt-2 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {timeAgo(ticket.updatedAt || ticket.createdAt)}
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>

                    {/* RIGHTSIDE: THREAD VIEW (Desktop) */}
                    <div className="hidden lg:flex flex-1 flex-col h-full overflow-hidden relative">
                        {selectedTicketId ? (
                            <TicketThread ticketId={selectedTicketId} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-center p-8">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-700">
                                    <MessageCircle className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Select a Conversation</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm">Choose a ticket from the list to view the thread and reply to our support agents.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MOBILE THREAD VIEW (Slide-over Modal) */}
            <AnimatePresence>
                {isMobileThreadOpen && selectedTicketId && (
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 lg:hidden flex flex-col"
                    >
                        <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-3 shadow-sm border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 shrink-0">
                            <button 
                                onClick={() => setIsMobileThreadOpen(false)}
                                className="w-11 h-11 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 transition touch-manipulation"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            </button>
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white line-clamp-1">Support Thread</h2>
                                <p className="text-xs text-gray-500 font-medium">We usually reply within mins</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                            <TicketThread ticketId={selectedTicketId} isMobile={true} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper time formatting
function timeAgo(date) {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function CreateTicketButton({ onCreated }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const mobileFileInputRef = useRef(null);
    const { trigger } = useCreateSupportTicket();

    const quickChips = [
        { label: "Device Offline", icon: <Smartphone className="w-3 h-3"/> },
        { label: "Location Issue", icon: <MapPin className="w-3 h-3"/> },
        { label: "Billing Problem", icon: <CreditCard className="w-3 h-3"/> },
        { label: "General Help", icon: <HelpCircle className="w-3 h-3"/> }
    ];

    const submit = async () => {
        if (!title || !description) {
            toast.error("Please provide a title and description.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await trigger({
                method: "POST",
                body: { title, description, category },
            });
            const newTicket = res.ticket;
            
            if (files.length > 0 && newTicket?.id) {
                const messageId = newTicket.messages?.[0]?.id || "";
                for (const file of files) {
                    const formData = new FormData();
                    formData.append("file", file);
                    if (messageId) formData.append("messageId", messageId);
                    await fetch(`/api/support/tickets/${newTicket.id}/attachments`, {
                        method: "POST",
                        body: formData
                    });
                }
            }

            toast.success("Support ticket created. We'll be with you shortly!");
            setTitle("");
            setCategory("");
            setDescription("");
            setFiles([]);
            setOpen(false);
            onCreated?.(newTicket);
        } catch (e) {
            toast.error(e.message || "Failed to create ticket.");
        }
        setSubmitting(false);
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const validFiles = newFiles.filter(f => f.size <= 10 * 1024 * 1024);
            if (validFiles.length < newFiles.length) toast.error("Some files exceed the 10MB limit.");
            setFiles(prev => [...prev, ...validFiles]);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-emerald-700 text-sm font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all outline-none"
            >
                <Plus className="w-5 h-5" /> Open New Ticket
            </button>
            
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => !submitting && setOpen(false)}
                        />
                        
                        <motion.div 
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-lg bg-white dark:bg-gray-900 sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col max-h-[90dvh]"
                        >
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <Shield className="w-6 h-6 text-emerald-500" /> Need Help?
                                </h2>
                                <button
                                    onClick={() => !submitting && setOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 transition"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
                                {/* Quick Chips */}
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quick Select Issue</p>
                                    <div className="flex flex-wrap gap-2">
                                        {quickChips.map((chip, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => { setTitle(chip.label); setCategory(chip.label.split(' ')[0].toUpperCase()); }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-transparent hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition text-sm font-semibold text-gray-700 dark:text-gray-300 min-h-[44px]"
                                            >
                                                {chip.icon} {chip.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                        <input
                                            type="text"
                                            placeholder="What's going wrong?"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Details</label>
                                        <textarea
                                            rows={4}
                                            placeholder="Describe the issue in detail. The more info, the faster we can fix it."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-sm resize-none"
                                        />
                                    </div>
                                    
                                    {/* File Upload UI */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Attachments (Optional)</label>
                                        
                                        {/* Mobile Explicit Upload Button */}
                                        <div className="md:hidden mb-3">
                                            <input type="file" multiple className="hidden" ref={mobileFileInputRef} onChange={handleFileChange} />
                                            <button 
                                                onClick={() => mobileFileInputRef.current?.click()}
                                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-100 dark:bg-gray-800 rounded-2xl font-bold text-[#10b981] shadow-sm border border-gray-200 dark:border-gray-700 active:bg-gray-200 transition min-h-[44px]"
                                            >
                                                <Paperclip className="w-5 h-5" /> Tap to Upload Photos
                                            </button>
                                        </div>

                                        {/* Desktop Dropzone */}
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="hidden md:flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-400 transition cursor-pointer"
                                        >
                                            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                            <Download className="w-6 h-6 text-gray-400 mb-2" />
                                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Click or drag files here</p>
                                            <p className="text-xs text-gray-400 mt-1">Max 10MB per file</p>
                                        </div>

                                        {/* File List */}
                                        {files.length > 0 && (
                                            <div className="flex flex-col gap-2 mt-3">
                                                {files.map((f, i) => (
                                                    <div key={i} className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-800 rounded-lg shrink-0">
                                                                <Paperclip className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                            </div>
                                                            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 truncate">{f.name}</span>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, idx) => idx !== i)); }}
                                                            className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition shrink-0 min-h-[44px] min-w-[44px] flex justify-center items-center"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 rounded-b-[2rem] dark:bg-gray-800 flex justify-end gap-3 shrink-0 pb-safe">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="px-5 py-3 text-sm font-bold rounded-2xl text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition min-h-[44px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submit}
                                    disabled={submitting}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-[#10b981] text-white text-sm font-black shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 min-h-[44px]"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 -ml-1" />}
                                    Send Ticket
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

function TicketThread({ ticketId, isMobile = false }) {
    const { ticket, isLoading, isError, mutate } = useSupportTicket(ticketId);
    const [draft, setDraft] = useState("");
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const mobileFileInputRef = useRef(null);
    const { trigger } = useReplyToSupportTicket(ticketId);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!isLoading) {
            setTimeout(scrollToBottom, 100);
        }
    }, [ticket?.messages?.length, isLoading]);

    if (isLoading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 lg:rounded-3xl border lg:border-gray-100 dark:lg:border-gray-800 relative z-10">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
                <p className="text-gray-400 font-medium font-sm animate-pulse">Syncing thread...</p>
            </div>
        );
    }

    if (isError || !ticket) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 lg:rounded-3xl border lg:border-gray-100 dark:lg:border-gray-800 text-red-500">
                <AlertCircle className="w-10 h-10 mb-3" />
                <p className="font-bold">Failed to load conversation.</p>
            </div>
        );
    }

    const messages = ticket.messages || [];
    
    // Assign agent avatar props
    const agentName = ticket.assignedTo?.name || "Support Team";
    const agentInitial = agentName.charAt(0).toUpperCase();

    const send = async () => {
        if (!draft.trim() && files.length === 0) return;
        
        const toSend = draft;
        const attachedFiles = [...files];
        
        // Optimistic UI updates
        const optimisticId = `local-${Date.now()}`;
        const optimisticMessage = {
            id: optimisticId,
            ticketId,
            authorRole: "REQUESTER",
            body: toSend,
            createdAt: new Date().toISOString(),
            attachments: attachedFiles.map(f => ({ id: Math.random(), originalName: f.name, tentative: true }))
        };
        
        setSending(true);
        setDraft("");
        setFiles([]);
        
        mutate(
            {
                ...ticket,
                messages: [...messages, optimisticMessage],
            },
            { revalidate: false }
        );
        setTimeout(scrollToBottom, 50);
        
        try {
            const attachedIds = [];
            if (attachedFiles.length > 0) {
                for (const file of attachedFiles) {
                    const formData = new FormData();
                    formData.append("file", file);
                    const fileRes = await fetch(`/api/support/tickets/${ticketId}/attachments`, {
                        method: "POST",
                        body: formData
                    });
                    const fileData = await fileRes.json();
                    if (fileData.attachment?.id) attachedIds.push(fileData.attachment.id);
                }
            }

            await trigger({
                method: "POST",
                body: { body: toSend, clientMessageId: optimisticId, attachmentIds: attachedIds },
            });
            await mutate();
        } catch (e) {
            toast.error(e.message || "Failed to send message.");
            setDraft(toSend);
            setFiles(attachedFiles);
            await mutate();
        }
        setSending(false);
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const validFiles = newFiles.filter(f => f.size <= 10 * 1024 * 1024);
            if (validFiles.length < newFiles.length) toast.error("Some files exceed the 10MB limit.");
            setFiles(prev => [...prev, ...validFiles]);
            
            // Re-focus text input for convenience if possible
            document.getElementById('chat-input')?.focus();
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#f8fafc] dark:bg-gray-950 lg:rounded-3xl lg:border border-gray-100 dark:border-gray-800 relative z-10 shadow-sm overflow-hidden">
            
            {/* THREAD HEADER */}
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4 shrink-0 z-20">
                <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner">
                        {agentInitial}
                    </div>
                    {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                    )}
                </div>
                <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                        {agentName}
                    </h2>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {ticket.category || 'General Support'} • {ticket.status.replace('_', ' ')}
                    </p>
                </div>
            </div>

            {/* MESSAGE LIST */}
            {/* Using min-height 0 to allow flex container to properly scroll */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4" style={{ backgroundColor: 'var(--tw-bg-opacity, rgba(248,250,252,1))' }}>
                
                {/* Intro bubble showing ticket info */}
                <div className="flex justify-center mb-8">
                    <div className="bg-gray-200/50 dark:bg-gray-800/50 px-4 py-2 rounded-2xl text-xs font-medium text-gray-500 dark:text-gray-400 text-center max-w-sm">
                        Ticket created: {new Date(ticket.createdAt).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}<br/>
                        <strong>Title:</strong> {ticket.title}
                    </div>
                </div>

                {messages.map((m, idx) => {
                    const isMe = m.authorRole === "REQUESTER";
                    const isLast = idx === messages.length - 1;
                    
                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            key={m.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2 shrink-0 self-end mb-1">
                                    <span className="text-emerald-700 font-bold text-xs">{agentInitial}</span>
                                </div>
                            )}
                            
                            <div className="flex flex-col max-w-[85%] md:max-w-[70%]">
                                <div
                                    className={`relative px-4 py-3 text-sm md:text-base shadow-sm ${
                                        isMe
                                            ? "bg-gradient-to-tr from-emerald-500 to-emerald-600 text-white rounded-[1.5rem] rounded-br-md"
                                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-[1.5rem] rounded-bl-md border border-gray-100 dark:border-gray-700"
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap break-words leading-relaxed">{m.body}</p>
                                    
                                    {/* Inline Attachments rendering */}
                                    {m.attachments?.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {m.attachments.map(att => (
                                                <a
                                                    key={att.id}
                                                    href={att.tentative ? "#" : `/api/support/attachments/${att.id}`}
                                                    target={att.tentative ? "_self" : "_blank"}
                                                    rel="noreferrer"
                                                    className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl transition ${
                                                        isMe 
                                                            ? "bg-black/15 hover:bg-black/25 text-white" 
                                                            : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                                                    }`}
                                                >
                                                    <div className={`p-1.5 rounded-lg shrink-0 ${isMe ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                                        <Paperclip className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col pr-6">
                                                        <span className="text-xs font-semibold truncate max-w-[120px] md:max-w-[200px]">
                                                            {att.originalName}
                                                        </span>
                                                        <span className="text-[10px] opacity-70">Attachment</span>
                                                    </div>
                                                    {!att.tentative && (
                                                        <Download className={`absolute right-3 w-4 h-4 transition opacity-0 group-hover:opacity-100 ${isMe ? 'text-white' : 'text-gray-500'}`} />
                                                    )}
                                                    {att.tentative && (
                                                        <Loader2 className="absolute right-3 w-4 h-4 animate-spin opacity-70" />
                                                    )}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[10px] text-gray-400 font-medium mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
                {/* Invisible element to auto-scroll to */}
                <div ref={messagesEndRef} className="h-2 w-full" />
            </div>
            
            {/* Satisfaction Rating */}
            {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && !ticket._ratedByUser && (
                <div className="mx-3 md:mx-5 mb-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center animate-in fade-in slide-in-from-bottom-3">
                    <p className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3">How was your experience?</p>
                    <div className="flex justify-center gap-3 mb-3">
                        {['😞','😐','🙂','😃','🤩'].map((emoji, i) => (
                            <button key={i} className="w-11 h-11 text-2xl rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800/50 hover:scale-110 transition-all flex items-center justify-center" onClick={() => { toast.success('Thank you for your feedback!'); ticket._ratedByUser = true; }}>{emoji}</button>
                        ))}
                    </div>
                    <button onClick={() => { ticket._ratedByUser = true; }} className="text-xs text-gray-400 hover:text-gray-600 font-medium">Skip</button>
                </div>
            )}

            {/* CHAT INPUT AREA */}
            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-3 md:px-5 py-3 shrink-0 pb-safe">
                {/* Quick Response Chips */}
                {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 hide-scrollbar">
                        {['📎 Send Screenshot','✅ Issue Resolved','❓ Need More Help','⏰ Still Waiting'].map(chip => (
                            <button key={chip} onClick={() => setDraft(chip.replace(/^[^\s]+\s/,''))} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-xs font-semibold rounded-full whitespace-nowrap hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 min-h-[36px]">{chip}</button>
                        ))}
                    </div>
                )}
                {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                        {files.map((f, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 text-xs font-semibold rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                <span className="truncate max-w-[150px]">{f.name}</span>
                                <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded min-h-[44px] min-w-[32px] flex items-center justify-center">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex items-end gap-2">
                    <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                    <input type="file" multiple className="hidden" ref={mobileFileInputRef} onChange={handleFileChange} />
                    
                    {/* Attach Button */}
                    <button
                        onClick={() => isMobile ? mobileFileInputRef.current?.click() : fileInputRef.current?.click()}
                        className="p-3 text-gray-400 hover:text-emerald-600 bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 mb-0.5"
                        title="Attach photos"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    
                    {/* Text Area */}
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-[1.5rem] flex items-center px-4 py-1.5 min-h-[44px] shadow-inner">
                        <textarea
                            id="chat-input"
                            rows={Math.min(4, draft.split('\n').length || 1)}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-transparent border-none text-sm outline-none resize-none py-2 text-gray-900 dark:text-gray-100 max-h-32"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    send();
                                }
                            }}
                        />
                    </div>
                    
                    {/* Send Button */}
                    <AnimatePresence>
                        {(draft.trim() || files.length > 0) && (
                            <motion.button
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                onClick={send}
                                disabled={sending}
                                className="w-11 h-11 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-60 transition shrink-0 mb-0.5 min-h-[44px] min-w-[44px]"
                            >
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-[-2px] mt-[1px]" />}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            {/* Added for mobile keyboard extra safety padding if needed, though pb-safe usually helps */}
            <div className="h-safe" />
        </div>
    );
}

