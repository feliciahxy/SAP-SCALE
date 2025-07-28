sap.ui.define([], function () {
    "use strict";

    return class JouleAI {
        constructor() {
            this.name = "Joule AI Assistant";
            this.version = "1.0";
            this.initializeAI();
        }

        initializeAI() {
            // Initialize AI capabilities
            this.intents = {
                "flight_status": ["flight", "delayed", "status", "departed", "arrived", "schedule"],
                "maintenance": ["maintenance", "check", "service", "repair", "aircraft"],
                "performance": ["performance", "kpi", "metric", "efficiency", "utilization"],
                "optimization": ["optimize", "improve", "schedule", "efficiency", "reduce"],
                "prediction": ["predict", "forecast", "will", "future", "tomorrow", "next"],
                "alerts": ["alert", "warning", "issue", "problem", "attention"],
                "revenue": ["revenue", "money", "profit", "earnings", "financial"]
            };

            this.responses = {
                greetings: [
                    "Hello! I'm Joule, your AI aviation assistant. How can I help you optimize operations today?",
                    "Hi there! Ready to analyze your aviation data and provide insights.",
                    "Welcome! I can help with flight operations, maintenance predictions, and performance optimization."
                ],
                capabilities: [
                    "I can analyze flight data, predict maintenance needs, optimize schedules, and provide real-time operational insights.",
                    "My capabilities include: flight status monitoring, predictive maintenance, KPI analysis, and schedule optimization.",
                    "I'm trained on aviation data to help you make better operational decisions."
                ]
            };
        }

        async processQuery(query, context) {
            const intent = this._detectIntent(query.toLowerCase());
            const entities = this._extractEntities(query, context);
            
            switch (intent) {
                case "flight_status":
                    return this._handleFlightStatus(entities, context);
                case "maintenance":
                    return this._handleMaintenance(entities, context);
                case "performance":
                    return this._handlePerformance(entities, context);
                case "optimization":
                    return this._handleOptimization(entities, context);
                case "prediction":
                    return this._handlePrediction(entities, context);
                case "alerts":
                    return this._handleAlerts(entities, context);
                case "revenue":
                    return this._handleRevenue(entities, context);
                case "greeting":
                    return this._handleGreeting();
                default:
                    return this._handleGeneral(query, context);
            }
        }

        _detectIntent(query) {
            // Check for greetings
            const greetings = ["hi", "hello", "hey", "good morning", "good afternoon"];
            if (greetings.some(g => query.includes(g))) {
                return "greeting";
            }

            // Check other intents
            for (const [intent, keywords] of Object.entries(this.intents)) {
                if (keywords.some(keyword => query.includes(keyword))) {
                    return intent;
                }
            }

            return "general";
        }

        _extractEntities(query, context) {
            const entities = {};

            // Extract flight numbers
            const flightMatch = query.match(/SL\d{3}/gi);
            if (flightMatch) {
                entities.flightNumber = flightMatch[0].toUpperCase();
            }

            // Extract aircraft
            const aircraftMatch = query.match(/[AB]\d{3}-\d{3}/gi);
            if (aircraftMatch) {
                entities.aircraft = aircraftMatch[0].toUpperCase();
            }

            // Extract time references
            if (query.includes("today")) entities.timeframe = "today";
            if (query.includes("tomorrow")) entities.timeframe = "tomorrow";
            if (query.includes("week")) entities.timeframe = "week";

            return entities;
        }

        _handleFlightStatus(entities, context) {
            const flights = context.flights || [];
            
            if (entities.flightNumber) {
                const flight = flights.find(f => f.flightNumber === entities.flightNumber);
                if (flight) {
                    return {
                        text: `Flight ${flight.flightNumber} (${flight.origin} → ${flight.destination}) is currently ${flight.status}. ${flight.delayMinutes ? `Delayed by ${flight.delayMinutes} minutes due to ${flight.delayReason}.` : 'On schedule.'}`,
                        actions: []
                    };
                }
            }

            // General status query
            const delayed = flights.filter(f => f.status === "delayed");
            const response = delayed.length > 0 
                ? `Currently ${delayed.length} flights are delayed: ${delayed.map(f => f.flightNumber).join(", ")}. Main causes: air traffic congestion and weather conditions.`
                : "All flights are operating on schedule. No delays reported.";

            return {
                text: response,
                actions: delayed.length > 0 ? [{
                    label: "View Delayed Flights",
                    type: "filter",
                    entity: "flights",
                    filters: { status: "delayed" }
                }] : []
            };
        }

        _handleMaintenance(entities, context) {
            const predictions = [
                "🔧 Aircraft A320-001 shows hydraulic pressure anomaly patterns. Recommend inspection within 48 hours.",
                "⚠️ B737-002 approaching mandatory service interval (50 hours remaining).",
                "✅ A350-001 maintenance schedule optimal. No issues detected."
            ];

            const actions = [{
                label: "Schedule Maintenance",
                type: "navigate",
                target: "maintenance"
            }];

            if (entities.aircraft) {
                return {
                    text: `Maintenance analysis for ${entities.aircraft}: Hydraulic system showing early warning signs. Preventive maintenance recommended during next ground time. This could prevent an estimated 3-hour delay if addressed proactively.`,
                    actions
                };
            }

            return {
                text: `Predictive maintenance analysis:\n\n${predictions.join("\n\n")}`,
                actions
            };
        }

        _handlePerformance(entities, context) {
            const kpis = context.kpis || {};
            
            return {
                text: `Current Performance Metrics:\n\n` +
                      `✈️ On-Time Performance: ${kpis.onTimePerformance?.value || 82.5}% (Target: 90%)\n` +
                      `📊 Fleet Utilization: ${kpis.fleetUtilization?.value || 78.3}% (Target: 75%)\n` +
                      `💰 Daily Revenue: $${((kpis.revenue?.value || 2450000) / 1000000).toFixed(1)}M (Target: $2.3M)\n\n` +
                      `Fleet utilization is exceeding target by 3.3% - excellent efficiency! However, on-time performance needs attention.`,
                actions: [{
                    label: "View Analytics",
                    type: "navigate",
                    target: "analytics"
                }]
            };
        }

        _handleOptimization(entities, context) {
            const optimizations = [
                "Move flight SL005 to 30 minutes earlier to avoid predicted congestion at DFW (+$4,200 revenue)",
                "Swap aircraft for SL012 with more fuel-efficient A321neo (8% fuel savings)",
                "Consolidate ground crew schedules to reduce overtime costs by $1,800/day"
            ];

            return {
                text: `🎯 Optimization Opportunities Identified:\n\n${optimizations.map((opt, i) => `${i + 1}. ${opt}`).join("\n")}\n\nImplementing these changes could increase daily efficiency by 12% and save $8,400 in operational costs.`,
                actions: [{
                    label: "Apply Optimizations",
                    type: "optimize",
                    target: "schedule"
                }]
            };
        }

        _handlePrediction(entities, context) {
            const timeframe = entities.timeframe || "tomorrow";
            
            const predictions = {
                today: "Based on current patterns, expect 2 minor delays this afternoon due to weather at ORD. Recommend pre-positioning crew.",
                tomorrow: "Weather forecast shows 40% chance of storms at JFK tomorrow afternoon. Consider rescheduling 3 flights to morning slots. Demand forecast shows 15% higher bookings for morning flights.",
                week: "Next week's demand analysis: JFK-LAX route +25%, ORD-DFW +18%. Consider adding capacity or using larger aircraft."
            };

            return {
                text: `🔮 Predictive Analysis for ${timeframe}:\n\n${predictions[timeframe] || predictions.tomorrow}\n\nMy ML models show 92% confidence in these predictions based on historical patterns and current data.`,
                actions: [{
                    label: "Adjust Schedule",
                    type: "navigate",
                    target: "operations"
                }]
            };
        }

        _handleAlerts(entities, context) {
            const alerts = context.alerts || [];
            const activeAlerts = alerts.filter(a => !a.isResolved);
            
            if (activeAlerts.length === 0) {
                return {
                    text: "✅ No critical alerts at this time. All systems operating normally.",
                    actions: []
                };
            }

            const critical = activeAlerts.filter(a => a.severity === "critical");
            const warning = activeAlerts.filter(a => a.severity === "warning");

            return {
                text: `🚨 Active Alerts:\n\n` +
                      `Critical (${critical.length}): ${critical.map(a => a.title).join(", ")}\n` +
                      `Warnings (${warning.length}): ${warning.map(a => a.title).join(", ")}\n\n` +
                      `Immediate attention required for critical alerts.`,
                actions: [{
                    label: "Manage Alerts",
                    type: "filter",
                    entity: "alerts",
                    filters: { isResolved: false }
                }]
            };
        }

        _handleRevenue(entities, context) {
            const revenue = context.kpis?.revenue?.value || 2450000;
            const target = context.kpis?.revenue?.target || 2300000;
            const variance = ((revenue - target) / target * 100).toFixed(1);

            return {
                text: `💰 Revenue Analysis:\n\n` +
                      `Today's Revenue: $${(revenue / 1000000).toFixed(1)}M\n` +
                      `Target: $${(target / 1000000).toFixed(1)}M\n` +
                      `Variance: +${variance}%\n\n` +
                      `Top performing routes: JFK-LAX (+12%), ORD-DFW (+8%)\n` +
                      `Recommendation: Dynamic pricing on high-demand routes could increase revenue by additional $45K today.`,
                actions: [{
                    label: "Revenue Details",
                    type: "navigate",
                    target: "analytics"
                }]
            };
        }

        _handleGreeting() {
            const randomGreeting = this.responses.greetings[Math.floor(Math.random() * this.responses.greetings.length)];
            return {
                text: randomGreeting,
                actions: []
            };
        }

        _handleGeneral(query, context) {
            // Check if asking about capabilities
            if (query.includes("can you") || query.includes("what do you") || query.includes("help")) {
                return {
                    text: this.responses.capabilities[0],
                    actions: []
                };
            }

            // Provide a helpful response with suggestions
            return {
                text: "I can help you with:\n• Flight status and delays\n• Maintenance predictions\n• Performance metrics\n• Schedule optimization\n• Revenue analysis\n\nWhat would you like to know?",
                actions: []
            };
        }

        // Additional helper methods for advanced features
        async executeAction(action, context) {
            switch (action.type) {
                case "optimize":
                    return this._executeOptimization(action.target, context);
                case "reschedule":
                    return this._executeReschedule(action.details, context);
                case "alert":
                    return this._createAlert(action.details, context);
                default:
                    return { success: false, message: "Unknown action type" };
            }
        }

        _executeOptimization(target, context) {
            // Simulate optimization execution
            return {
                success: true,
                message: `Schedule optimization completed. Estimated savings: $8,400. 3 flights rescheduled for optimal efficiency.`,
                changes: [
                    { flight: "SL005", change: "Moved 30 minutes earlier" },
                    { flight: "SL012", change: "Aircraft swap to A321neo" },
                    { flight: "SL018", change: "Gate change for faster turnaround" }
                ]
            };
        }

        _executeReschedule(details, context) {
            return {
                success: true,
                message: `Flight ${details.flight} successfully rescheduled to ${details.newTime}. ${details.passengers} passengers notified.`
            };
        }

        _createAlert(details, context) {
            return {
                success: true,
                message: `Alert created: ${details.title}. Relevant teams have been notified.`,
                alertId: `AL${Date.now()}`
            };
        }
    };
});