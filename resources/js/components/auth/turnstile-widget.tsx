import { useEffect, useRef, useState } from 'react';

type TurnstileWidgetId = string;

type TurnstileApi = {
    render: (
        container: HTMLElement,
        options: {
            sitekey: string;
            action: string;
            theme: 'auto';
            language: string;
            size: 'flexible';
            callback: (token: string) => void;
            'error-callback': () => void;
            'expired-callback': () => void;
            'timeout-callback': () => void;
            'response-field': boolean;
            'response-field-name': string;
        },
    ) => TurnstileWidgetId;
    remove: (widgetId: TurnstileWidgetId) => void;
};

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

const scriptId = 'cloudflare-turnstile-script';
const scriptSource =
    'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let turnstileScriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
    if (window.turnstile) {
        return Promise.resolve(window.turnstile);
    }

    if (turnstileScriptPromise) {
        return turnstileScriptPromise;
    }

    turnstileScriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
        const existingScript = document.getElementById(scriptId);
        const script =
            existingScript instanceof HTMLScriptElement
                ? existingScript
                : document.createElement('script');

        const handleLoad = () => {
            if (window.turnstile) {
                resolve(window.turnstile);

                return;
            }

            script.remove();
            turnstileScriptPromise = null;
            reject(new Error('Cloudflare Turnstile API is unavailable.'));
        };

        const handleError = () => {
            script.remove();
            turnstileScriptPromise = null;
            reject(new Error('Cloudflare Turnstile script failed to load.'));
        };

        script.addEventListener('load', handleLoad, { once: true });
        script.addEventListener('error', handleError, { once: true });

        if (!existingScript) {
            script.id = scriptId;
            script.src = scriptSource;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }
    });

    return turnstileScriptPromise;
}

export default function TurnstileWidget({
    siteKey,
    action,
    error,
    onVerificationChange,
}: {
    siteKey: string;
    action: 'login' | 'register';
    error?: string;
    onVerificationChange: (verified: boolean) => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        let isActive = true;
        let widgetId: TurnstileWidgetId | null = null;

        loadTurnstile()
            .then((turnstile) => {
                if (!isActive || !containerRef.current) {
                    return;
                }

                widgetId = turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    action,
                    theme: 'auto',
                    language: 'id',
                    size: 'flexible',
                    callback: () => onVerificationChange(true),
                    'error-callback': () => {
                        setLoadFailed(true);
                        onVerificationChange(false);
                    },
                    'expired-callback': () => onVerificationChange(false),
                    'timeout-callback': () => onVerificationChange(false),
                    'response-field': true,
                    'response-field-name': 'cf-turnstile-response',
                });
            })
            .catch(() => {
                if (isActive) {
                    setLoadFailed(true);
                    onVerificationChange(false);
                }
            });

        return () => {
            isActive = false;

            if (widgetId && window.turnstile) {
                window.turnstile.remove(widgetId);
            }
        };
    }, [action, onVerificationChange, siteKey]);

    return (
        <div className="grid gap-2">
            <div
                ref={containerRef}
                className="min-h-[65px] overflow-hidden rounded-[14px] border border-[var(--control-border)] bg-[var(--control-background)] p-2 shadow-[var(--control-shadow)]"
            />
            {(loadFailed || error) && (
                <p className="text-xs font-normal text-danger" role="alert">
                    {error ??
                        'Verifikasi keamanan tidak dapat dimuat. Muat ulang halaman.'}
                </p>
            )}
            <p className="text-xs font-light text-muted-foreground">
                Formulir ini dilindungi oleh Cloudflare Turnstile.
            </p>
        </div>
    );
}
