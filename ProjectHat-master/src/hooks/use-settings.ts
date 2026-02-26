import { useState, useEffect, useCallback, useRef } from "react";
import {
    dispatchSettingsChange,
    SETTINGS_CHANGE_EVENT,
    SettingsChangeEvent,
    SettingsInterface,
    defaultSettings,
} from "@/lib/settings";

export const useSettings = () => {
    const isInternalUpdate = useRef(false);

    const [settings, setSettingsState] = useState<SettingsInterface>(() => {
        if (typeof window !== "undefined") {
            const storedSettings = localStorage.getItem("settings");
            return storedSettings
                ? JSON.parse(storedSettings)
                : defaultSettings;
        }
        return defaultSettings;
    });

    const setSettings = useCallback(
        (
            newSettings:
                | SettingsInterface
                | ((prev: SettingsInterface) => SettingsInterface),
        ) => {
            setSettingsState((prevSettings) => {
                const nextSettings =
                    typeof newSettings === "function"
                        ? newSettings(prevSettings)
                        : newSettings;

                // Defer events to next tick to avoid render-time updates
                isInternalUpdate.current = true;
                setTimeout(() => {
                    Object.keys(nextSettings).forEach((key) => {
                        const typedKey = key as keyof SettingsInterface;
                        const newValue = nextSettings[typedKey];
                        const oldValue = prevSettings[typedKey];

                        if (oldValue !== newValue) {
                            dispatchSettingsChange(
                                typedKey,
                                newValue,
                                oldValue,
                            );
                        }
                    });
                    isInternalUpdate.current = false;
                }, 0);

                return nextSettings;
            });
        },
        [],
    );

    // Listen for external settings changes (e.g. from the header theme toggle)
    useEffect(() => {
        const handler = (event: Event) => {
            if (isInternalUpdate.current) return;
            const { key, value } =
                (event as CustomEvent<SettingsChangeEvent>).detail;
            setSettingsState((prev) => {
                if (prev[key] === value) return prev;
                return { ...prev, [key]: value };
            });
        };
        window.addEventListener(SETTINGS_CHANGE_EVENT, handler);
        return () =>
            window.removeEventListener(SETTINGS_CHANGE_EVENT, handler);
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("settings", JSON.stringify(settings));
        }
    }, [settings]);

    return { settings, setSettings };
};
