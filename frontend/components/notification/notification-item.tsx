import Link from "next/link";
import type { NotificationDto } from "@/types/notification";

type Props = {
  notification: NotificationDto;
  onMarkedRead?: (id: string) => void;
  markAsRead?: (id: string) => Promise<void>;
};

export function NotificationItem({ notification, onMarkedRead, markAsRead }: Props) {
  const { id, message, link, isRead } = notification;

  const handleClick = async () => {
    if (!isRead && markAsRead) {
      await markAsRead(id);
      onMarkedRead?.(id);
    }
  };

  return (
    <div className={`flex items-start gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 ${isRead ? "bg-white" : "bg-accent-primary-5/20"}`}>
      <div className="pt-1">
        <span
          className={`inline-block w-3 h-3 rounded-full ${isRead ? "bg-gray-300" : "bg-secondary-color-70"}`}
          aria-label={isRead ? "Leída" : "Nueva"}
          title={isRead ? "Leída" : "Nueva"}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className={`text-base ${isRead ? "text-gray-800" : "text-gray-900 font-semibold"}`}>
            {message}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${isRead ? "bg-gray-50 text-gray-600 border-gray-200" : "bg-secondary-color-10 text-secondary-color-70 border-secondary-color-40"}`}
          >
            {isRead ? "Leída" : "Nueva"}
          </span>
        </div>
        <div className="mt-2">
          <Link
            onClick={handleClick}
            href={link}
            className="text-sm text-secondary-color-70 hover:text-secondary-color-80 underline underline-offset-2"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
}


