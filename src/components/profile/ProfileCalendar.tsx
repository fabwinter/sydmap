import { useState } from "react";
import { ChevronDown, Trash2, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileCalendarProps {
  calendarEvents: any[];
  checkIns: any[];
  month: Date;
  onMonthChange: (d: Date) => void;
  onDeleteEvent: (id: string) => void;
}

export function ProfileCalendar({ calendarEvents, checkIns, month, onMonthChange, onDeleteEvent }: ProfileCalendarProps) {
  const daysInMonth = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const firstDayOfWeek = getDay(startOfMonth(month));
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const eventsByDate = new Map<string, { type: "planned" | "checkin"; title: string; id?: string; activityId?: string; isEvent?: boolean }[]>();
  
  calendarEvents.forEach((ev: any) => {
    const key = ev.event_date;
    if (!eventsByDate.has(key)) eventsByDate.set(key, []);
    eventsByDate.get(key)!.push({ type: "planned", title: ev.title || ev.activities?.name || "Event", id: ev.id, activityId: ev.activity_id || undefined });
  });
  
  checkIns.forEach((ci: any) => {
    const key = format(new Date(ci.created_at), "yyyy-MM-dd");
    if (!eventsByDate.has(key)) eventsByDate.set(key, []);
    eventsByDate.get(key)!.push({ type: "checkin", title: ci.activities?.name || "Check-in", activityId: ci.activities?.id, isEvent: ci.activities?.is_event });
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) || [] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => onMonthChange(subMonths(month, 1))} className="p-2 rounded-lg hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ChevronDown className="w-5 h-5 rotate-90" />
        </button>
        <h3 className="font-bold text-lg text-foreground">{format(month, "MMMM yyyy")}</h3>
        <button onClick={() => onMonthChange(addMonths(month, 1))} className="p-2 rounded-lg hover:bg-muted min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ChevronDown className="w-5 h-5 -rotate-90" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1.5">{d}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const events = eventsByDate.get(key);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate === key;

          return (
            <button
              key={key}
              onClick={() => setSelectedDate(isSelected ? null : key)}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all min-w-[44px] ${
                isSelected ? "bg-primary text-primary-foreground shadow-md" :
                isToday ? "bg-primary/10 font-bold ring-1 ring-primary/30" :
                "hover:bg-muted"
              }`}
            >
              {format(day, "d")}
              {events && (
                <div className="flex gap-0.5 mt-0.5">
                  {events.some(e => e.type === "planned") && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  {events.some(e => e.type === "checkin") && <span className="w-1.5 h-1.5 rounded-full bg-warning" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground font-medium">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Planned</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> Check-in</span>
      </div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4 className="font-semibold text-sm text-foreground">{format(parseISO(selectedDate), "EEEE, d MMMM")}</h4>
            {selectedEvents.length > 0 ? (
              selectedEvents.map((ev, i) => {
                const linkTo = ev.activityId
                  ? (ev.isEvent ? `/event/${ev.activityId}` : `/activity/${ev.activityId}`)
                  : null;
                const content = (
                  <div className="flex items-center justify-between bg-card rounded-xl border border-border p-3.5 hover:border-primary/40 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ev.type === "planned" ? "bg-primary" : "bg-warning"}`} />
                      <span className="text-sm font-medium truncate text-foreground">{ev.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded-full font-medium">{ev.type === "planned" ? "Planned" : "Visited"}</span>
                    </div>
                    {ev.type === "planned" && ev.id && (
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteEvent(ev.id!); }} className="p-1 text-muted-foreground hover:text-destructive shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
                return linkTo ? (
                  <Link key={i} to={linkTo}>{content}</Link>
                ) : (
                  <div key={i}>{content}</div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No events on this day</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {calendarEvents.filter((e: any) => e.event_date >= format(new Date(), "yyyy-MM-dd")).length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2 text-foreground">Upcoming</h4>
          <div className="space-y-2">
            {calendarEvents
              .filter((e: any) => e.event_date >= format(new Date(), "yyyy-MM-dd"))
              .slice(0, 5)
              .map((ev: any) => (
                <Link
                  key={ev.id}
                  to={ev.activity_id ? `/activity/${ev.activity_id}` : "#"}
                  className="flex items-center justify-between bg-card rounded-xl border border-border p-3.5 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(ev.event_date), "EEE d MMM")}
                      {ev.event_time && ` at ${ev.event_time.slice(0, 5)}`}
                    </p>
                  </div>
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
