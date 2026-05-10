/**
 * OEM-specific setup guides for the Live Remote Hands feature.
 * Maps each setup step to device-specific instructions that the parent
 * can read aloud to the person holding the child's phone.
 * 
 * Resolution priority: OEM + Skin > OEM > Default
 */

const SETUP_GUIDES = {
    WIZARD_LAUNCHED: {
        title: "Wizard Opened",
        titleBn: "উইজার্ড চালু হয়েছে",
        icon: "📱",
        default: {
            instruction: "The installer app has opened. Ask them to enter the 6-digit pairing code and tap 'Start Setup'.",
            instructionBn: "ইন্সটলার অ্যাপ Open হয়েছে। তাকে বলুন ৬-সংখ্যার কোডটি লিখে 'Start Setup' চাপতে।"
        }
    },
    WIZARD_DOWNLOADING: {
        title: "Downloading App",
        titleBn: "অ্যাপ ডাউনলোড হচ্ছে",
        icon: "⬇️",
        default: {
            instruction: "The main app is downloading. Ask them to wait and keep the screen on.",
            instructionBn: "মূল অ্যাপটি ডাউনলোড হচ্ছে। তাকে বলুন অপেক্ষা করতে এবং স্ক্রিন On রাখতে।"
        }
    },
    WIZARD_DOWNLOAD_COMPLETE: {
        title: "Download Complete",
        titleBn: "ডাউনলোড সম্পন্ন",
        icon: "✅",
        default: {
            instruction: "Download finished! The app will now start installing.",
            instructionBn: "ডাউনলোড শেষ! এখন অ্যাপটি Install হবে।"
        }
    },
    WIZARD_INSTALLING: {
        title: "Installing App",
        titleBn: "অ্যাপ Install হচ্ছে",
        icon: "⚙️",
        default: {
            instruction: "A system dialog should appear. Ask them to tap 'Install' when they see it.",
            instructionBn: "একটি সিস্টেম ডায়ালগ আসবে। তাকে বলুন 'Install' বাটনে চাপতে।"
        }
    },
    WIZARD_INSTALL_SUCCESS: {
        title: "App Installed!",
        titleBn: "অ্যাপ Install হয়ে গেছে!",
        icon: "🎉",
        default: {
            instruction: "Installation successful! Ask them to tap 'Open PoribarGuard' to proceed.",
            instructionBn: "Install সফল! তাকে বলুন 'Open PoribarGuard' বাটনে চাপতে।"
        }
    },
    WIZARD_INSTALL_FAILED: {
        title: "Install Failed",
        titleBn: "Install ব্যর্থ",
        icon: "❌",
        default: {
            instruction: "Installation failed. Ask them to tap 'Start Setup' to try again.",
            instructionBn: "Install ব্যর্থ হয়েছে। তাকে বলুন আবার 'Start Setup' চাপতে।"
        }
    },
    CHILD_LAUNCHED: {
        title: "App Opened",
        titleBn: "অ্যাপ Open হয়েছে",
        icon: "🟢",
        default: {
            instruction: "Great! The main app has opened. The pairing code should be pre-filled.",
            instructionBn: "দারুণ! মূল অ্যাপ Open হয়েছে। পেয়ারিং কোড আগে থেকেই বসানো থাকবে।"
        }
    },
    CHILD_PAIRING: {
        title: "Verifying Code",
        titleBn: "কোড যাচাই হচ্ছে",
        icon: "🔄",
        default: {
            instruction: "The code is being verified with the server. Wait a moment...",
            instructionBn: "কোড সার্ভারে যাচাই হচ্ছে। একটু অপেক্ষা করুন..."
        }
    },
    CHILD_PAIRED: {
        title: "Device Paired!",
        titleBn: "ডিভাইস যুক্ত হয়ে গেছে!",
        icon: "🔗",
        default: {
            instruction: "The phone is now linked to your account. Ask them to accept the consent and continue.",
            instructionBn: "ফোনটি এখন আপনার অ্যাকাউন্টে যুক্ত। তাকে বলুন Consent দিয়ে Next করতে।"
        }
    },
    CHILD_CONSENT: {
        title: "Consent Given",
        titleBn: "সম্মতি দেওয়া হয়েছে",
        icon: "📝",
        default: {
            instruction: "Consent accepted. Now they need to grant permissions one by one. Guide them through each button.",
            instructionBn: "সম্মতি দেওয়া হয়ে গেছে। এখন একে একে Permission দিতে হবে। প্রতিটি বাটনে Guide করুন।"
        }
    },
    CHILD_PERM_APP: {
        title: "Camera/Mic/Location Permission",
        titleBn: "ক্যামেরা/মাইক/লোকেশন পারমিশন",
        icon: "📸",
        default: {
            instruction: "A popup will ask for Camera, Mic, and Location. Tell them to tap 'Allow' for each one.",
            instructionBn: "একটি পপআপ আসবে Camera, Mic, Location এর জন্য। প্রতিটিতে 'Allow' চাপতে বলুন।"
        }
    },
    CHILD_PERM_BATTERY: {
        title: "Battery Optimization",
        titleBn: "ব্যাটারি অপটিমাইজেশন",
        icon: "🔋",
        default: {
            instruction: "A dialog will ask to allow the app to run in background. Tell them to tap 'Allow'.",
            instructionBn: "একটি ডায়ালগ আসবে ব্যাকগ্রাউন্ডে চলার জন্য। 'Allow' চাপতে বলুন।"
        },
        Xiaomi: {
            skinOverride: {
                MIUI: {
                    instruction: "On Xiaomi MIUI: Settings → Battery & Performance → Choose apps → PoribarGuard → No restrictions.",
                    instructionBn: "Xiaomi MIUI: Settings → Battery & Performance → Choose apps → PoribarGuard → No restrictions।"
                },
                HyperOS: {
                    instruction: "On Xiaomi HyperOS: Settings → Battery → App Battery Saver → PoribarGuard → Unrestricted.",
                    instructionBn: "Xiaomi HyperOS: Settings → Battery → App Battery Saver → PoribarGuard → Unrestricted।"
                }
            }
        },
        Samsung: {
            instruction: "On Samsung: A dialog will ask about battery. Tap 'Allow'. If not, go to Settings → Battery → Battery Optimization → PoribarGuard → Don't optimize.",
            instructionBn: "Samsung: একটি ডায়ালগ আসবে ব্যাটারি নিয়ে। 'Allow' চাপুন। না আসলে Settings → Battery → Battery Optimization → PoribarGuard → Don't optimize।"
        }
    },
    CHILD_PERM_OVERLAY: {
        title: "Overlay Permission",
        titleBn: "ওভারলে পারমিশন",
        icon: "🪟",
        default: {
            instruction: "Settings will open. Find 'PoribarGuard' and turn ON 'Display over other apps'.",
            instructionBn: "Settings খুলবে। 'PoribarGuard' খুঁজুন এবং 'Display over other apps' ON করুন।"
        }
    },
    CHILD_PERM_ACCESSIBILITY: {
        title: "Accessibility Service",
        titleBn: "অ্যাক্সেসিবিলিটি সার্ভিস",
        icon: "♿",
        default: {
            instruction: "Accessibility Settings will open. Scroll down, find 'PoribarGuard BD', tap it, and turn it ON. Tap 'OK' on the warning dialog.",
            instructionBn: "Accessibility Settings খুলবে। নিচে Scroll করুন, 'PoribarGuard BD' খুঁজুন, চাপুন, ON করুন। Warning ডায়ালগে 'OK' চাপুন।"
        },
        Xiaomi: {
            skinOverride: {
                MIUI: {
                    instruction: "On Xiaomi MIUI: Settings → Additional Settings → Accessibility → Downloaded Services → PoribarGuard BD → Turn ON.",
                    instructionBn: "Xiaomi MIUI: Settings → Additional Settings → Accessibility → Downloaded Services → PoribarGuard BD → ON করুন।"
                },
                HyperOS: {
                    instruction: "On Xiaomi HyperOS: Settings → Additional Settings → Accessibility → Downloaded apps → PoribarGuard BD → Enable.",
                    instructionBn: "Xiaomi HyperOS: Settings → Additional Settings → Accessibility → Downloaded apps → PoribarGuard BD → Enable।"
                }
            }
        },
        Samsung: {
            instruction: "On Samsung: Settings → Accessibility → Installed apps → PoribarGuard BD → Turn ON → Allow.",
            instructionBn: "Samsung: Settings → Accessibility → Installed apps → PoribarGuard BD → ON করুন → Allow।"
        }
    },
    CHILD_PERM_USAGE: {
        title: "Usage Access",
        titleBn: "ব্যবহার অ্যাক্সেস",
        icon: "📊",
        default: {
            instruction: "Usage Access settings opened. Find 'PoribarGuard BD' and turn it ON.",
            instructionBn: "Usage Access Settings খুলবে। 'PoribarGuard BD' খুঁজুন এবং ON করুন।"
        }
    },
    CHILD_PERM_DEVICE_ADMIN: {
        title: "Device Admin",
        titleBn: "ডিভাইস অ্যাডমিন",
        icon: "🛡️",
        default: {
            instruction: "A dialog will ask to activate device admin. Tell them to tap 'Activate'.",
            instructionBn: "একটি ডায়ালগ আসবে Device Admin চালু করতে। 'Activate' চাপতে বলুন।"
        }
    },
    CHILD_PERMISSIONS_DONE: {
        title: "All Permissions Granted!",
        titleBn: "সব Permission দেওয়া হয়ে গেছে!",
        icon: "✅",
        default: {
            instruction: "All permissions are set! Ask them to tap the final 'Start Protection' button.",
            instructionBn: "সব Permission দেওয়া হয়ে গেছে! সর্বশেষ 'Start Protection' বাটন চাপতে বলুন।"
        }
    },
    COMPLETED: {
        title: "Setup Complete!",
        titleBn: "সেটআপ সম্পন্ন!",
        icon: "🎉",
        default: {
            instruction: "The device is now fully protected and running in stealth mode. You can close this guide.",
            instructionBn: "ডিভাইসটি এখন সম্পূর্ণ সুরক্ষিত এবং Stealth Mode-এ চলছে। এই গাইড বন্ধ করতে পারেন।"
        }
    }
};

