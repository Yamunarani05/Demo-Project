import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";

export interface Reminder {
  id: string;
  leadId: string;
  leadName: string;
  message: string;
  time: string; // ISO string
}

export const addReminder = (reminder: Omit<Reminder, "id">) => {
  const existing = JSON.parse(localStorage.getItem("local_reminders") || "[]");
  existing.push({ ...reminder, id: Date.now().toString() });
  localStorage.setItem("local_reminders", JSON.stringify(existing));
};

const GlobalReminder: React.FC = () => {
  const [activeReminders, setActiveReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Clear screen and do not trigger if on the login or reset password pages
      if (window.location.pathname === "/" || window.location.pathname.startsWith("/reset-password")) {
        setActiveReminders([]);
        return; 
      }

      const token = localStorage.getItem("token");
      if (!token) return; // Do not trigger reminders while logged out

      
      const stored = JSON.parse(localStorage.getItem("local_reminders") || "[]") as Reminder[];
      const now = new Date().getTime();
      
      const triggered: Reminder[] = [];
      const pending: Reminder[] = [];

      let hasChanges = false;

      stored.forEach((r) => {
        if (new Date(r.time).getTime() <= now) {
          triggered.push(r);
          hasChanges = true;
        } else {
          pending.push(r);
        }
      });

      if (hasChanges) {
        setActiveReminders((prev) => {
          // Avoid duplicates
          const newTriggers = triggered.filter(t => !prev.some(p => p.id === t.id));
          return [...prev, ...newTriggers];
        });
        localStorage.setItem("local_reminders", JSON.stringify(pending));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const dismissReminder = (id: string) => {
    setActiveReminders((prev) => prev.filter((r) => r.id !== id));
  };

  if (activeReminders.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 pointer-events-none">
      {activeReminders.map((r) => (
        <div key={r.id} className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden animate-in slide-in-from-right-8 duration-300 pointer-events-auto border-2 border-red-500">
          <div className="bg-red-600 p-4 flex items-center gap-3 text-white">
            <Bell className="w-6 h-6 animate-bounce" />
            <h2 className="text-lg font-bold">REMINDER!</h2>
          </div>
          
          <div className="p-5">
            <p className="text-xs text-red-500 font-bold uppercase mb-1">Lead: {r.leadName}</p>
            <p className="text-gray-900 font-medium text-base leading-tight mb-3">{r.message}</p>
            <p className="text-xs text-gray-400">
              Scheduled: {new Date(r.time).toLocaleString()}
            </p>
            <button
              onClick={() => dismissReminder(r.id)}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors shadow-sm"
            >
              Mark as Done / Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GlobalReminder;
