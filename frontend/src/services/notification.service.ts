// notification.service.ts
export class NotificationService {
    private static instance: NotificationService;
    private permissionGranted: boolean = false;
    private reminderDelay: number = 10000; // 10 seconds for demo/test, increase for production

    private constructor() {
        this.checkPermission();
        this.initVisibilityListener();
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    private async checkPermission() {
        if ('Notification' in window) {
            this.permissionGranted = Notification.permission === 'granted';
        }
    }

    public async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) return false;

        const permission = await Notification.requestPermission();
        this.permissionGranted = permission === 'granted';
        return this.permissionGranted;
    }

    private initVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.scheduleReminder();
            } else {
                this.cancelReminder();
            }
        });

        // Also handle beforeunload for tab closing
        window.addEventListener('beforeunload', () => {
            this.scheduleReminder();
        });
    }

    private scheduleReminder() {
        if (!this.permissionGranted) return;

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SCHEDULE_REMINDER',
                delay: this.reminderDelay
            });
        }
    }

    private cancelReminder() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CANCEL_REMINDER'
            });
        }
    }
}

export const notificationService = NotificationService.getInstance();
