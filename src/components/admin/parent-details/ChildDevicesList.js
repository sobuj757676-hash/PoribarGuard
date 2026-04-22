import React from 'react';
import { Smartphone, ShieldAlert, Battery, Wifi, Clock } from 'lucide-react';

export default function ChildDevicesList({ childrenList, locale }) {
    return (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center">
                    <Smartphone className="w-5 h-5 mr-2 text-blue-500" />
                    Connected Children & Devices
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded-full font-bold">
                    {childrenList?.length || 0} Total
                </span>
            </div>
            <div className="p-0">
                {childrenList && childrenList.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {childrenList.map(child => (
                            <div key={child.id} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="md:col-span-4 flex items-center space-x-4">
                                    <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                        {child.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{child.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Age: {child.age} • ID: {child.id.substring(0,8)}</p>
                                    </div>
                                </div>

                                <div className="md:col-span-8 flex flex-wrap gap-4 md:justify-end">
                                    {child.device ? (
                                        <div className="flex items-center space-x-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 w-full md:w-auto shadow-sm">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2.5 h-2.5 rounded-full ${child.device.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {child.device.isOnline ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
                                                <Battery className="w-4 h-4" />
                                                <span className="text-sm font-medium">{child.device.batteryLevel}%</span>
                                            </div>
                                            <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400">
                                                <Wifi className="w-4 h-4" />
                                                <span className="text-sm font-medium">{child.device.networkType || 'Unknown'}</span>
                                            </div>
                                            <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 hidden lg:flex">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs">Last seen: {new Date(child.device.lastSeenAt).toLocaleString(locale)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/50 flex items-center">
                                            <ShieldAlert className="w-4 h-4 mr-1.5" />
                                            No device paired yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        No children profiles created yet.
                    </div>
                )}
            </div>
        </div>
    );
}