/**
 * Resolves the correct guide for a given step and device.
 * Priority: OEM + Skin > OEM > Default
 */
export function getGuideForStep(step, device) {
    const stepGuide = SETUP_GUIDES[step];
    if (!stepGuide) return null;

    let instructions = stepGuide.default;

    if (device?.oem) {
        const oemGuide = stepGuide[device.oem];
        if (oemGuide) {
            // Check for skin-specific override
            if (oemGuide.skinOverride && device.skinName && oemGuide.skinOverride[device.skinName]) {
                instructions = oemGuide.skinOverride[device.skinName];
            } else if (oemGuide.instruction) {
                instructions = oemGuide;
            }
        }
    }

    return {
        title: stepGuide.title,
        titleBn: stepGuide.titleBn,
        icon: stepGuide.icon,
        ...instructions
    };
}

/**
 * Returns all step IDs in order for the progress tracker.
 */
export const SETUP_STEPS = [
    'WIZARD_LAUNCHED',
    'WIZARD_DOWNLOADING',
    'WIZARD_DOWNLOAD_COMPLETE',
    'WIZARD_INSTALLING',
    'WIZARD_INSTALL_SUCCESS',
    'CHILD_LAUNCHED',
    'CHILD_PAIRING',
    'CHILD_PAIRED',
    'CHILD_CONSENT',
    'CHILD_PERM_APP',
    'CHILD_PERM_BATTERY',
    'CHILD_PERM_OVERLAY',
    'CHILD_PERM_ACCESSIBILITY',
    'CHILD_PERM_USAGE',
    'CHILD_PERM_DEVICE_ADMIN',
    'CHILD_PERMISSIONS_DONE',
    'COMPLETED'
];

export default SETUP_GUIDES;
