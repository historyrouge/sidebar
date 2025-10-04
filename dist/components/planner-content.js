"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerContent = PlannerContent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const calendar_1 = require("@/components/ui/calendar");
const back_button_1 = require("./back-button");
const sidebar_1 = require("./ui/sidebar");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
const dummyEvents = [
    { id: '1', title: 'Review Biology Flashcards', date: new Date(new Date().setDate(new Date().getDate() + 1)), type: 'review' },
    { id: '2', title: 'Take JavaScript Quiz', date: new Date(new Date().setDate(new Date().getDate() + 2)), type: 'quiz' },
    { id: '3', title: 'Study History Chapter 5', date: new Date(new Date().setDate(new Date().getDate() + 2)), type: 'study' },
    { id: '4', title: 'Review Physics Formulas', date: new Date(new Date().setDate(new Date().getDate() + 4)), type: 'review' },
];
const EventTypeIcon = ({ type }) => {
    switch (type) {
        case 'review': return (0, jsx_runtime_1.jsx)("span", { className: "text-blue-500", children: "\uD83D\uDD04" });
        case 'quiz': return (0, jsx_runtime_1.jsx)("span", { className: "text-green-500", children: "\u2753" });
        case 'study': return (0, jsx_runtime_1.jsx)("span", { className: "text-purple-500", children: "\uD83D\uDCDA" });
    }
};
function PlannerContent() {
    const [date, setDate] = (0, react_1.useState)(new Date());
    const [events, setEvents] = (0, react_1.useState)(dummyEvents);
    const selectedDayEvents = events.filter(event => date && (0, date_fns_1.format)(event.date, 'yyyy-MM-dd') === (0, date_fns_1.format)(date, 'yyyy-MM-dd'));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full bg-muted/40", children: [(0, jsx_runtime_1.jsxs)("header", { className: "sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(sidebar_1.SidebarTrigger, { className: "lg:hidden" }), (0, jsx_runtime_1.jsx)(back_button_1.BackButton, {}), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold tracking-tight", children: "Study Planner" })] }), (0, jsx_runtime_1.jsxs)(button_1.Button, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }), "New Event"] })] }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-4 md:p-6 lg:p-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "grid gap-8 md:grid-cols-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "md:col-span-2", children: (0, jsx_runtime_1.jsx)(card_1.Card, { children: (0, jsx_runtime_1.jsx)(card_1.CardContent, { className: "p-0", children: (0, jsx_runtime_1.jsx)(calendar_1.Calendar, { mode: "single", selected: date, onSelect: setDate, className: "w-full", modifiers: {
                                            hasEvent: events.map(e => e.date)
                                        }, modifiersClassNames: {
                                            hasEvent: 'relative !text-primary before:content-[""] before:absolute before:bottom-1 before:left-1/2 before:-translate-x-1/2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary'
                                        } }) }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "md:col-span-1", children: (0, jsx_runtime_1.jsxs)(card_1.Card, { children: [(0, jsx_runtime_1.jsx)(card_1.CardHeader, { children: (0, jsx_runtime_1.jsxs)(card_1.CardTitle, { children: ["Events for ", date ? (0, date_fns_1.format)(date, 'MMMM do, yyyy') : '...'] }) }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: selectedDayEvents.length > 0 ? ((0, jsx_runtime_1.jsx)("ul", { className: "space-y-3", children: selectedDayEvents.map(event => ((0, jsx_runtime_1.jsxs)("li", { className: "flex items-center gap-3 p-3 bg-muted/50 rounded-lg", children: [(0, jsx_runtime_1.jsx)(EventTypeIcon, { type: event.type }), (0, jsx_runtime_1.jsx)("span", { className: "flex-1 text-sm font-medium", children: event.title })] }, event.id))) })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground text-center py-8", children: "No events scheduled for this day." })) })] }) })] }) })] }));
}
