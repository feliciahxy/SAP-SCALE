sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/format/DateFormat"
], function (Controller, JSONModel, MessageToast, Fragment, DateFormat) {
    "use strict";

    return Controller.extend("skylink.controller.Dashboard", {
        onInit: function () {
            console.log("🚀 Dashboard Controller onInit called");
            
            // Initialize models
            this._initializeModels();
            
            // Load mock data instead of OData for now
            this._loadMockData();
            
            console.log("✅ Dashboard Controller onInit completed");
        },

        onBeforeRendering: function () {
            console.warn("⚠️ Dashboard onBeforeRendering called - this indicates a re-render");
        },

        onAfterRendering: function () {
            console.warn("🔄 Dashboard onAfterRendering called - render completed");
            
            // Debug the InteractiveBarChart
            setTimeout(() => {
                this._debugInteractiveBarChart();
            }, 1000);
        },
        
        _debugInteractiveBarChart: function () {
            const oChart = this.byId("forecastChart");
            console.log("🔍 InteractiveBarChart debug:");
            console.log("  Chart found:", !!oChart);
            
            if (oChart) {
                console.log("  Chart ID:", oChart.getId());
                console.log("  Chart data binding path:", oChart.getBindingPath("bars"));
                console.log("  Chart binding info:", oChart.getBindingInfo("bars"));
                
                const aBars = oChart.getBars();
                console.log("  Number of bars:", aBars ? aBars.length : "No bars");
                
                if (aBars && aBars.length > 0) {
                    console.log("  First bar:", aBars[0]);
                    console.log("  First bar binding context:", aBars[0].getBindingContext());
                    if (aBars[0].getBindingContext()) {
                        console.log("  First bar data:", aBars[0].getBindingContext().getObject());
                    }
                }
                
                // Check if the model has data
                const oModel = this.getView().getModel();
                const forecastData = oModel.getProperty("/forecastData");
                console.log("  Model forecast data:", forecastData);
                console.log("  Model forecast data length:", forecastData ? forecastData.length : "No data");
            }
        },

        _initializeModels: function () {
            console.log("📊 Initializing models");
            
            // Create view model with initial data
            const oViewModel = new JSONModel({
                currentDateTime: this._getCurrentDateTime(),
                lastUpdated: this._getCurrentDateTime(),
                kpis: {
                    onTimePerformance: {
                        value: 82.5,
                        state: "Warning"
                    },
                    fleetUtilization: {
                        value: 78.3,
                        state: "Success"
                    },
                    revenue: {
                        value: 2450000,
                        target: 2300000,
                        state: "Success"
                    },
                    activeAlerts: {
                        critical: 2,
                        warning: 3
                    }
                },
                flights: [],
                alerts: [],
                maintenanceSchedules: [],
                demandHotspots: [],
                countryDemand: [],
                selectedPeriod: "1M",
                forecastData: [],
                forecastAccuracy: {
                    accuracy: 0,
                    avgVariance: 0,
                    bestRoute: "",
                    trend: "up"
                }
            });
            
            this.getView().setModel(oViewModel);
            console.log("✅ View model set");
            
            // Add model change listener to detect what's causing updates
            oViewModel.attachPropertyChange(function(oEvent) {
                console.warn("🔄 Model property changed:", oEvent.getParameter("path"), "->", oEvent.getParameter("value"));
                console.trace("Stack trace for model change:");
            });
        },

        _loadMockData: function () {
            console.log("📝 Loading mock data");
            const oModel = this.getView().getModel();
            
            // Mock flight data
            const mockFlights = [
                {
                    flightNumber: "SL001",
                    origin: "JFK",
                    destination: "LAX",
                    status: "delayed",
                    gate: "A12",
                    passengerCount: 165,
                    delayMinutes: 15
                },
                {
                    flightNumber: "SL002", 
                    origin: "LAX",
                    destination: "ORD",
                    status: "scheduled",
                    gate: "B24",
                    passengerCount: 178
                },
                {
                    flightNumber: "SL003",
                    origin: "ORD", 
                    destination: "JFK",
                    status: "departed",
                    gate: "C15",
                    passengerCount: 385
                },
                {
                    flightNumber: "SL004",
                    origin: "LAX",
                    destination: "DFW", 
                    status: "boarding",
                    gate: "D8",
                    passengerCount: 298
                }
            ];

            // Mock alerts
            const mockAlerts = [
                {
                    title: "Aircraft A321 Maintenance Due Soon",
                    description: "Aircraft SL-A321-01 maintenance check due in 3 days",
                    severity: "warning",
                    isResolved: false,
                    createdAt: new Date()
                },
                {
                    title: "Flight SL001 Delayed",
                    description: "Flight SL001 delayed by 15 minutes due to air traffic congestion",
                    severity: "critical",
                    isResolved: false,
                    createdAt: new Date()
                }
            ];

            // Mock maintenance schedules
            const mockMaintenance = [
                {
                    aircraft: { tailNumber: "SL-A321-01" },
                    maintenanceType: "routine",
                    description: "Routine A-check including engine inspection",
                    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                    status: "scheduled"
                },
                {
                    aircraft: { tailNumber: "SL-B737-01" },
                    maintenanceType: "heavy",
                    description: "D-check comprehensive structural inspection", 
                    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
                    status: "scheduled"
                }
            ];

            // Mock flight demand hotspots data - major aviation hubs with increased flight demand
            const mockDemandHotspots = [
                // North America
                {
                    city: "New York (JFK)",
                    latitude: 40.6413,
                    longitude: -73.7781,
                    demandLevel: 89,
                    region: "North America"
                },
                {
                    city: "Los Angeles (LAX)", 
                    latitude: 33.9425,
                    longitude: -118.4081,
                    demandLevel: 94,
                    region: "North America"
                },
                {
                    city: "Chicago (ORD)",
                    latitude: 41.9742,
                    longitude: -87.9073,
                    demandLevel: 87,
                    region: "North America"
                },
                {
                    city: "Miami (MIA)",
                    latitude: 25.7959,
                    longitude: -80.2870,
                    demandLevel: 91,
                    region: "North America"
                },
                {
                    city: "Denver (DEN)",
                    latitude: 39.8561,
                    longitude: -104.6737,
                    demandLevel: 83,
                    region: "North America"
                },
                
                // Europe
                {
                    city: "London (LHR)",
                    latitude: 51.4700,
                    longitude: -0.4543,
                    demandLevel: 88,
                    region: "Europe"
                },
                {
                    city: "Paris (CDG)",
                    latitude: 49.0097,
                    longitude: 2.5479,
                    demandLevel: 85,
                    region: "Europe"
                },
                {
                    city: "Frankfurt (FRA)",
                    latitude: 50.0379,
                    longitude: 8.5622,
                    demandLevel: 86,
                    region: "Europe"
                },
                {
                    city: "Amsterdam (AMS)",
                    latitude: 52.3105,
                    longitude: 4.7683,
                    demandLevel: 82,
                    region: "Europe"
                },
                {
                    city: "Madrid (MAD)",
                    latitude: 40.4839,
                    longitude: -3.5680,
                    demandLevel: 79,
                    region: "Europe"
                },
                
                // Asia-Pacific
                {
                    city: "Tokyo (NRT)",
                    latitude: 35.7655,
                    longitude: 140.3864,
                    demandLevel: 96,
                    region: "Asia-Pacific"
                },
                {
                    city: "Singapore (SIN)",
                    latitude: 1.3644,
                    longitude: 103.9915,
                    demandLevel: 93,
                    region: "Asia-Pacific"
                },
                {
                    city: "Hong Kong (HKG)",
                    latitude: 22.3080,
                    longitude: 113.9185,
                    demandLevel: 90,
                    region: "Asia-Pacific"
                },
                {
                    city: "Sydney (SYD)",
                    latitude: -33.9399,
                    longitude: 151.1753,
                    demandLevel: 81,
                    region: "Asia-Pacific"
                },
                {
                    city: "Seoul (ICN)",
                    latitude: 37.4602,
                    longitude: 126.4407,
                    demandLevel: 88,
                    region: "Asia-Pacific"
                },
                
                // Middle East & Africa
                {
                    city: "Dubai (DXB)",
                    latitude: 25.2532,
                    longitude: 55.3657,
                    demandLevel: 92,
                    region: "Middle East"
                },
                {
                    city: "Doha (DOH)",
                    latitude: 25.2731,
                    longitude: 51.6078,
                    demandLevel: 87,
                    region: "Middle East"
                },
                {
                    city: "Istanbul (IST)",
                    latitude: 41.2753,
                    longitude: 28.7519,
                    demandLevel: 84,
                    region: "Middle East"
                },
                
                // Emerging Markets
                {
                    city: "Mumbai (BOM)",
                    latitude: 19.0896,
                    longitude: 72.8656,
                    demandLevel: 89,
                    region: "Asia"
                },
                {
                    city: "São Paulo (GRU)",
                    latitude: -23.4356,
                    longitude: -46.4731,
                    demandLevel: 86,
                    region: "South America"
                }
            ];

            // Mock country demand data with ISO codes for AnalyticMap
            const mockCountryDemand = [
                {
                    country: "United States",
                    countryCode: "US",
                    demandLevel: 91,
                    majorAirports: "JFK, LAX, ORD, MIA, DEN"
                },
                {
                    country: "Japan",
                    countryCode: "JP",
                    demandLevel: 96,
                    majorAirports: "NRT, HND"
                },
                {
                    country: "Singapore",
                    countryCode: "SG",
                    demandLevel: 93,
                    majorAirports: "SIN"
                },
                {
                    country: "United Kingdom",
                    countryCode: "GB",
                    demandLevel: 88,
                    majorAirports: "LHR, LGW"
                },
                {
                    country: "Germany",
                    countryCode: "DE",
                    demandLevel: 86,
                    majorAirports: "FRA, MUC"
                },
                {
                    country: "France",
                    countryCode: "FR",
                    demandLevel: 85,
                    majorAirports: "CDG, ORY"
                },
                {
                    country: "United Arab Emirates",
                    countryCode: "AE",
                    demandLevel: 92,
                    majorAirports: "DXB, AUH"
                },
                {
                    country: "Netherlands",
                    countryCode: "NL",
                    demandLevel: 82,
                    majorAirports: "AMS"
                },
                {
                    country: "Spain",
                    countryCode: "ES",
                    demandLevel: 79,
                    majorAirports: "MAD, BCN"
                },
                {
                    country: "South Korea",
                    countryCode: "KR",
                    demandLevel: 88,
                    majorAirports: "ICN, GMP"
                },
                {
                    country: "Australia",
                    countryCode: "AU",
                    demandLevel: 81,
                    majorAirports: "SYD, MEL"
                },
                {
                    country: "Turkey",
                    countryCode: "TR",
                    demandLevel: 84,
                    majorAirports: "IST, SAW"
                },
                {
                    country: "Qatar",
                    countryCode: "QA",
                    demandLevel: 87,
                    majorAirports: "DOH"
                },
                {
                    country: "India",
                    countryCode: "IN",
                    demandLevel: 89,
                    majorAirports: "BOM, DEL"
                },
                {
                    country: "Brazil",
                    countryCode: "BR",
                    demandLevel: 86,
                    majorAirports: "GRU, GIG"
                },
                {
                    country: "Hong Kong",
                    countryCode: "HK",
                    demandLevel: 90,
                    majorAirports: "HKG"
                },
                {
                    country: "Canada",
                    countryCode: "CA",
                    demandLevel: 83,
                    majorAirports: "YYZ, YVR"
                },
                {
                    country: "China",
                    countryCode: "CN",
                    demandLevel: 87,
                    majorAirports: "PEK, PVG"
                }
            ];

            console.log("🔧 Setting model properties...");
            oModel.setProperty("/flights", mockFlights);
            oModel.setProperty("/alerts", mockAlerts);
            oModel.setProperty("/maintenanceSchedules", mockMaintenance);
            oModel.setProperty("/demandHotspots", mockDemandHotspots);
            oModel.setProperty("/countryDemand", mockCountryDemand);
            oModel.setProperty("/lastUpdated", this._getCurrentDateTime());
            
            // Initialize forecast data
            this._loadForecastData("1M");
            
            console.log("📍 Hotspots data loaded:", mockDemandHotspots.length, "hotspots");
            console.log("🌍 Country data loaded:", mockCountryDemand.length, "countries");
            console.log("🗺️ Sample hotspot:", mockDemandHotspots[0]);
            console.log("✅ Mock data loaded successfully");
        },

        _startAutoRefresh: function () {
            // Update time every minute (disabled to prevent re-rendering issues)
            // setInterval(() => {
            //     this.getView().getModel().setProperty("/currentDateTime", this._getCurrentDateTime());
            // }, 60000);
        },

        _getCurrentDateTime: function () {
            const oDateFormat = DateFormat.getDateTimeInstance({
                pattern: "MMM dd, yyyy HH:mm"
            });
            return oDateFormat.format(new Date());
        },

        onRefresh: function () {
            console.log("🔄 Manual refresh triggered");
            this._loadMockData();
            MessageToast.show("Dashboard refreshed");
        },

        onOpenJoule: async function () {
            // Create Joule dialog
            if (!this._jouleDialog) {
                this._jouleDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "skylink.view.JouleAssistant",
                    controller: this
                });
                this.getView().addDependent(this._jouleDialog);
                
                // Initialize Joule model
                const oJouleModel = new JSONModel({
                    messages: []
                });
                this._jouleDialog.setModel(oJouleModel, "joule");
            }
            
            this._jouleDialog.open();
        },

        onJouleQuery: function (oEvent) {
            const sQuery = oEvent.getParameter("value") || oEvent.getSource().getValue();
            if (!sQuery) return;

            const oJouleModel = this._jouleDialog.getModel("joule");
            const aMessages = oJouleModel.getProperty("/messages");
            
            // Add user message
            aMessages.push({
                type: "user",
                text: sQuery,
                timestamp: new Date()
            });
            
            // Add AI response
            const aiResponse = this._getJouleResponse(sQuery);
            aMessages.push({
                type: "assistant", 
                text: aiResponse,
                timestamp: new Date()
            });
            
            oJouleModel.setProperty("/messages", aMessages);
            
            // Clear input
            this.byId("jouleInput").setValue("");
        },

        _getJouleResponse: function (query) {
            const lowerQuery = query.toLowerCase();
            
            if (lowerQuery.includes("delay")) {
                return "🚨 Currently 1 flight is delayed: SL001 (JFK → LAX) delayed by 15 minutes due to air traffic congestion. I recommend rebooking 12 passengers to SL006 evening flight.";
            } else if (lowerQuery.includes("maintenance")) {
                return "🔧 Upcoming maintenance:\n• SL-A321-01: Routine A-check tomorrow (4 hours)\n• SL-B737-01: Heavy D-check next week (168 hours)\n\nRecommendation: Schedule A321 maintenance during overnight window to minimize disruption.";
            } else if (lowerQuery.includes("performance") || lowerQuery.includes("metrics")) {
                return "📊 Current Performance:\n• On-Time: 82.5% (Target: 90%)\n• Fleet Utilization: 78.3% (Target: 75%)\n• Revenue: $2.45M (Target: $2.3M)\n\nFleet utilization exceeds target by 3.3% - excellent efficiency!";
            } else if (lowerQuery.includes("optimize")) {
                return "🎯 Optimization opportunities:\n1. Move SL005 30min earlier to avoid DFW congestion (+$4,200 revenue)\n2. Swap SL012 to A321neo for 8% fuel savings\n3. Consolidate ground crews to save $1,800/day\n\nImplementing these changes could increase efficiency by 12%.";
            } else if (lowerQuery.includes("predict")) {
                return "🔮 Predictions:\n• 40% chance of weather delays at JFK tomorrow afternoon\n• A320-001 has 85% probability of hydraulic issue in 72 hours\n• JFK-LAX route will see 25% increased demand next week\n\nRecommend preemptive maintenance and capacity adjustments.";
            } else {
                return "I can help you with:\n• Flight status and delays\n• Maintenance predictions\n• Performance metrics\n• Schedule optimization\n• Revenue analysis\n\nWhat would you like to know?";
            }
        },

        onSuggestedQuery: function (oEvent) {
            const sQuery = oEvent.getSource().getText();
            this.byId("jouleInput").setValue(sQuery);
            this.onJouleQuery({ getParameter: () => sQuery, getSource: () => ({ getValue: () => sQuery, setValue: () => {} }) });
        },

        onCloseJoule: function () {
            this._jouleDialog.close();
        },

        formatDateTime: function (sDateTime) {
            if (!sDateTime) return "";
            const oDateFormat = DateFormat.getDateTimeInstance({
                pattern: "MMM dd, HH:mm"
            });
            return oDateFormat.format(new Date(sDateTime));
        },

        formatDate: function (sDate) {
            if (!sDate) return "";
            const oDateFormat = DateFormat.getDateInstance({
                pattern: "MMM dd, yyyy"
            });
            return oDateFormat.format(new Date(sDate));
        },

        formatCurrency: function (nValue) {
            if (!nValue) return "$0";
            return "$" + (nValue / 1000000).toFixed(1) + "M";
        },

        formatCurrencyShort: function (nValue) {
            if (!nValue) return "0";
            return (nValue / 1000000).toFixed(1) + "M";
        },

        formatFlightStatus: function (sStatus) {
            const statusMap = {
                "scheduled": "None",
                "boarding": "Warning", 
                "departed": "Success",
                "arrived": "Success",
                "delayed": "Error",
                "cancelled": "Error"
            };
            return statusMap[sStatus] || "None";
        },

        formatAlertPriority: function (sSeverity) {
            const stateMap = {
                "critical": "Error",
                "warning": "Warning",
                "info": "None"
            };
            return stateMap[sSeverity] || "None";
        },

        formatHotspotScale: function (demandLevel) {
            // Scale spots based on demand level (70-100% range)
            // Convert demand level to scale factor between 1 and 4
            if (!demandLevel) return "1.5";
            
            const minScale = 1.0;
            const maxScale = 4.0;
            const scaleFactor = minScale + ((demandLevel - 70) / 30) * (maxScale - minScale);
            
            return Math.max(minScale, Math.min(maxScale, scaleFactor)).toFixed(1);
        },

        formatHotspotType: function (demandLevel) {
            // Color code based on demand level
            if (!demandLevel) return "Default";
            
            if (demandLevel >= 90) return "Error";      // Red for very high demand
            if (demandLevel >= 85) return "Warning";    // Orange for high demand  
            if (demandLevel >= 80) return "Success";    // Green for moderate-high demand
            return "Default";                           // Blue for normal demand
        },

        formatHotspotRadius: function (demandLevel) {
            // Convert demand level to radius in pixels
            if (!demandLevel) return "20";
            
            const minRadius = 15;
            const maxRadius = 50;
            const radius = minRadius + ((demandLevel - 70) / 30) * (maxRadius - minRadius);
            
            return Math.max(minRadius, Math.min(maxRadius, radius)).toString();
        },

        formatHotspotBorderColor: function (demandLevel) {
            // Border color based on demand level
            if (!demandLevel) return "RGB(0,0,255)";
            
            if (demandLevel >= 90) return "RGB(220,38,38)";    // Red border
            if (demandLevel >= 85) return "RGB(245,158,11)";   // Orange border
            if (demandLevel >= 80) return "RGB(34,197,94)";    // Green border
            return "RGB(59,130,246)";                          // Blue border
        },

        formatHotspotFillColor: function (demandLevel) {
            // Fill color with transparency based on demand level
            if (!demandLevel) return "RGBA(0,0,255,0.3)";
            
            if (demandLevel >= 90) return "RGBA(220,38,38,0.4)";    // Red fill
            if (demandLevel >= 85) return "RGBA(245,158,11,0.4)";   // Orange fill
            if (demandLevel >= 80) return "RGBA(34,197,94,0.4)";    // Green fill
            return "RGBA(59,130,246,0.3)";                          // Blue fill
        },

        formatDemandState: function (demandLevel) {
            // State for ProgressIndicator and ObjectStatus
            if (!demandLevel) return "None";
            
            if (demandLevel >= 90) return "Error";      // Red for very high demand
            if (demandLevel >= 85) return "Warning";    // Orange for high demand  
            if (demandLevel >= 80) return "Success";    // Green for moderate-high demand
            return "Information";                       // Blue for normal demand
        },

        formatDemandStatusText: function (demandLevel) {
            // Status text based on demand level
            if (!demandLevel) return "Unknown";
            
            if (demandLevel >= 90) return "Critical";
            if (demandLevel >= 85) return "High";  
            if (demandLevel >= 80) return "Elevated";
            return "Normal";
        },

        formatCountryDemandColor: function (demandLevel) {
            // Color countries based on demand level for AnalyticMap
            if (!demandLevel) return "rgba(59,130,246,0.6)";
            
            if (demandLevel >= 90) return "rgba(220,38,38,0.8)";    // Red for critical demand
            if (demandLevel >= 85) return "rgba(245,158,11,0.8)";   // Orange for high demand
            if (demandLevel >= 80) return "rgba(34,197,94,0.8)";    // Green for elevated demand
            return "rgba(59,130,246,0.6)";                          // Blue for normal demand
        },

        onMapRendered: function () {
            // Create simple hotspot visualization using HTML5 Canvas or DOM elements
            setTimeout(() => {
                this._renderHotspots();
            }, 100);
        },

        _renderHotspots: function () {
            const overlay = document.getElementById('hotspotsOverlay');
            if (!overlay) return;

            const hotspots = this.getView().getModel().getProperty("/demandHotspots");
            if (!hotspots) return;

            // Clear existing content
            overlay.innerHTML = '';

            // Create hotspot visualizations as DOM elements
            hotspots.forEach(hotspot => {
                const hotspotDiv = document.createElement('div');
                
                // Calculate position (simplified positioning)
                const x = ((hotspot.longitude + 180) / 360) * 100; // Convert longitude to %
                const y = ((90 - hotspot.latitude) / 180) * 100;   // Convert latitude to %
                
                // Size based on demand level
                const size = 8 + (hotspot.demandLevel - 70) * 0.5;
                
                // Color based on demand level
                let color = '#3b82f6'; // Blue
                if (hotspot.demandLevel >= 90) color = '#dc2626'; // Red
                else if (hotspot.demandLevel >= 85) color = '#f59e0b'; // Orange
                else if (hotspot.demandLevel >= 80) color = '#22c55e'; // Green
                
                hotspotDiv.style.cssText = `
                    position: absolute;
                    left: ${x}%;
                    top: ${y}%;
                    width: ${size}px;
                    height: ${size}px;
                    background-color: ${color};
                    border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.8);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    cursor: pointer;
                    transform: translate(-50%, -50%);
                    transition: all 0.3s ease;
                `;
                
                hotspotDiv.title = `${hotspot.city} - ${hotspot.region}: ${hotspot.demandLevel}% demand increase`;
                
                // Add hover effects
                hotspotDiv.onmouseenter = function() {
                    this.style.transform = 'translate(-50%, -50%) scale(1.2)';
                    this.style.zIndex = '10';
                };
                hotspotDiv.onmouseleave = function() {
                    this.style.transform = 'translate(-50%, -50%) scale(1)';
                    this.style.zIndex = '1';
                };
                
                overlay.appendChild(hotspotDiv);
            });
        },

        _loadForecastData: function (period) {
            const oModel = this.getView().getModel();
            
            // Generate mock forecast vs actual data based on period
            let forecastData = [];
            
            if (period === "1D") {
                forecastData = [
                    { route: "JFK→LAX", aircraft: "A321", forecastValue: 85, actualValue: 82, variance: -3, trend: "down" },
                    { route: "LAX→ORD", aircraft: "B737", forecastValue: 78, actualValue: 85, variance: 7, trend: "up" },
                    { route: "ORD→JFK", aircraft: "A320", forecastValue: 92, actualValue: 89, variance: -3, trend: "stable" },
                    { route: "MIA→LAX", aircraft: "B777", forecastValue: 88, actualValue: 91, variance: 3, trend: "up" },
                    { route: "DEN→JFK", aircraft: "A321", forecastValue: 76, actualValue: 72, variance: -4, trend: "down" },
                    { route: "LAX→MIA", aircraft: "B737", forecastValue: 83, actualValue: 87, variance: 4, trend: "up" }
                ];
            } else if (period === "1M") {
                forecastData = [
                    { route: "JFK→LAX", aircraft: "A321", forecastValue: 82, actualValue: 85, variance: 3, trend: "up" },
                    { route: "LAX→LHR", aircraft: "B777", forecastValue: 89, actualValue: 82, variance: -7, trend: "down" },
                    { route: "ORD→NRT", aircraft: "B787", forecastValue: 91, actualValue: 94, variance: 3, trend: "up" },
                    { route: "MIA→FRA", aircraft: "A330", forecastValue: 78, actualValue: 71, variance: -7, trend: "down" },
                    { route: "LAX→SIN", aircraft: "A350", forecastValue: 85, actualValue: 89, variance: 4, trend: "up" },
                    { route: "JFK→CDG", aircraft: "B777", forecastValue: 87, actualValue: 83, variance: -4, trend: "stable" },
                    { route: "ORD→DXB", aircraft: "B787", forecastValue: 93, actualValue: 96, variance: 3, trend: "up" },
                    { route: "DEN→ICN", aircraft: "A330", forecastValue: 79, actualValue: 84, variance: 5, trend: "up" }
                ];
            } else { // 6M
                forecastData = [
                    { route: "JFK→LAX", aircraft: "A321", forecastValue: 84, actualValue: 87, variance: 3, trend: "up" },
                    { route: "LAX→LHR", aircraft: "B777", forecastValue: 88, actualValue: 79, variance: -9, trend: "down" },
                    { route: "ORD→NRT", aircraft: "B787", forecastValue: 90, actualValue: 95, variance: 5, trend: "up" },
                    { route: "MIA→FRA", aircraft: "A330", forecastValue: 77, actualValue: 69, variance: -8, trend: "down" },
                    { route: "LAX→SIN", aircraft: "A350", forecastValue: 86, actualValue: 91, variance: 5, trend: "up" },
                    { route: "JFK→CDG", aircraft: "B777", forecastValue: 85, actualValue: 81, variance: -4, trend: "stable" },
                    { route: "ORD→DXB", aircraft: "B787", forecastValue: 92, actualValue: 97, variance: 5, trend: "up" },
                    { route: "DEN→ICN", aircraft: "A330", forecastValue: 80, actualValue: 86, variance: 6, trend: "up" },
                    { route: "LAX→HKG", aircraft: "A350", forecastValue: 89, actualValue: 83, variance: -6, trend: "down" },
                    { route: "JFK→DOH", aircraft: "B777", forecastValue: 91, actualValue: 94, variance: 3, trend: "stable" }
                ];
            }
            
            // Calculate accuracy metrics
            const totalVariance = forecastData.reduce((sum, item) => sum + Math.abs(item.variance), 0);
            const avgVariance = (totalVariance / forecastData.length).toFixed(1);
            const accuracy = (100 - avgVariance).toFixed(1);
            const bestRoute = forecastData.reduce((best, current) => 
                Math.abs(current.variance) < Math.abs(best.variance) ? current : best
            ).route;
            
            const forecastAccuracy = {
                accuracy: accuracy,
                avgVariance: avgVariance,
                bestRoute: bestRoute,
                trend: accuracy > 85 ? "up" : accuracy > 75 ? "stable" : "down"
            };
            
            oModel.setProperty("/forecastData", forecastData);
            oModel.setProperty("/forecastAccuracy", forecastAccuracy);
            oModel.setProperty("/selectedPeriod", period);
            
            console.log(`📊 Forecast data loaded for ${period}:`, forecastData.length, "routes");
            console.log("📊 Sample forecast data:", forecastData[0]);
            console.log("📊 All forecast data:", forecastData);
        },

        // Event handlers for forecast analysis
        onPeriodChange: function (oEvent) {
            const selectedPeriod = oEvent.getParameter("key") || "1M";
            this._loadForecastData(selectedPeriod);
            MessageToast.show(`Switched to ${selectedPeriod} forecast analysis`);
        },

        onRouteSelectionChanged: function (oEvent) {
            const selectedBars = oEvent.getParameter("selectedBars");
            if (selectedBars && selectedBars.length > 0) {
                const oContext = selectedBars[0].getBindingContext();
                if (oContext) {
                    const routeData = oContext.getObject();
                    MessageToast.show(`Selected route: ${routeData.route} (Variance: ${routeData.variance}%)`);
                }
            } else {
                console.log("No bars selected or context not available");
            }
        },

        onChartPress: function (oEvent) {
            MessageToast.show("Chart pressed - showing detailed forecast analysis");
        },

        onExportForecast: function () {
            MessageToast.show("Exporting forecast analysis data...");
        },

        onRouteDetailsPress: function (oEvent) {
            const routeData = oEvent.getSource().getBindingContext().getObject();
            MessageToast.show(`Route details: ${routeData.route} - Forecast: ${routeData.forecastValue}%, Actual: ${routeData.actualValue}%`);
        },

        // Formatters for forecast analysis
        formatPercentage: function (value) {
            return value ? value + "%" : "0%";
        },

        formatVarianceDisplay: function (variance) {
            if (!variance) return "0%";
            return (variance > 0 ? "+" : "") + variance + "%";
        },

        formatVarianceValue: function (variance) {
            // For InteractiveBarChart, we need absolute values
            console.log("🔧 formatVarianceValue called with:", variance);
            if (!variance) return 0;
            const result = Math.abs(variance);
            console.log("🔧 formatVarianceValue returning:", result);
            return result;
        },

        formatVarianceColor: function (variance) {
            console.log("🎨 formatVarianceColor called with:", variance);
            if (!variance) return "Neutral";
            
            const absVariance = Math.abs(variance);
            let color = "Good";
            if (absVariance >= 7) color = "Error";
            else if (absVariance >= 4) color = "Critical";  
            else if (absVariance >= 2) color = "Good";
            
            console.log("🎨 formatVarianceColor returning:", color, "for variance:", variance);
            return color;
        },

        formatVarianceStatus: function (variance) {
            if (!variance) return "Accurate";
            
            const absVariance = Math.abs(variance);
            if (absVariance >= 7) return "Poor";
            if (absVariance >= 4) return "Fair";
            return "Good";
        },

        formatVarianceState: function (variance) {
            if (!variance) return "Success";
            
            const absVariance = Math.abs(variance);
            if (absVariance >= 7) return "Error";
            if (absVariance >= 4) return "Warning";
            return "Success";
        },

        formatForecastDisplay: function (forecast, actual) {
            console.log("📊 formatForecastDisplay called with:", forecast, actual);
            if (!forecast || !actual) return "";
            const result = `F:${forecast}% A:${actual}%`;
            console.log("📊 formatForecastDisplay returning:", result);
            return result;
        },

        formatAccuracyColor: function (accuracy) {
            if (!accuracy) return "Neutral";
            
            if (accuracy >= 90) return "Good";
            if (accuracy >= 80) return "Critical";
            return "Error";
        },

        formatTrendIndicator: function (trend) {
            const trendMap = {
                "up": "Up",
                "down": "Down", 
                "stable": "None"
            };
            return trendMap[trend] || "None";
        },

        formatTrendIcon: function (trend) {
            const iconMap = {
                "up": "sap-icon://trend-up",
                "down": "sap-icon://trend-down",
                "stable": "sap-icon://horizontal-grip"
            };
            return iconMap[trend] || "sap-icon://horizontal-grip";
        },

        formatTrendColor: function (trend) {
            const colorMap = {
                "up": "#22c55e",
                "down": "#dc2626", 
                "stable": "#6b7280"
            };
            return colorMap[trend] || "#6b7280";
        },

        formatVerticalBarChart: function (forecastData) {
            if (!forecastData || !Array.isArray(forecastData)) {
                return "<div>No data available</div>";
            }

            console.log("🎨 Creating vertical bar chart for:", forecastData.length, "routes");

            let chartHTML = "";
            const maxValue = 100; // Maximum percentage for scaling

            forecastData.forEach((routeData, index) => {
                const forecastHeight = Math.max(10, (routeData.forecastValue / maxValue) * 300);
                const actualHeight = Math.max(10, (routeData.actualValue / maxValue) * 300);
                
                // Color based on variance
                const variance = Math.abs(routeData.variance);
                let borderColor = "#22c55e"; // Green for good
                if (variance >= 7) borderColor = "#dc2626"; // Red for poor
                else if (variance >= 4) borderColor = "#f59e0b"; // Orange for fair

                chartHTML += `
                    <div style="
                        display: inline-flex;
                        flex-direction: column;
                        align-items: center;
                        margin: 0 12px;
                        position: relative;
                        height: 360px;
                        justify-content: flex-end;
                        min-width: 70px;
                    ">
                        <!-- Route Label -->
                        <div style="
                            position: absolute;
                            top: 0;
                            font-size: 12px;
                            font-weight: bold;
                            text-align: center;
                            width: 80px;
                            color: #374151;
                        ">${routeData.route}</div>
                        
                        <!-- Aircraft Label -->
                        <div style="
                            position: absolute;
                            top: 15px;
                            font-size: 10px;
                            text-align: center;
                            width: 80px;
                            color: #6b7280;
                        ">${routeData.aircraft}</div>
                        
                        <!-- Bars Container -->
                        <div style="
                            display: flex;
                            align-items: flex-end;
                            gap: 4px;
                            margin-top: 35px;
                        ">
                            <!-- Forecast Bar -->
                            <div style="
                                width: 28px;
                                height: ${forecastHeight}px;
                                background: linear-gradient(to top, #3b82f6, #60a5fa);
                                border: 2px solid ${borderColor};
                                border-radius: 4px 4px 0 0;
                                position: relative;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            "
                            onmouseover="this.style.transform='scale(1.1)'; this.style.zIndex='10';"
                            onmouseout="this.style.transform='scale(1)'; this.style.zIndex='1';"
                            title="Forecast: ${routeData.forecastValue}%">
                                <div style="
                                    position: absolute;
                                    top: -20px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    font-size: 10px;
                                    font-weight: bold;
                                    color: #3b82f6;
                                    white-space: nowrap;
                                ">${routeData.forecastValue}%</div>
                            </div>
                            
                            <!-- Actual Bar -->
                            <div style="
                                width: 28px;
                                height: ${actualHeight}px;
                                background: linear-gradient(to top, #22c55e, #4ade80);
                                border: 2px solid ${borderColor};
                                border-radius: 4px 4px 0 0;
                                position: relative;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            "
                            onmouseover="this.style.transform='scale(1.1)'; this.style.zIndex='10';"
                            onmouseout="this.style.transform='scale(1)'; this.style.zIndex='1';"
                            title="Actual: ${routeData.actualValue}%">
                                <div style="
                                    position: absolute;
                                    top: -20px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    font-size: 10px;
                                    font-weight: bold;
                                    color: #22c55e;
                                    white-space: nowrap;
                                ">${routeData.actualValue}%</div>
                            </div>
                        </div>
                        
                        <!-- Variance Indicator -->
                        <div style="
                            margin-top: 8px;
                            font-size: 11px;
                            font-weight: bold;
                            color: ${borderColor};
                            text-align: center;
                        ">${routeData.variance > 0 ? '+' : ''}${routeData.variance}%</div>
                    </div>
                `;
            });

            return `
                <div style="
                    display: flex; 
                    align-items: flex-end; 
                    justify-content: center;
                    padding: 30px 20px 20px 20px; 
                    min-width: ${forecastData.length * 100}px;
                    background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
                    border-radius: 8px;
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
                ">
                    ${chartHTML}
                </div>
            `;
        },

        onSearchFlights: function (oEvent) {
            const sQuery = oEvent.getParameter("query");
            const oTable = this.byId("flightTable");
            const oBinding = oTable.getBinding("items");
            
            if (sQuery && oBinding) {
                const oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("flightNumber", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("origin", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("destination", sap.ui.model.FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
                oBinding.filter([oFilter]);
            } else if (oBinding) {
                oBinding.filter([]);
            }
        },

        onFilterFlights: function () {
            MessageToast.show("Flight filter options");
        },

        onFlightPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext();
            if (oContext) {
                MessageToast.show("Flight details for " + oContext.getProperty("flightNumber"));
            }
        },

        onAlertPress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext();
            if (oContext) {
                MessageToast.show("Alert: " + oContext.getProperty("title"));
            }
        },

        onResolveAlert: function (oEvent) {
            const oItem = oEvent.getParameter("listItem");
            const oContext = oItem.getBindingContext();
            if (oContext) {
                MessageToast.show("Alert resolved: " + oContext.getProperty("title"));
            }
        },

        onMaintenancePress: function (oEvent) {
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext();
            if (oContext) {
                MessageToast.show("Maintenance for " + oContext.getProperty("aircraft/tailNumber"));
            }
        },

        onKPIPress: function (oEvent) {
            const oTile = oEvent.getSource();
            const sTileId = oTile.getId();
            
            console.log("📊 KPI Tile pressed:", sTileId);
            
            // Extract the tile type from ID
            let sKPIType = "";
            if (sTileId.includes("onTime")) {
                sKPIType = "On-Time Performance";
            } else if (sTileId.includes("utilization")) {
                sKPIType = "Fleet Utilization"; 
            } else if (sTileId.includes("revenue")) {
                sKPIType = "Revenue Analysis";
            } else if (sTileId.includes("alerts")) {
                sKPIType = "Active Alerts";
            } else if (sTileId.includes("aircraft")) {
                sKPIType = "Fleet Status";
            }
            
            MessageToast.show(`Drilling down into ${sKPIType} details...`);
            
            // Here you could navigate to detailed views or open dialogs
            // this.getOwnerComponent().getRouter().navTo("kpiDetails", { kpiType: sKPIType });
        }
    });
});