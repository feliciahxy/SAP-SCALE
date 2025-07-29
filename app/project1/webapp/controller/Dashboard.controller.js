sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/core/format/DateFormat"
], function (Controller, JSONModel, MessageToast, MessageBox, Fragment, DateFormat) {
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
            
            // Set up global handler for route clicks
            window.showRouteAlert = (route, forecast, actual) => {
                this._showRouteCapacityAlert(route, forecast, actual);
            };
            
            // Debug the InteractiveBarChart
            setTimeout(() => {
                this._debugInteractiveBarChart();
            }, 1000);
        },
        
        _showRouteCapacityAlert: function(route, forecast, actual) {
            MessageBox.error(
                `⚠️ Capacity Crisis Detected!\n\n` +
                `Route: ${route}\n` +
                `Current Booking: ${actual}%\n` +
                `Forecast: ${forecast}%\n\n` +
                `This route is FULLY BOOKED for the holiday period.\n` +
                `2,847 customers unable to book.\n` +
                `Potential revenue loss: $847,000\n\n` +
                `Would you like to add capacity to this route?`,
                {
                    title: "Route Capacity Alert",
                    actions: ["Add Flights", "View Analytics", MessageBox.Action.CLOSE],
                    emphasizedAction: "Add Flights",
                    onClose: (sAction) => {
                        if (sAction === "Add Flights") {
                            this._addFlightsToRoute(route, actual, forecast);
                        } else if (sAction === "View Analytics") {
                            this.onOpenJoule();
                            setTimeout(() => {
                                this.byId("jouleInput").setValue("analyze demand forecast");
                            }, 1000);
                        }
                    }
                }
            );
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
                    },
                    aircraftInService: 6
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
            
            // Add selectedFlight property for enabling edit/delete buttons
            oViewModel.setProperty("/selectedFlight", null);
            
            this.getView().setModel(oViewModel);
            console.log("✅ View model set");
            
            // Add model change listener to detect what's causing updates
            oViewModel.attachPropertyChange(function(oEvent) {
                console.warn("🔄 Model property changed:", oEvent.getParameter("path"), "->", oEvent.getParameter("value"));
                console.trace("Stack trace for model change:");
            });
        },

        _loadMockData: function () {
            console.log("📝 Loading mock data from SAP services...");
            const oModel = this.getView().getModel();
            
            // Simulate loading from multiple SAP services
            this._simulateSAPServiceIntegration();
            
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
                },
                {
                    flightNumber: "SL005",
                    origin: "DFW",
                    destination: "MIA",
                    status: "grounded",
                    gate: "M1",
                    passengerCount: 0,
                    aircraft: "A320-200",
                    issue: "Engine maintenance required",
                    canScheduleMaintenance: true
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

        _simulateSAPServiceIntegration: function () {
            console.log("🔄 Simulating SAP Service Integration...");
            
            // Simulate SAP Datasphere connection
            this._simulateDatasphereFetch();
            
            // Simulate S/4HANA backend calls
            this._simulateS4HANAIntegration();
            
            // Simulate SAP AI Core predictions
            this._simulateAICoreIntegration();
            
            // Simulate BTP services
            this._simulateBTPServices();
        },

        _simulateDatasphereFetch: function () {
            console.log("📊 [SAP Datasphere] Fetching aviation analytics data...");
            console.log("📊 [SAP Datasphere] Connected to: https://datasphere.eu10.hcs.cloud.sap/");
            console.log("📊 [SAP Datasphere] Query: SELECT * FROM AVIATION_METRICS WHERE date >= CURRENT_DATE - 30");
            console.log("📊 [SAP Datasphere] Retrieved 847 records from aviation data warehouse");
            console.log("📊 [SAP Datasphere] Aggregated flight performance metrics across 18 countries");
            
            // Simulate realistic delay
            setTimeout(() => {
                console.log("✅ [SAP Datasphere] Data warehouse query completed successfully");
            }, 1200);
        },

        _simulateS4HANAIntegration: function () {
            console.log("🏢 [S/4HANA] Connecting to flight operations backend...");
            console.log("🏢 [S/4HANA] Endpoint: https://skylink-s4hana.sap-system.com/sap/opu/odata/sap/");
            console.log("🏢 [S/4HANA] Fetching real-time flight data from modules:");
            console.log("🏢 [S/4HANA]   ├─ MM (Materials Management) - Aircraft parts inventory");
            console.log("🏢 [S/4HANA]   ├─ PM (Plant Maintenance) - Aircraft maintenance schedules");
            console.log("🏢 [S/4HANA]   ├─ SD (Sales & Distribution) - Flight bookings & revenue");
            console.log("🏢 [S/4HANA]   └─ FI (Financial Accounting) - Cost center analysis");
            
            setTimeout(() => {
                console.log("✅ [S/4HANA] Retrieved operational data for 156 flights");
                console.log("✅ [S/4HANA] Maintenance schedules synchronized for 24 aircraft");
            }, 800);
        },

        _simulateAICoreIntegration: function () {
            console.log("🤖 [SAP AI Core] Initializing predictive analytics...");
            console.log("🤖 [SAP AI Core] Model: aviation-demand-forecast-v2.1");
            console.log("🤖 [SAP AI Core] Processing features: weather, seasonal trends, booking patterns");
            console.log("🤖 [SAP AI Core] Running inference on 847 data points...");
            
            setTimeout(() => {
                console.log("✅ [SAP AI Core] Generated demand forecasts with 94.2% accuracy");
                console.log("✅ [SAP AI Core] Identified 12 routes with high growth potential");
                console.log("✅ [SAP AI Core] Anomaly detection: 3 routes flagged for review");
            }, 1500);
        },

        _simulateBTPServices: function () {
            console.log("☁️ [SAP BTP] Orchestrating microservices...");
            console.log("☁️ [SAP BTP] Services active:");
            console.log("☁️ [SAP BTP]   ├─ Connectivity Service - Secure S/4HANA tunnel");
            console.log("☁️ [SAP BTP]   ├─ Destination Service - Managing 8 backend connections");
            console.log("☁️ [SAP BTP]   ├─ Authorization Service - RBAC for 156 users");
            console.log("☁️ [SAP BTP]   ├─ Application Logging - Collecting telemetry data");
            console.log("☁️ [SAP BTP]   └─ Alert Notification - Real-time monitoring active");
            
            setTimeout(() => {
                console.log("✅ [SAP BTP] All microservices healthy and operational");
                console.log("✅ [SAP BTP] Auto-scaling: 3 instances running (CPU: 65%)");
            }, 600);
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

        _addFlightsToRoute: function (sRoute, nActual, nForecast) {
            const oModel = this.getView().getModel();
            const aFlights = oModel.getProperty("/flights") || [];
            
            // Parse route to get origin and destination (handle both → and →)
            let aRouteParts = sRoute.split("→");
            if (aRouteParts.length !== 2) {
                aRouteParts = sRoute.split(" → ");
            }
            if (aRouteParts.length !== 2) {
                MessageToast.show(`❌ Unable to parse route format: "${sRoute}"`);
                return;
            }
            
            const sOrigin = aRouteParts[0];
            const sDestination = aRouteParts[1];
            
            // Generate new flight numbers
            const aNewFlights = [];
            const iExistingFlights = aFlights.length;
            
            // Add 2 additional flights to meet demand
            for (let i = 1; i <= 2; i++) {
                const sFlightNumber = `SL${String(iExistingFlights + 5 + i).padStart(3, '0')}`;
                const oNewFlight = {
                    flightNumber: sFlightNumber,
                    origin: sOrigin,
                    destination: sDestination,
                    status: "scheduled",
                    gate: this._generateGate(),
                    passengerCount: this._calculatePassengerCount(),
                    aircraft: this._getAircraftType(),
                    isNewlyAdded: true
                };
                aNewFlights.push(oNewFlight);
            }
            
            // Add new flights to the model
            const aUpdatedFlights = [...aFlights, ...aNewFlights];
            oModel.setProperty("/flights", aUpdatedFlights);
            
            // Show success message
            MessageBox.success(
                `✅ Capacity Added Successfully!\n\n` +
                `Route: ${sRoute}\n` +
                `Flights Added: ${aNewFlights.length}\n` +
                `New Flight Numbers: ${aNewFlights.map(f => f.flightNumber).join(", ")}\n\n` +
                `📊 Estimated Impact:\n` +
                `• Additional capacity: ${aNewFlights.length * 180} passengers\n` +
                `• Revenue potential: $${(aNewFlights.length * 180 * 450).toLocaleString()}\n` +
                `• Load factor improvement: +${Math.round((nForecast - nActual) / 2)}%\n\n` +
                `All flights have been added to the Flight Operations table and are ready for booking.`,
                {
                    title: "Flights Added Successfully"
                }
            );
            
            // Highlight new flights in the table
            setTimeout(() => {
                this._highlightNewFlights(aNewFlights.map(f => f.flightNumber));
            }, 1000);
        },
        
        _generateGate: function () {
            const aGates = ["A15", "A16", "B25", "B26", "C16", "C17", "D9", "D10"];
            return aGates[Math.floor(Math.random() * aGates.length)];
        },
        
        _calculatePassengerCount: function () {
            // Random passenger count between 120-200 for new flights
            return Math.floor(Math.random() * 80) + 120;
        },
        
        _getAircraftType: function () {
            const aAircraftTypes = ["A320-200", "B737-800", "A321-200"];
            return aAircraftTypes[Math.floor(Math.random() * aAircraftTypes.length)];
        },
        
        _highlightNewFlights: function (aFlightNumbers) {
            MessageToast.show(`🟢 ${aFlightNumbers.length} new flights added to Flight Operations table!`);
        },

        onOpenJoule: async function () {
            console.log("🤖 Opening Joule dialog...");
            
            try {
                // Create Joule dialog
                if (!this._jouleDialog) {
                    console.log("📋 Loading Joule fragment...");
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
                    console.log("✅ Joule dialog created successfully");
                }
                
                // Clear messages 
                this._jouleDialog.getModel("joule").setProperty("/messages", []);
                
                console.log("🚀 Opening Joule dialog...");
                this._jouleDialog.open();
                
            } catch (error) {
                console.error("❌ Error opening Joule dialog:", error);
                MessageBox.error("Failed to open Joule assistant: " + error.message);
            }
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
            
            oJouleModel.setProperty("/messages", aMessages);
            
            // Add AI response with typing delay
            setTimeout(() => {
                const aiResponse = this._getJouleResponse(sQuery);
                aMessages.push({
                    type: "assistant", 
                    text: aiResponse,
                    timestamp: new Date()
                });
                
                oJouleModel.setProperty("/messages", aMessages);
                
                // Scroll to bottom
                setTimeout(() => {
                    const oChatScrollContainer = this.byId("chatScrollContainer");
                    if (oChatScrollContainer) {
                        const oDomRef = oChatScrollContainer.getDomRef("scroll");
                        if (oDomRef) {
                            oDomRef.scrollTop = oDomRef.scrollHeight;
                        }
                    }
                }, 100);
            }, 800);
            
            // Clear input
            this.byId("jouleInput").setValue("");
        },

        _getJouleResponse: function (query) {
            const lowerQuery = query.toLowerCase();
            
            // Demand forecast analysis
            if (lowerQuery.includes("demand") || lowerQuery.includes("forecast") || lowerQuery.includes("analyze") || lowerQuery.includes("analysis")) {
                return "📊 SAP AI Core Demand Forecast Analysis:\n\n🔍 Critical Findings:\n• JFK→LAX: 98% booked (3 months out) - CRITICAL\n• ORD→NRT: 97% booked - HIGH ALERT\n• LAX→LHR: 93% booked - WARNING\n• MIA→FRA: 69% booked - NORMAL\n\n📈 Holiday Season Pattern Detection:\n• Peak period: Dec 18-26 (+44% vs last year)\n• Affected routes: 6 of 8 major routes\n• Unmet demand: 2,847 searches, 94% abandonment\n• Lost revenue potential: $2.4M\n\n🤖 AI Core Recommendations:\n1. Immediate capacity increase on 3 routes\n2. Deploy wide-body aircraft (B777/A350)\n3. Dynamic pricing adjustment (+47% premium)\n4. Open additional booking classes\n\n💰 Business Impact if Implemented:\n• Additional capacity: 3,200 seats\n• Revenue opportunity: $4.1M\n• Customer satisfaction: +28 NPS points\n\nWould you like me to generate a capacity scaling plan?";
            } else if (lowerQuery.includes("christmas") || lowerQuery.includes("holiday") || lowerQuery.includes("peak")) {
                return "🎄 Holiday Demand Surge Analysis:\n\n📊 SAP Datasphere Insights:\n• Historical baseline: 68% capacity (Dec average)\n• Current forecast: 94% capacity (+38% YoY)\n• Booking velocity: 847 requests/day\n• Conversion rate: 1.4% (critically low)\n\n⚠️ Routes at Risk:\n1. JFK→LAX: 98% full (top family route)\n2. ORD→NRT: 97% full (business travel)\n3. LAX→LHR: 93% full (international)\n\n💡 Root Cause Analysis:\n• Unexpected post-pandemic surge\n• Reduced fleet from 2020 cuts\n• Competitor capacity constraints\n• Price sensitivity decreased 23%\n\n📈 Action Plan:\n• Add 12 flights across peak dates\n• $4.8M revenue opportunity\n• Prevents customer churn to competitors";
            } else if (lowerQuery.includes("add flight") || lowerQuery.includes("increase capacity") || lowerQuery.includes("scale") || lowerQuery.includes("scaling plan")) {
                return "✈️ Capacity Scaling Plan - READY FOR EXECUTION:\n\n🎯 SAP S/4HANA Flight Creation:\n• Route 1: JFK→LAX (3 additional flights)\n  - Dec 21: SL901 (B777-300ER, 396 seats)\n  - Dec 22: SL902 (B777-300ER, 396 seats)\n  - Dec 23: SL903 (B777-300ER, 396 seats)\n\n• Route 2: ORD→NRT (2 additional flights)\n  - Dec 20: SL904 (B787-9, 296 seats)\n  - Dec 24: SL905 (B787-9, 296 seats)\n\n📊 Projected Impact:\n• Total new capacity: 1,880 seats\n• Load factor target: 92%\n• Revenue forecast: +$3.2M\n• Operational cost: $1.4M\n• Net profit: $1.8M\n\n✅ Ready to execute in S/4HANA?\nType 'confirm' to create flights in SD module.";
            } else if (lowerQuery.includes("delay")) {
                return "🚨 Based on S/4HANA real-time data: SL001 (JFK → LAX) delayed by 15 minutes due to air traffic congestion. SAP AI Core recommends rebooking 12 passengers to SL006 evening flight to minimize disruption.";
            } else if (lowerQuery.includes("maintenance")) {
                return "🔧 From S/4HANA PM module:\n• SL-A321-01: Routine A-check tomorrow (4 hours)\n• SL-B737-01: Heavy D-check next week (168 hours)\n\nSAP AI Core prediction: Schedule A321 maintenance during 02:00-06:00 window for optimal cost efficiency.";
            } else if (lowerQuery.includes("performance") || lowerQuery.includes("metrics")) {
                return "📊 Live metrics from SAP Datasphere:\n• On-Time: 82.5% (Target: 90%)\n• Fleet Utilization: 78.3% (Target: 75%)\n• Revenue: $2.45M (Target: $2.3M)\n\nS/4HANA FI analysis shows 3.3% utilization excess = $127K additional monthly revenue!";
            } else if (lowerQuery.includes("optimize")) {
                return "🎯 SAP AI Core optimization recommendations:\n1. Move SL005 30min earlier to avoid DFW congestion (+$4,200 revenue)\n2. Swap SL012 to A321neo for 8% fuel savings\n3. Consolidate ground crews to save $1,800/day\n\nBTP analytics predict 12% efficiency increase from these changes.";
            } else if (lowerQuery.includes("confirm")) {
                return "✅ Flight Creation Confirmed in S/4HANA:\n\n📋 Created in SD Module:\n• SL901-903: JFK→LAX (1,188 seats)\n• SL904-905: ORD→NRT (592 seats)\n\n💾 System Updates:\n• Inventory: Aircraft allocated\n• Crew: Assignments pending\n• Gates: Reserved at terminals\n• Pricing: Dynamic rates active\n\n📊 Booking System Status:\n• JFK→LAX: 98% → 72% (AVAILABLE)\n• ORD→NRT: 97% → 81% (AVAILABLE)\n\n🎯 Next Steps:\n• Marketing campaign launched\n• Customer notifications sent\n• Revenue tracking enabled\n\nBooking portal updated. Customers can now purchase tickets!";
            } else if (lowerQuery.includes("sap") || lowerQuery.includes("service") || lowerQuery.includes("system")) {
                return "🏢 SAP Services Integration Status:\n✅ S/4HANA: Connected (156 flights monitored)\n✅ SAP Datasphere: Active (847 records processed)\n✅ SAP AI Core: Running (aviation-demand-forecast-v2.1)\n✅ SAP BTP: 3 instances healthy (CPU: 65%)\n\nAll systems operational with real-time data synchronization.";
            } else {
                return "I'm powered by SAP's intelligent suite and can help you with:\n• Demand forecast analysis\n• Holiday capacity planning\n• Flight performance metrics\n• Predictive maintenance\n• Revenue optimization\n• System status monitoring\n\nTry asking: 'Analyze my demand forecast' or 'Show holiday demand'";
            }
        },

        onSuggestedQuery: function (oEvent) {
            let sQuery = oEvent.getSource().getText();
            
            // Clean up button text and convert to queries
            if (sQuery.includes("Analyze Demand Forecast")) {
                sQuery = "Analyze my demand forecast";
            } else if (sQuery.includes("Add Christmas Flights")) {
                sQuery = "Add more flights for Christmas";
            } else if (sQuery.includes("Show Performance Metrics")) {
                sQuery = "Show flight performance metrics";
            } else if (sQuery.includes("Optimize Capacity")) {
                sQuery = "How can I optimize capacity?";
            }
            
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
                "cancelled": "Error",
                "grounded": "Error",
                "maintenance_scheduled": "Warning"
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
                // Show current day with holiday peak approaching
                forecastData = [
                    { 
                        route: "JFK→LAX", aircraft: "A321", forecastValue: 85, actualValue: 82, variance: -3, trend: "down",
                        trendPoints: [
                            { x: 0, y: 78 }, { x: 4, y: 81 }, { x: 8, y: 85 }, { x: 12, y: 83 }, { x: 16, y: 82 }, { x: 20, y: 84 }, { x: 24, y: 82 }
                        ],
                        bookingStatus: "available", holidayDemand: "moderate"
                    },
                    { 
                        route: "LAX→ORD", aircraft: "B737", forecastValue: 78, actualValue: 85, variance: 7, trend: "up",
                        trendPoints: [
                            { x: 0, y: 74 }, { x: 4, y: 76 }, { x: 8, y: 78 }, { x: 12, y: 82 }, { x: 16, y: 84 }, { x: 20, y: 85 }, { x: 24, y: 85 }
                        ]
                    },
                    { 
                        route: "ORD→JFK", aircraft: "A320", forecastValue: 92, actualValue: 89, variance: -3, trend: "stable",
                        trendPoints: [
                            { x: 0, y: 88 }, { x: 4, y: 90 }, { x: 8, y: 92 }, { x: 12, y: 91 }, { x: 16, y: 89 }, { x: 20, y: 90 }, { x: 24, y: 89 }
                        ]
                    },
                    { 
                        route: "MIA→LAX", aircraft: "B777", forecastValue: 88, actualValue: 91, variance: 3, trend: "up",
                        trendPoints: [
                            { x: 0, y: 85 }, { x: 4, y: 87 }, { x: 8, y: 88 }, { x: 12, y: 89 }, { x: 16, y: 90 }, { x: 20, y: 91 }, { x: 24, y: 91 }
                        ]
                    },
                    { 
                        route: "DEN→JFK", aircraft: "A321", forecastValue: 76, actualValue: 72, variance: -4, trend: "down",
                        trendPoints: [
                            { x: 0, y: 75 }, { x: 4, y: 76 }, { x: 8, y: 76 }, { x: 12, y: 74 }, { x: 16, y: 73 }, { x: 20, y: 72 }, { x: 24, y: 72 }
                        ]
                    },
                    { 
                        route: "LAX→MIA", aircraft: "B737", forecastValue: 83, actualValue: 87, variance: 4, trend: "up",
                        trendPoints: [
                            { x: 0, y: 80 }, { x: 4, y: 82 }, { x: 8, y: 83 }, { x: 12, y: 85 }, { x: 16, y: 86 }, { x: 20, y: 87 }, { x: 24, y: 87 }
                        ]
                    }
                ];
            } else if (period === "1M") {
                forecastData = [
                    { 
                        route: "JFK→LAX", aircraft: "A321", forecastValue: 82, actualValue: 85, variance: 3, trend: "up",
                        trendPoints: [
                            { x: 0, y: 79 }, { x: 5, y: 81 }, { x: 10, y: 82 }, { x: 15, y: 83 }, { x: 20, y: 84 }, { x: 25, y: 85 }, { x: 30, y: 85 }
                        ]
                    },
                    { 
                        route: "LAX→LHR", aircraft: "B777", forecastValue: 89, actualValue: 82, variance: -7, trend: "down",
                        trendPoints: [
                            { x: 0, y: 87 }, { x: 5, y: 88 }, { x: 10, y: 89 }, { x: 15, y: 86 }, { x: 20, y: 84 }, { x: 25, y: 82 }, { x: 30, y: 82 }
                        ]
                    },
                    { 
                        route: "ORD→NRT", aircraft: "B787", forecastValue: 91, actualValue: 94, variance: 3, trend: "up",
                        trendPoints: [
                            { x: 0, y: 89 }, { x: 5, y: 90 }, { x: 10, y: 91 }, { x: 15, y: 92 }, { x: 20, y: 93 }, { x: 25, y: 94 }, { x: 30, y: 94 }
                        ]
                    },
                    { 
                        route: "MIA→FRA", aircraft: "A330", forecastValue: 78, actualValue: 71, variance: -7, trend: "down",
                        trendPoints: [
                            { x: 0, y: 76 }, { x: 5, y: 77 }, { x: 10, y: 78 }, { x: 15, y: 75 }, { x: 20, y: 73 }, { x: 25, y: 71 }, { x: 30, y: 71 }
                        ]
                    },
                    { 
                        route: "LAX→SIN", aircraft: "A350", forecastValue: 85, actualValue: 89, variance: 4, trend: "up",
                        trendPoints: [
                            { x: 0, y: 82 }, { x: 5, y: 84 }, { x: 10, y: 85 }, { x: 15, y: 87 }, { x: 20, y: 88 }, { x: 25, y: 89 }, { x: 30, y: 89 }
                        ]
                    },
                    { 
                        route: "JFK→CDG", aircraft: "B777", forecastValue: 87, actualValue: 83, variance: -4, trend: "stable",
                        trendPoints: [
                            { x: 0, y: 85 }, { x: 5, y: 86 }, { x: 10, y: 87 }, { x: 15, y: 85 }, { x: 20, y: 84 }, { x: 25, y: 83 }, { x: 30, y: 83 }
                        ]
                    },
                    { 
                        route: "ORD→DXB", aircraft: "B787", forecastValue: 93, actualValue: 96, variance: 3, trend: "up",
                        trendPoints: [
                            { x: 0, y: 91 }, { x: 5, y: 92 }, { x: 10, y: 93 }, { x: 15, y: 94 }, { x: 20, y: 95 }, { x: 25, y: 96 }, { x: 30, y: 96 }
                        ]
                    },
                    { 
                        route: "DEN→ICN", aircraft: "A330", forecastValue: 79, actualValue: 84, variance: 5, trend: "up",
                        trendPoints: [
                            { x: 0, y: 77 }, { x: 5, y: 78 }, { x: 10, y: 79 }, { x: 15, y: 81 }, { x: 20, y: 83 }, { x: 25, y: 84 }, { x: 30, y: 84 }
                        ]
                    }
                ];
            } else { // 6M - Shows Christmas surge pattern
                forecastData = [
                    { 
                        route: "JFK→LAX", aircraft: "A321", forecastValue: 96, actualValue: 98, variance: 2, trend: "up",
                        trendPoints: [
                            { x: 0, y: 80 }, { x: 30, y: 82 }, { x: 60, y: 84 }, { x: 90, y: 86 }, { x: 120, y: 92 }, { x: 150, y: 96 }, { x: 180, y: 98 }
                        ],
                        bookingStatus: "full", holidayDemand: "critical", 
                        alert: "Christmas capacity exceeded - Anna's route!"
                    },
                    { 
                        route: "LAX→LHR", aircraft: "B777", forecastValue: 94, actualValue: 93, variance: -1, trend: "stable",
                        trendPoints: [
                            { x: 0, y: 85 }, { x: 30, y: 87 }, { x: 60, y: 88 }, { x: 90, y: 90 }, { x: 120, y: 92 }, { x: 150, y: 93 }, { x: 180, y: 93 }
                        ],
                        bookingStatus: "limited", holidayDemand: "high"
                    },
                    { 
                        route: "ORD→NRT", aircraft: "B787", forecastValue: 95, actualValue: 97, variance: 2, trend: "up",
                        trendPoints: [
                            { x: 0, y: 87 }, { x: 30, y: 89 }, { x: 60, y: 90 }, { x: 90, y: 92 }, { x: 120, y: 95 }, { x: 150, y: 97 }, { x: 180, y: 97 }
                        ],
                        bookingStatus: "full", holidayDemand: "critical",
                        alert: "Holiday capacity alert!"
                    },
                    { 
                        route: "MIA→FRA", aircraft: "A330", forecastValue: 77, actualValue: 69, variance: -8, trend: "down",
                        trendPoints: [
                            { x: 0, y: 74 }, { x: 30, y: 76 }, { x: 60, y: 77 }, { x: 90, y: 73 }, { x: 120, y: 71 }, { x: 150, y: 69 }, { x: 180, y: 69 }
                        ]
                    },
                    { 
                        route: "LAX→SIN", aircraft: "A350", forecastValue: 86, actualValue: 91, variance: 5, trend: "up",
                        trendPoints: [
                            { x: 0, y: 83 }, { x: 30, y: 85 }, { x: 60, y: 86 }, { x: 90, y: 88 }, { x: 120, y: 90 }, { x: 150, y: 91 }, { x: 180, y: 91 }
                        ]
                    },
                    { 
                        route: "JFK→CDG", aircraft: "B777", forecastValue: 85, actualValue: 81, variance: -4, trend: "stable",
                        trendPoints: [
                            { x: 0, y: 83 }, { x: 30, y: 84 }, { x: 60, y: 85 }, { x: 90, y: 83 }, { x: 120, y: 82 }, { x: 150, y: 81 }, { x: 180, y: 81 }
                        ]
                    },
                    { 
                        route: "ORD→DXB", aircraft: "B787", forecastValue: 92, actualValue: 97, variance: 5, trend: "up",
                        trendPoints: [
                            { x: 0, y: 89 }, { x: 30, y: 91 }, { x: 60, y: 92 }, { x: 90, y: 94 }, { x: 120, y: 96 }, { x: 150, y: 97 }, { x: 180, y: 97 }
                        ]
                    },
                    { 
                        route: "DEN→ICN", aircraft: "A330", forecastValue: 80, actualValue: 86, variance: 6, trend: "up",
                        trendPoints: [
                            { x: 0, y: 78 }, { x: 30, y: 79 }, { x: 60, y: 80 }, { x: 90, y: 83 }, { x: 120, y: 85 }, { x: 150, y: 86 }, { x: 180, y: 86 }
                        ]
                    },
                    { 
                        route: "LAX→HKG", aircraft: "A350", forecastValue: 89, actualValue: 83, variance: -6, trend: "down",
                        trendPoints: [
                            { x: 0, y: 87 }, { x: 30, y: 88 }, { x: 60, y: 89 }, { x: 90, y: 86 }, { x: 120, y: 84 }, { x: 150, y: 83 }, { x: 180, y: 83 }
                        ]
                    },
                    { 
                        route: "JFK→DOH", aircraft: "B777", forecastValue: 91, actualValue: 94, variance: 3, trend: "stable",
                        trendPoints: [
                            { x: 0, y: 89 }, { x: 30, y: 90 }, { x: 60, y: 91 }, { x: 90, y: 92 }, { x: 120, y: 93 }, { x: 150, y: 94 }, { x: 180, y: 94 }
                        ]
                    }
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

            console.log("🎨 Creating clean vertical bar chart for:", forecastData.length, "routes");

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

                // Trend indicator color
                let trendColor = "#6b7280";
                if (routeData.trend === "up") trendColor = "#22c55e";
                else if (routeData.trend === "down") trendColor = "#dc2626";

                chartHTML += `
                    <div style="
                        display: inline-flex;
                        flex-direction: column;
                        align-items: center;
                        margin: 0 20px;
                        position: relative;
                        height: 420px;
                        justify-content: flex-end;
                        min-width: 90px;
                    ">
                        <!-- Route Label with Alert -->
                        <div style="
                            position: absolute;
                            top: 0;
                            font-size: 12px;
                            font-weight: bold;
                            text-align: center;
                            width: 110px;
                            left: 50%;
                            transform: translateX(-50%);
                            color: #374151;
                            line-height: 1.2;
                        ">
                            ${routeData.route}
                            ${routeData.alert ? `<div style="
                                position: absolute;
                                top: -15px;
                                right: -10px;
                                background: #dc2626;
                                color: white;
                                border-radius: 50%;
                                width: 16px;
                                height: 16px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 10px;
                                font-weight: bold;
                                animation: pulse 2s infinite;
                                cursor: pointer;
                            " title="${routeData.alert}">!</div>` : ''}
                        </div>
                        
                        <!-- Aircraft Label -->
                        <div style="
                            position: absolute;
                            top: 22px;
                            font-size: 10px;
                            text-align: center;
                            width: 110px;
                            left: 50%;
                            transform: translateX(-50%);
                            color: #6b7280;
                        ">${routeData.aircraft}</div>
                        
                        <!-- Trend Indicator -->
                        <div style="
                            position: absolute;
                            top: 45px;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 18px;
                            height: 18px;
                            background: ${trendColor};
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 9px;
                            color: white;
                            font-weight: bold;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        ">${routeData.trend === 'up' ? '↗' : routeData.trend === 'down' ? '↘' : '→'}</div>
                        
                        <!-- Bars Container -->
                        <div style="
                            display: flex;
                            align-items: flex-end;
                            gap: 8px;
                            margin-top: 75px;
                            position: relative;
                        ">
                            <!-- Forecast Bar -->
                            <div style="
                                width: 30px;
                                height: ${forecastHeight}px;
                                background: linear-gradient(to top, #3b82f6, #60a5fa);
                                border: 2px solid ${borderColor};
                                border-radius: 4px 4px 0 0;
                                position: relative;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                            "
                            onmouseover="this.style.transform='scale(1.05)'; this.style.zIndex='10'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.zIndex='1'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)';"
                            onclick="${routeData.bookingStatus === 'full' ? `window.showRouteAlert('${routeData.route}', '${routeData.forecastValue}', '${routeData.actualValue}')` : ''}"
                            title="Forecast: ${routeData.forecastValue}% | Trend: ${routeData.trend} ${routeData.bookingStatus === 'full' ? '| CLICK FOR DETAILS' : ''}">
                                <!-- Forecast Percentage -->
                                <div style="
                                    position: absolute;
                                    top: -35px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    font-size: 10px;
                                    font-weight: bold;
                                    color: #3b82f6;
                                    white-space: nowrap;
                                    background: rgba(255,255,255,0.9);
                                    padding: 2px 4px;
                                    border-radius: 3px;
                                    border: 1px solid #e5e7eb;
                                ">${routeData.forecastValue}%</div>
                            </div>
                            
                            <!-- Actual Bar -->
                            <div style="
                                width: 30px;
                                height: ${actualHeight}px;
                                background: linear-gradient(to top, #22c55e, #4ade80);
                                border: 2px solid ${borderColor};
                                border-radius: 4px 4px 0 0;
                                position: relative;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                            "
                            onmouseover="this.style.transform='scale(1.05)'; this.style.zIndex='10'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.zIndex='1'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)';"
                            title="Actual: ${routeData.actualValue}% | Trend: ${routeData.trend}">
                                <!-- Actual Percentage -->
                                <div style="
                                    position: absolute;
                                    top: -35px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    font-size: 10px;
                                    font-weight: bold;
                                    color: #22c55e;
                                    white-space: nowrap;
                                    background: rgba(255,255,255,0.9);
                                    padding: 2px 4px;
                                    border-radius: 3px;
                                    border: 1px solid #e5e7eb;
                                ">${routeData.actualValue}%</div>
                            </div>
                        </div>
                        
                        <!-- Variance Indicator -->
                        <div style="
                            margin-top: 15px;
                            font-size: 11px;
                            font-weight: bold;
                            color: ${borderColor};
                            text-align: center;
                            background: rgba(255,255,255,0.9);
                            padding: 3px 6px;
                            border-radius: 4px;
                            border: 1px solid ${borderColor};
                        ">${routeData.variance > 0 ? '+' : ''}${routeData.variance}%</div>
                        
                        <!-- Booking Status for Anna's Story -->
                        ${routeData.bookingStatus ? `
                        <div style="
                            margin-top: 8px;
                            font-size: 10px;
                            font-weight: bold;
                            text-align: center;
                            padding: 2px 8px;
                            border-radius: 12px;
                            background: ${routeData.bookingStatus === 'full' ? '#dc2626' : routeData.bookingStatus === 'limited' ? '#f59e0b' : '#22c55e'};
                            color: white;
                        ">
                            ${routeData.bookingStatus === 'full' ? '❌ FULLY BOOKED' : routeData.bookingStatus === 'limited' ? '⚠️ LIMITED' : '✓ AVAILABLE'}
                        </div>` : ''}
                    </div>
                `;
            });

            return `
                <div style="
                    display: flex; 
                    align-items: flex-end; 
                    justify-content: center;
                    padding: 40px 30px 30px 30px; 
                    width: 100%;
                    max-width: ${forecastData.length * 140}px;
                    margin: 0 auto;
                    background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    position: relative;
                ">
                    <!-- Chart Legend -->
                    <div style="
                        position: absolute;
                        top: 15px;
                        left: 30px;
                        display: flex;
                        gap: 20px;
                        font-size: 12px;
                        color: #6b7280;
                    ">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <div style="width: 16px; height: 3px; background: #3b82f6; border-radius: 2px;"></div>
                            <span>Forecast</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <div style="width: 16px; height: 3px; background: #22c55e; border-radius: 2px;"></div>
                            <span>Actual</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <div style="width: 16px; height: 16px; background: #6b7280; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 8px;">↗</div>
                            <span>Trend</span>
                        </div>
                    </div>
                    
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
                // Set selected flight for enabling edit/delete buttons
                this.getView().getModel().setProperty("/selectedFlight", oContext.getObject());
                
                const oTable = this.byId("flightTable");
                oTable.setSelectedItem(oItem);
                
                MessageToast.show("Selected flight: " + oContext.getProperty("flightNumber"));
            }
        },

        onAddFlight: function () {
            MessageBox.information(
                "✈️ Add New Flight - SAP S/4HANA SD Module\n\n" +
                "Flight Details Form:\n" +
                "📋 Flight Number: [SL001-SL999]\n" +
                "🛫 Origin Airport: [3-letter code]\n" +
                "🛬 Destination Airport: [3-letter code]\n" +
                "📅 Departure Date/Time: [YYYY-MM-DD HH:MM]\n" +
                "🎫 Aircraft Type: [B737/A321/B777]\n" +
                "🚪 Gate Assignment: [Auto-assigned]\n" +
                "👥 Passenger Capacity: [Auto-populated]\n\n" +
                "🔍 System Validations:\n" +
                "• Route existence check ✅\n" +
                "• Aircraft availability ✅\n" +
                "• Crew scheduling ✅\n" +
                "• Gate availability ✅",
                {
                    title: "Create New Flight",
                    actions: ["Create SL015 JFK→DFW", "Choose Different Route", MessageBox.Action.CLOSE],
                    emphasizedAction: "Create SL015 JFK→DFW",
                    onClose: (sAction) => {
                        if (sAction === "Create SL015 JFK→DFW") {
                            this._createNewFlight();
                        }
                    }
                }
            );
        },

        _createNewFlight: function () {
            const oModel = this.getView().getModel();
            const aFlights = oModel.getProperty("/flights");
            
            const oNewFlight = {
                flightNumber: "SL015",
                origin: "JFK",
                destination: "DFW",
                status: "Scheduled",
                gate: "A12",
                passengerCount: "0/180",
                departureTime: "14:30",
                arrivalTime: "17:45",
                aircraft: "Boeing 737-800"
            };
            
            aFlights.push(oNewFlight);
            oModel.setProperty("/flights", aFlights);
            
            MessageBox.success(
                "✅ Flight Created Successfully!\n\n" +
                "Flight SL015 (JFK → DFW) has been added to:\n" +
                "• S/4HANA SD Module ✅\n" +
                "• Flight scheduling system ✅\n" +
                "• Gate management system ✅\n" +
                "• Crew assignment pending ⏳\n\n" +
                "📊 Real-time updates:\n" +
                "• Total flights: " + aFlights.length + "\n" +
                "• Booking system: Active\n" +
                "• Revenue tracking: Enabled",
                {
                    title: "Flight Creation Confirmed",
                    actions: ["View Flight", "Add Another", MessageBox.Action.CLOSE]
                }
            );
        },

        onEditFlight: function () {
            const oSelectedFlight = this.getView().getModel().getProperty("/selectedFlight");
            if (!oSelectedFlight) {
                MessageToast.show("Please select a flight to edit");
                return;
            }

            MessageBox.information(
                `✏️ Edit Flight ${oSelectedFlight.flightNumber}\n\n` +
                `Current Details:\n` +
                `• Route: ${oSelectedFlight.origin} → ${oSelectedFlight.destination}\n` +
                `• Status: ${oSelectedFlight.status}\n` +
                `• Gate: ${oSelectedFlight.gate}\n` +
                `• Passengers: ${oSelectedFlight.passengerCount}\n\n` +
                `Available Actions:\n` +
                `🚪 Change Gate Assignment\n` +
                `⏰ Update Departure Time\n` +
                `📊 Modify Passenger Count\n` +
                `⚠️ Change Flight Status\n\n` +
                `🔐 SAP Authorization: Flight Operations Manager`,
                {
                    title: "Edit Flight Details",
                    actions: ["Change Gate to B15", "Delay by 30min", "Update Status", MessageBox.Action.CLOSE],
                    emphasizedAction: "Change Gate to B15",
                    onClose: (sAction) => {
                        if (sAction === "Change Gate to B15") {
                            this._updateFlightGate(oSelectedFlight, "B15");
                        } else if (sAction === "Delay by 30min") {
                            this._delayFlight(oSelectedFlight, 30);
                        } else if (sAction === "Update Status") {
                            this.onUpdateFlightStatus();
                        }
                    }
                }
            );
        },

        _updateFlightGate: function (oFlight, sNewGate) {
            const oModel = this.getView().getModel();
            const aFlights = oModel.getProperty("/flights");
            
            // Find and update the flight
            const iIndex = aFlights.findIndex(f => f.flightNumber === oFlight.flightNumber);
            if (iIndex !== -1) {
                aFlights[iIndex].gate = sNewGate;
                oModel.setProperty("/flights", aFlights);
                
                MessageBox.success(
                    `✅ Gate Updated Successfully!\n\n` +
                    `Flight ${oFlight.flightNumber}:\n` +
                    `• Old Gate: ${oFlight.gate}\n` +
                    `• New Gate: ${sNewGate}\n\n` +
                    `📋 System Updates:\n` +
                    `• Passenger notifications sent ✅\n` +
                    `• Ground crew reassigned ✅\n` +
                    `• Baggage handling updated ✅\n` +
                    `• Airport displays updated ✅`,
                    {
                        title: "Gate Change Confirmed"
                    }
                );
            }
        },

        _delayFlight: function (oFlight, iDelayMinutes) {
            const oModel = this.getView().getModel();
            const aFlights = oModel.getProperty("/flights");
            
            const iIndex = aFlights.findIndex(f => f.flightNumber === oFlight.flightNumber);
            if (iIndex !== -1) {
                aFlights[iIndex].status = "Delayed";
                oModel.setProperty("/flights", aFlights);
                
                MessageBox.warning(
                    `⏰ Flight Delayed by ${iDelayMinutes} minutes\n\n` +
                    `Flight ${oFlight.flightNumber}:\n` +
                    `• Original: ${oFlight.departureTime}\n` +
                    `• New Time: ${this._addMinutes(oFlight.departureTime, iDelayMinutes)}\n\n` +
                    `📢 Automated Actions:\n` +
                    `• Passenger SMS/Email sent ✅\n` +
                    `• Connecting flights checked ✅\n` +
                    `• Catering rescheduled ✅\n` +
                    `• Slot management updated ✅`,
                    {
                        title: "Flight Delay Processed"
                    }
                );
            }
        },

        _addMinutes: function (time, minutes) {
            const [hours, mins] = time.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(mins) + minutes);
            return date.toTimeString().slice(0, 5);
        },

        onCancelFlight: function () {
            const oSelectedFlight = this.getView().getModel().getProperty("/selectedFlight");
            if (!oSelectedFlight) {
                MessageToast.show("Please select a flight to cancel");
                return;
            }

            MessageBox.warning(
                `❌ Cancel Flight ${oSelectedFlight.flightNumber}?\n\n` +
                `Route: ${oSelectedFlight.origin} → ${oSelectedFlight.destination}\n` +
                `Passengers: ${oSelectedFlight.passengerCount}\n\n` +
                `⚠️ Impact Analysis:\n` +
                `• ${oSelectedFlight.passengerCount.split('/')[0]} passengers affected\n` +
                `• Revenue loss: ~$45,000\n` +
                `• Rebooking required for all passengers\n` +
                `• Gate slot will be released\n\n` +
                `🔄 Alternative Actions:\n` +
                `• Delay instead of cancel\n` +
                `• Equipment substitution\n` +
                `• Route modification`,
                {
                    title: "Confirm Flight Cancellation",
                    actions: ["Cancel Flight", "Delay Instead", "Equipment Change", MessageBox.Action.CLOSE],
                    emphasizedAction: "Delay Instead",
                    onClose: (sAction) => {
                        if (sAction === "Cancel Flight") {
                            this._cancelFlight(oSelectedFlight);
                        } else if (sAction === "Delay Instead") {
                            this._delayFlight(oSelectedFlight, 120);
                        }
                    }
                }
            );
        },

        _cancelFlight: function (oFlight) {
            const oModel = this.getView().getModel();
            const aFlights = oModel.getProperty("/flights");
            
            const iIndex = aFlights.findIndex(f => f.flightNumber === oFlight.flightNumber);
            if (iIndex !== -1) {
                aFlights[iIndex].status = "Cancelled";
                oModel.setProperty("/flights", aFlights);
                oModel.setProperty("/selectedFlight", null);
                
                MessageBox.error(
                    `❌ Flight ${oFlight.flightNumber} Cancelled\n\n` +
                    `📋 Automated Processing:\n` +
                    `• Passenger rebooking initiated ✅\n` +
                    `• Refund processing started ✅\n` +
                    `• Crew reassignment ✅\n` +
                    `• Gate released ✅\n` +
                    `• Catering cancelled ✅\n\n` +
                    `📊 SAP Integration:\n` +
                    `• SD Module: Sales order cancelled\n` +
                    `• FI Module: Revenue adjustment\n` +
                    `• CRM: Customer communication`,
                    {
                        title: "Flight Cancellation Processed"
                    }
                );
            }
        },

        onManagePassengers: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            const oFlight = oContext.getObject();
            
            MessageBox.information(
                `👥 Passenger Management - ${oFlight.flightNumber}\n\n` +
                `Current Manifest:\n` +
                `• Booked: ${oFlight.passengerCount}\n` +
                `• Check-in: 45% completed\n` +
                `• Special requests: 3 passengers\n` +
                `• Upgrade list: 8 passengers\n\n` +
                `📊 Booking Operations:\n` +
                `🎫 Add new passenger booking\n` +
                `✏️ Modify existing reservation\n` +
                `❌ Cancel passenger booking\n` +
                `🔄 Process standby list\n` +
                `⬆️ Handle upgrade requests\n\n` +
                `💳 Revenue Impact: $89,450 total bookings`,
                {
                    title: "Passenger Operations",
                    actions: ["Add Booking", "Process Standby", "Handle Upgrades", MessageBox.Action.CLOSE],
                    emphasizedAction: "Add Booking",
                    onClose: (sAction) => {
                        if (sAction === "Add Booking") {
                            this._addPassengerBooking(oFlight);
                        } else if (sAction === "Process Standby") {
                            this._processStandbyList(oFlight);
                        } else if (sAction === "Handle Upgrades") {
                            this._processUpgrades(oFlight);
                        }
                    }
                }
            );
        },

        _addPassengerBooking: function (oFlight) {
            const oModel = this.getView().getModel();
            const aFlights = oModel.getProperty("/flights");
            
            const iIndex = aFlights.findIndex(f => f.flightNumber === oFlight.flightNumber);
            if (iIndex !== -1) {
                const [current, total] = oFlight.passengerCount.split('/');
                const newCount = parseInt(current) + 1;
                aFlights[iIndex].passengerCount = `${newCount}/${total}`;
                oModel.setProperty("/flights", aFlights);
                
                MessageBox.success(
                    `🎫 Passenger Booking Added!\n\n` +
                    `Flight: ${oFlight.flightNumber}\n` +
                    `Passenger: John Smith\n` +
                    `Seat: 12A (Economy)\n` +
                    `Fare: $245.00\n\n` +
                    `📋 Booking Confirmation:\n` +
                    `• PNR: SAP${Math.floor(Math.random() * 100000)}\n` +
                    `• Payment: Confirmed ✅\n` +
                    `• E-ticket: Sent ✅\n` +
                    `• Check-in: 24hrs before departure\n\n` +
                    `💰 Revenue Update: +$245.00`,
                    {
                        title: "Booking Confirmed"
                    }
                );
            }
        },

        _processStandbyList: function (oFlight) {
            MessageBox.information(
                `📋 Standby List Processing\n\n` +
                `Flight: ${oFlight.flightNumber}\n` +
                `Standby passengers: 5\n\n` +
                `Priority Order:\n` +
                `1. Sarah Johnson (Elite Member) ⭐\n` +
                `2. Mike Wilson (Business travel)\n` +
                `3. Emma Davis (Medical emergency)\n` +
                `4. Tom Brown (Frequent flyer)\n` +
                `5. Lisa Garcia (Regular passenger)\n\n` +
                `✅ 2 seats available for standby\n` +
                `💡 Auto-assign by priority?`,
                {
                    title: "Standby Processing",
                    actions: ["Auto-assign Top 2", "Manual Selection", MessageBox.Action.CLOSE],
                    emphasizedAction: "Auto-assign Top 2"
                }
            );
        },

        _processUpgrades: function (oFlight) {
            MessageBox.information(
                `⬆️ Upgrade Requests Processing\n\n` +
                `Flight: ${oFlight.flightNumber}\n` +
                `Business Class: 2 seats available\n\n` +
                `Upgrade List:\n` +
                `1. David Chen (Platinum Member) - $150\n` +
                `2. Anna Martinez (Gold Member) - $175\n` +
                `3. Robert Taylor (Silver Member) - $200\n\n` +
                `💰 Potential Revenue: $325\n` +
                `🎯 Member satisfaction boost\n\n` +
                `Process upgrades automatically?`,
                {
                    title: "Upgrade Management",
                    actions: ["Process All", "Select Manually", MessageBox.Action.CLOSE],
                    emphasizedAction: "Process All"
                }
            );
        },

        onUpdateFlightStatus: function (oEvent) {
            let oFlight;
            if (oEvent && oEvent.getSource && oEvent.getSource().getBindingContext) {
                oFlight = oEvent.getSource().getBindingContext().getObject();
            } else {
                oFlight = this.getView().getModel().getProperty("/selectedFlight");
            }
            
            if (!oFlight) {
                MessageToast.show("No flight selected for status update");
                return;
            }

            MessageBox.information(
                `📊 Update Flight Status - ${oFlight.flightNumber}\n\n` +
                `Current Status: ${oFlight.status}\n` +
                `Route: ${oFlight.origin} → ${oFlight.destination}\n\n` +
                `Available Status Updates:\n` +
                `✅ Boarding - Start passenger boarding\n` +
                `🛫 Departed - Flight has taken off\n` +
                `🛬 Arrived - Flight has landed\n` +
                `⏰ Delayed - Update with delay reason\n` +
                `❌ Cancelled - Cancel with rebooking\n\n` +
                `🔄 Real-time updates sent to:\n` +
                `• Passenger mobile apps\n` +
                `• Airport displays\n` +
                `• Ground operations\n` +
                `• Air traffic control`,
                {
                    title: "Status Update",
                    actions: ["Set to Boarding", "Mark Departed", "Update Delayed", MessageBox.Action.CLOSE],
                    emphasizedAction: "Set to Boarding",
                    onClose: (sAction) => {
                        if (sAction === "Set to Boarding") {
                            this._updateStatus(oFlight, "Boarding");
                        } else if (sAction === "Mark Departed") {
                            this._updateStatus(oFlight, "Departed");
                        } else if (sAction === "Update Delayed") {
                            this._updateStatus(oFlight, "Delayed");
                        }
                    }
                }
            );
        },

        _updateStatus: function (oFlight, sNewStatus) {
            const oModel = this.getView().getModel();
            const aFlights = oModel.getProperty("/flights");
            
            const iIndex = aFlights.findIndex(f => f.flightNumber === oFlight.flightNumber);
            if (iIndex !== -1) {
                aFlights[iIndex].status = sNewStatus;
                oModel.setProperty("/flights", aFlights);
                
                let statusMessage = "";
                let statusIcon = "";
                
                switch (sNewStatus) {
                    case "Boarding":
                        statusMessage = "Passenger boarding has commenced";
                        statusIcon = "✅";
                        break;
                    case "Departed":
                        statusMessage = "Flight has departed successfully";
                        statusIcon = "🛫";
                        break;
                    case "Delayed":
                        statusMessage = "Flight status updated to delayed";
                        statusIcon = "⏰";
                        break;
                }
                
                MessageBox.success(
                    `${statusIcon} Status Updated!\n\n` +
                    `Flight: ${oFlight.flightNumber}\n` +
                    `New Status: ${sNewStatus}\n` +
                    `${statusMessage}\n\n` +
                    `📢 Notifications Sent:\n` +
                    `• Passengers: SMS & App push ✅\n` +
                    `• Ground crew: Operations alert ✅\n` +
                    `• Airport systems: Display update ✅\n` +
                    `• Revenue tracking: Updated ✅`,
                    {
                        title: "Status Update Confirmed"
                    }
                );
            }
        },

        onFlightDetails: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext();
            const oFlight = oContext.getObject();
            
            MessageBox.information(
                `✈️ Flight Details - ${oFlight.flightNumber}\n\n` +
                `📋 Flight Information:\n` +
                `• Route: ${oFlight.origin} → ${oFlight.destination}\n` +
                `• Aircraft: ${oFlight.aircraft || 'Boeing 737-800'}\n` +
                `• Gate: ${oFlight.gate}\n` +
                `• Status: ${oFlight.status}\n` +
                `• Departure: ${oFlight.departureTime || '08:30'}\n` +
                `• Arrival: ${oFlight.arrivalTime || '11:45'}\n\n` +
                `👥 Passenger Details:\n` +
                `• Capacity: ${oFlight.passengerCount}\n` +
                `• Load Factor: ${Math.round((parseInt(oFlight.passengerCount.split('/')[0]) / parseInt(oFlight.passengerCount.split('/')[1])) * 100)}%\n` +
                `• Revenue: $${Math.round(parseInt(oFlight.passengerCount.split('/')[0]) * 245).toLocaleString()}\n\n` +
                `🔧 Operational Status:\n` +
                `• Fuel: Adequate ✅\n` +
                `• Catering: Loaded ✅\n` +
                `• Cleaning: Complete ✅\n` +
                `• Crew: Assigned ✅`,
                {
                    title: "Comprehensive Flight Details",
                    actions: ["View Manifest", "Check Weather", "Contact Crew", MessageBox.Action.CLOSE]
                }
            );
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
                const sTailNumber = oContext.getProperty("aircraft/tailNumber");
                const sMaintenanceType = oContext.getProperty("maintenanceType");
                
                MessageBox.information(
                    `✈️ Aircraft: ${sTailNumber}\n` +
                    `🔧 Maintenance: ${sMaintenanceType}\n` +
                    `📅 Scheduled: ${oContext.getProperty("scheduledDate")}\n` +
                    `⏱️ Est. Duration: 4-6 hours\n` +
                    `💰 Est. Cost: $12,500\n\n` +
                    `Parts Required:\n` +
                    `• Engine oil filter (x2)\n` +
                    `• Hydraulic seals (x4)\n` +
                    `• Landing gear inspection\n\n` +
                    `Technician: SAP S/4HANA PM Module`,
                    {
                        title: "Maintenance Details",
                        actions: ["View Work Order", "Reschedule", MessageBox.Action.CLOSE],
                        emphasizedAction: "View Work Order",
                        onClose: (sAction) => {
                            if (sAction === "View Work Order") {
                                MessageToast.show("🔧 Opening work order in S/4HANA PM...");
                            } else if (sAction === "Reschedule") {
                                this.onScheduleMaintenance();
                            }
                        }
                    }
                );
            }
        },

        onScheduleMaintenance: function () {
            MessageBox.information(
                "🗓️ Maintenance Scheduling System\n\n" +
                "Available Time Slots:\n" +
                "• Tomorrow 06:00-12:00 (Hangar A)\n" +
                "• Feb 15 14:00-20:00 (Hangar B) ⭐ Recommended\n" +
                "• Feb 18 08:00-16:00 (Hangar A)\n\n" +
                "📊 SAP Analytics Integration:\n" +
                "• Weather forecast: Clear skies ✅\n" +
                "• Part availability: In stock ✅\n" +
                "• Technician availability: 3/3 certified ✅\n" +
                "• Fleet impact: Minimal disruption ✅",
                {
                    title: "Schedule Maintenance",
                    actions: ["Book Feb 15 Slot", "Check Parts", MessageBox.Action.CLOSE],
                    emphasizedAction: "Book Feb 15 Slot",
                    onClose: (sAction) => {
                        if (sAction === "Book Feb 15 Slot") {
                            MessageToast.show("✅ Maintenance scheduled via S/4HANA PM - Confirmation sent!");
                        } else if (sAction === "Check Parts") {
                            this.onInventoryTilePress();
                        }
                    }
                }
            );
        },

        onScheduleMaintenanceFromFlight: function (oEvent) {
            const oSource = oEvent.getSource();
            const oBindingContext = oSource.getBindingContext();
            const oFlightData = oBindingContext.getObject();
            
            MessageBox.confirm(
                `🔧 Schedule Maintenance for Flight ${oFlightData.flightNumber}\n\n` +
                `Aircraft: ${oFlightData.aircraft}\n` +
                `Issue: ${oFlightData.issue}\n\n` +
                `📅 Proposed Schedule:\n` +
                `• Date: February 22, 2024\n` +
                `• Time: 14:00-18:00\n` +
                `• Location: Hangar B\n` +
                `• Technicians: Engine specialists assigned\n\n` +
                `This will automatically update the maintenance schedule and notify the crew.`,
                {
                    title: "Schedule Aircraft Maintenance",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: (sAction) => {
                        if (sAction === MessageBox.Action.YES) {
                            this._addMaintenanceFromFlight(oFlightData);
                        }
                    }
                }
            );
        },

        _addMaintenanceFromFlight: function (oFlightData) {
            const oModel = this.getView().getModel();
            const aMaintenanceSchedules = oModel.getProperty("/maintenanceSchedules") || [];
            
            // Create new maintenance entry
            const oNewMaintenance = {
                id: "MAINT_" + Date.now(),
                aircraft: {
                    tailNumber: oFlightData.aircraft,
                    type: "A320-200"
                },
                maintenanceType: "Engine Inspection",
                description: `Scheduled maintenance for ${oFlightData.flightNumber} - ${oFlightData.issue}`,
                scheduledDate: "2024-02-22T14:00:00",
                status: "scheduled",
                hangar: "Hangar B",
                estimatedHours: 4,
                priority: "high",
                isNewlyScheduled: true
            };
            
            // Add to maintenance schedules
            aMaintenanceSchedules.push(oNewMaintenance);
            oModel.setProperty("/maintenanceSchedules", aMaintenanceSchedules);
            
            // Update flight status
            const aFlights = oModel.getProperty("/flights") || [];
            const iFlightIndex = aFlights.findIndex(f => f.flightNumber === oFlightData.flightNumber);
            if (iFlightIndex >= 0) {
                aFlights[iFlightIndex].status = "maintenance_scheduled";
                aFlights[iFlightIndex].canScheduleMaintenance = false;
                oModel.setProperty("/flights", aFlights);
            }
            
            // Show success message
            MessageToast.show(`✅ Maintenance scheduled for ${oFlightData.flightNumber} on Feb 22nd - Added to schedule!`);
            
            // Force immediate update of the maintenance timeline
            oModel.refresh(true);
            
            // Force refresh of the maintenance timeline HTML content
            const oMaintenanceHTML = this.byId("maintenanceTimelineHTML");
            if (oMaintenanceHTML) {
                // Force re-rendering of the HTML content by refreshing the binding
                oMaintenanceHTML.getBinding("content").refresh(true);
            }
            
            // Trigger visual update for the new maintenance tile
            setTimeout(() => {
                this._highlightNewMaintenance(oNewMaintenance.id);
            }, 500);
        },

        _highlightNewMaintenance: function (sMaintenanceId) {
            // Add visual feedback for newly scheduled maintenance
            MessageToast.show("🟢 New maintenance tile added - Check the Maintenance Analytics section!");
        },

        onStartInspection: function () {
            MessageBox.information(
                "📋 Digital Inspection Checklist\n\n" +
                "✅ Pre-flight inspection protocol active\n" +
                "📱 Mobile app integration ready\n" +
                "🎯 AI-powered defect detection enabled\n\n" +
                "Inspection Items:\n" +
                "1. ✅ Engine visual inspection\n" +
                "2. ⏳ Hydraulic system pressure test\n" +
                "3. ⏳ Landing gear functionality\n" +
                "4. ⏳ Avionics system check\n" +
                "5. ⏳ Fuel system inspection\n\n" +
                "📊 Powered by SAP AI Core for predictive analysis",
                {
                    title: "Aircraft Inspection",
                    actions: ["Start Inspection", "View Checklist", MessageBox.Action.CLOSE],
                    emphasizedAction: "Start Inspection",
                    onClose: (sAction) => {
                        if (sAction === "Start Inspection") {
                            this._showInspectionProgress();
                        } else if (sAction === "View Checklist") {
                            MessageToast.show("📋 Opening digital checklist on mobile device...");
                        }
                    }
                }
            );
        },

        _showInspectionProgress: function () {
            MessageBox.success(
                "🔍 Inspection in Progress...\n\n" +
                "Current Status:\n" +
                "✅ Engine: Passed (AI confidence: 98%)\n" +
                "⏳ Hydraulics: Testing... (75% complete)\n" +
                "⏳ Landing gear: Waiting...\n" +
                "⏳ Avionics: Waiting...\n" +
                "⏳ Fuel system: Waiting...\n\n" +
                "🤖 AI detected potential issue:\n" +
                "Hydraulic pressure slightly below optimal\n" +
                "Recommendation: Schedule preventive maintenance\n\n" +
                "📊 Real-time data from SAP IoT sensors",
                {
                    title: "Inspection Progress",
                    actions: ["Continue", "Flag Issue", MessageBox.Action.CLOSE],
                    emphasizedAction: "Continue"
                }
            );
        },

        // Maintenance Analytics Functions
        onViewMaintenanceTrends: function () {
            MessageBox.information(
                "📈 Maintenance Trends Analysis (Last 6 Months)\n\n" +
                "Cost Trends:\n" +
                "• January: $98K (Base maintenance)\n" +
                "• February: $127K (+30% holiday wear)\n" +
                "• Projected March: $89K (Seasonal decrease)\n\n" +
                "📊 Key Insights from SAP Analytics:\n" +
                "• 15% increase in hydraulic issues\n" +
                "• Engine efficiency improved 8%\n" +
                "• Predictive maintenance reduced costs 22%\n" +
                "• Average turnaround time: 4.2 hours\n\n" +
                "🤖 AI Recommendations:\n" +
                "• Focus on hydraulic system upgrades\n" +
                "• Continue current engine protocols\n" +
                "• Increase inspection frequency on SL-A321-02",
                {
                    title: "Maintenance Trends",
                    actions: ["Export Report", "Set Alerts", MessageBox.Action.CLOSE],
                    emphasizedAction: "Export Report"
                }
            );
        },

        onViewCostAnalysis: function () {
            MessageBox.information(
                "💰 Maintenance Cost Analysis\n\n" +
                "Cost Breakdown (Current Month):\n" +
                "• Labor: $67.2K (53%)\n" +
                "• Parts: $38.1K (30%)\n" +
                "• Equipment: $15.3K (12%)\n" +
                "• Overhead: $6.9K (5%)\n\n" +
                "📊 Cost per Aircraft Type:\n" +
                "• Boeing 737: $28.5K avg\n" +
                "• Airbus A321: $32.1K avg\n" +
                "• Boeing 777: $66.8K avg\n\n" +
                "🎯 Budget Performance:\n" +
                "• YTD Budget: $1.2M\n" +
                "• YTD Actual: $1.08M (10% under budget)\n" +
                "• Forecast: On track for 8% savings\n\n" +
                "💡 SAP Datasphere shows potential $45K savings with optimized scheduling",
                {
                    title: "Cost Analysis",
                    actions: ["Optimize Schedule", "Budget Forecast", MessageBox.Action.CLOSE],
                    emphasizedAction: "Optimize Schedule",
                    onClose: (sAction) => {
                        if (sAction === "Optimize Schedule") {
                            MessageToast.show("🔧 Launching SAP optimization engine...");
                        }
                    }
                }
            );
        },

        onCostTilePress: function () {
            MessageBox.information(
                "💰 Monthly Cost Details: $127.5K\n\n" +
                "This Month vs Last Month:\n" +
                "• Labor costs: +$12K (overtime for holiday rush)\n" +
                "• Parts: +$8K (hydraulic seal replacements)\n" +
                "• Emergency repairs: +$5K (unscheduled)\n\n" +
                "🔍 Root Cause Analysis:\n" +
                "• High utilization during holiday season\n" +
                "• Aging hydraulic components on fleet\n" +
                "• Weather-related wear and tear\n\n" +
                "📊 SAP AI Core recommends:\n" +
                "• Proactive hydraulic system overhaul\n" +
                "• Adjust maintenance intervals for winter ops",
                {
                    title: "Cost Breakdown",
                    actions: ["View Details", "Cost Optimization", MessageBox.Action.CLOSE]
                }
            );
        },

        onDowntimeTilePress: function () {
            MessageBox.success(
                "⏱️ Aircraft Downtime: 24 hours avg\n\n" +
                "✅ Performance vs Industry:\n" +
                "• Industry average: 36 hours\n" +
                "• SkyLink average: 24 hours (33% better!)\n" +
                "• Best in class: 18 hours\n\n" +
                "📊 Downtime by Maintenance Type:\n" +
                "• Routine A-check: 6 hours\n" +
                "• Hydraulic repairs: 12 hours\n" +
                "• Engine inspection: 18 hours\n" +
                "• Emergency repairs: 48 hours\n\n" +
                "🎯 Improvement Opportunities:\n" +
                "• Parallel work streams: -3 hours\n" +
                "• Pre-positioned parts: -2 hours\n" +
                "• Digital work orders: -1 hour",
                {
                    title: "Downtime Analysis",
                    actions: ["Optimize Process", "Benchmark", MessageBox.Action.CLOSE]
                }
            );
        },

        onInventoryTilePress: function () {
            MessageBox.information(
                "📦 Parts Inventory Status: 87% Stock Level\n\n" +
                "Critical Parts Status:\n" +
                "✅ Engine filters: 95% (142/150)\n" +
                "⚠️ Hydraulic seals: 73% (87/120)\n" +
                "✅ Landing gear parts: 91% (68/75)\n" +
                "❌ Brake pads: 45% (18/40) - Reorder needed!\n\n" +
                "📊 SAP S/4HANA MM Integration:\n" +
                "• Auto-reorder threshold: 60%\n" +
                "• Lead time tracking: Active\n" +
                "• Vendor performance: 94% on-time\n\n" +
                "🚚 Incoming Orders:\n" +
                "• Brake pads: Due Feb 14 (30 units)\n" +
                "• Hydraulic seals: Due Feb 16 (50 units)",
                {
                    title: "Inventory Management",
                    actions: ["Reorder Now", "Vendor Contact", MessageBox.Action.CLOSE],
                    emphasizedAction: "Reorder Now",
                    onClose: (sAction) => {
                        if (sAction === "Reorder Now") {
                            MessageToast.show("📦 Purchase order created in S/4HANA MM module!");
                        }
                    }
                }
            );
        },

        formatMaintenanceTimeline: function (aMaintenanceData) {
            if (!aMaintenanceData || aMaintenanceData.length === 0) {
                return "<div style='padding: 50px; text-align: center; color: #666;'>No maintenance data available</div>";
            }

            // Base timeline items
            let timelineItems = [
                { date: "Feb 14", aircraft: "SL-B737-01", type: "A-Check", status: "scheduled", duration: "6h" },
                { date: "Feb 15", aircraft: "SL-A321-02", type: "Hydraulic", status: "in-progress", duration: "8h" },
                { date: "Feb 18", aircraft: "SL-B777-01", type: "Engine", status: "scheduled", duration: "12h" },
                { date: "Feb 20", aircraft: "SL-B737-02", type: "Landing Gear", status: "scheduled", duration: "4h" },
                { date: "Feb 22", aircraft: "", type: "Available", status: "empty", duration: "" }
            ];
            
            // Check for newly scheduled maintenance from flights
            const oModel = this.getView().getModel();
            const aMaintenanceSchedules = oModel.getProperty("/maintenanceSchedules") || [];
            const oNewMaintenance = aMaintenanceSchedules.find(m => m.isNewlyScheduled);
            
            if (oNewMaintenance) {
                // Replace the empty Feb 22 slot with the new maintenance
                timelineItems[4] = {
                    date: "Feb 22",
                    aircraft: oNewMaintenance.aircraft.tailNumber,
                    type: oNewMaintenance.maintenanceType,
                    status: "newly-scheduled",
                    duration: oNewMaintenance.estimatedHours + "h"
                };
            }

            let html = `
                <div class="maintenance-timeline-container">
                    <div class="maintenance-timeline-cards">
                        ${timelineItems.map(item => `
                            <div class="maintenance-card ${item.status === 'in-progress' ? 'in-progress' : item.status === 'completed' ? 'completed' : item.status === 'newly-scheduled' ? 'newly-scheduled' : item.status === 'empty' ? 'empty' : ''}"
                                onclick="${item.status !== 'empty' ? `sap.ui.getCore().byId('container-skylink---dashboard').getController()._showMaintenanceDetails('${item.aircraft}', '${item.type}')` : ''}">
                                <div style="font-weight: bold; font-size: 12px; color: #374151; margin-bottom: 4px;">${item.date}</div>
                                <div style="font-size: 11px; color: #6b7280; margin-bottom: 6px;">${item.aircraft || 'Available Slot'}</div>
                                <div style="font-weight: 600; font-size: 10px; color: #1f2937; margin-bottom: 4px;">${item.type}</div>
                                <div style="font-size: 9px; color: #6b7280;">${item.duration}</div>
                                ${item.status !== 'empty' ? `<div style="
                                    margin-top: 6px; 
                                    padding: 2px 6px; 
                                    border-radius: 12px; 
                                    font-size: 8px; 
                                    font-weight: 500;
                                    background: ${item.status === 'in-progress' ? '#f59e0b' : item.status === 'completed' ? '#10b981' : item.status === 'newly-scheduled' ? '#22c55e' : '#6b7280'};
                                    color: white;">
                                    ${item.status === 'newly-scheduled' ? 'NEW SCHEDULED' : item.status.toUpperCase()}
                                </div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div class="maintenance-timeline-footer">
                        📊 Click on any maintenance item for detailed information • Powered by SAP S/4HANA PM
                    </div>
                </div>
            `;

            return html;
        },

        _showMaintenanceDetails: function (aircraft, type) {
            MessageBox.information(
                `🔧 Maintenance Detail: ${aircraft}\n\n` +
                `Type: ${type} Maintenance\n` +
                `Technician: Certified Level 3\n` +
                `Parts Status: ✅ Available\n` +
                `Work Order: WO-${Math.floor(Math.random() * 10000)}\n\n` +
                `Checklist Progress:\n` +
                `✅ Safety inspection complete\n` +
                `⏳ Component testing in progress\n` +
                `⏳ Documentation pending\n\n` +
                `📊 SAP Integration:\n` +
                `• Real-time progress tracking\n` +
                `• Automated compliance reporting\n` +
                `• Cost tracking and analysis`,
                {
                    title: `${aircraft} - ${type}`,
                    actions: ["View Progress", "Update Status", MessageBox.Action.CLOSE]
                }
            );
        },
        
        onRegionClick: function (oEvent) {
            const oRegion = oEvent.getSource();
            const sCountryCode = oRegion.getCode();
            const sTooltip = oRegion.getTooltip();
            
            // Extract country name and demand from tooltip
            const countryMatch = sTooltip.match(/^([^:]+):/);
            const demandMatch = sTooltip.match(/(\d+)%/);
            const countryName = countryMatch ? countryMatch[1] : sCountryCode;
            const demandLevel = demandMatch ? demandMatch[1] : "Unknown";
            
            // Show country-specific analysis
            if (parseInt(demandLevel) >= 90) {
                MessageBox.error(
                    `🌍 Critical Demand Alert - ${countryName}\n\n` +
                    `Current Demand: ${demandLevel}%\n` +
                    `Status: CRITICAL - Multiple routes affected\n\n` +
                    `Key Routes:\n` +
                    `• ${sCountryCode === 'US' ? 'JFK→LAX: 98% full' : ''}\n` +
                    `• ${sCountryCode === 'JP' ? 'ORD→NRT: 97% full' : ''}\n` +
                    `• ${sCountryCode === 'SG' ? 'LAX→SIN: 89% full' : ''}\n\n` +
                    `Revenue at risk: $${(parseInt(demandLevel) * 25000).toLocaleString()}\n\n` +
                    `Analyze this region's capacity?`,
                    {
                        title: "Regional Capacity Alert",
                        actions: ["Analyze Region", "View Routes", MessageBox.Action.CLOSE],
                        emphasizedAction: "Analyze Region",
                        onClose: (sAction) => {
                            if (sAction === "Analyze Region") {
                                // Switch to 6M view and focus on region
                                this.getView().getModel().setProperty("/selectedPeriod", "6M");
                                this._loadForecastData("6M");
                                MessageToast.show(`Analyzing ${countryName} routes...`);
                                
                                // Scroll to forecast section
                                const forecastPanel = this.getView().byId("forecastPanel");
                                if (forecastPanel) {
                                    forecastPanel.getDomRef().scrollIntoView({ behavior: "smooth" });
                                }
                            } else if (sAction === "View Routes") {
                                // Filter flight table
                                MessageToast.show(`Filtering routes for ${countryName}...`);
                            }
                        }
                    }
                );
            } else {
                MessageToast.show(`${countryName}: ${demandLevel}% demand - Within normal range`);
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
                // Show performance issues
                MessageToast.show("⚠️ On-time performance below target - reviewing flight delays...");
                this._showDelayAnalysis();
            } else if (sTileId.includes("utilization")) {
                sKPIType = "Fleet Utilization";
                MessageToast.show("✅ Fleet utilization exceeding target - analyzing capacity opportunities...");
                this._showCapacityAnalysis(); 
            } else if (sTileId.includes("revenue")) {
                sKPIType = "Revenue Analysis";
                MessageToast.show("💰 Revenue above target - identifying growth opportunities...");
                this._showRevenueOpportunities();
            } else if (sTileId.includes("alerts")) {
                sKPIType = "Active Alerts";
                MessageToast.show("🚨 5 active alerts requiring attention...");
                this._showAlertDetails();
            } else if (sTileId.includes("aircraft")) {
                sKPIType = "Fleet Status";
                MessageToast.show("✈️ Fleet status overview loading...");
            }
        },

        _showDelayAnalysis: function() {
            // Simulate delay analysis
            setTimeout(() => {
                MessageBox.information(
                    "Flight Delay Analysis:\n\n" +
                    "• SL001 (JFK→LAX): 15 min delay\n" +
                    "• Weather impact: 40% of delays\n" +
                    "• Maintenance: 25% of delays\n" +
                    "• Air traffic: 35% of delays\n\n" +
                    "Recommendation: Adjust departure times for morning flights to avoid congestion.",
                    {
                        title: "On-Time Performance Analysis",
                        actions: ["Implement Changes", MessageBox.Action.CLOSE],
                        emphasizedAction: "Implement Changes",
                        onClose: function(sAction) {
                            if (sAction === "Implement Changes") {
                                MessageToast.show("✅ Schedule optimization initiated");
                            }
                        }
                    }
                );
            }, 500);
        },

        _showCapacityAnalysis: function() {
            // Show capacity opportunities
            setTimeout(() => {
                MessageBox.warning(
                    "🎯 Capacity Optimization Opportunity Detected!\n\n" +
                    "Holiday Demand Surge (Dec 18-26):\n" +
                    "• JFK→LAX: 98% booked (3 months out)\n" +
                    "• Unmet demand: 2,847 searches\n" +
                    "• Revenue opportunity: $2.4M\n\n" +
                    "Would you like to analyze demand forecast?",
                    {
                        title: "Fleet Utilization Alert",
                        actions: ["Analyze Demand", MessageBox.Action.CLOSE],
                        emphasizedAction: "Analyze Demand",
                        onClose: (sAction) => {
                            if (sAction === "Analyze Demand") {
                                // Switch to 6M view to show the problem
                                this.getView().getModel().setProperty("/selectedPeriod", "6M");
                                this._loadForecastData("6M");
                                MessageToast.show("📊 Switching to 6-month forecast view...");
                                
                                // Open Joule after a delay
                                setTimeout(() => {
                                    this.onOpenJoule();
                                    setTimeout(() => {
                                        this.byId("jouleInput").setValue("analyze demand forecast");
                                    }, 1000);
                                }, 1500);
                            }
                        }
                    }
                );
            }, 500);
        },

        _showRevenueOpportunities: function() {
            setTimeout(() => {
                MessageBox.success(
                    "💰 Revenue Growth Opportunities:\n\n" +
                    "1. Holiday capacity expansion: +$2.4M\n" +
                    "2. Dynamic pricing optimization: +$450K\n" +
                    "3. Ancillary services upsell: +$320K\n" +
                    "4. Corporate contract renewal: +$1.1M\n\n" +
                    "Total opportunity: $4.27M",
                    {
                        title: "Revenue Analysis",
                        actions: ["View Details", MessageBox.Action.CLOSE],
                        emphasizedAction: "View Details"
                    }
                );
            }, 500);
        },

        _showAlertDetails: function() {
            setTimeout(() => {
                MessageBox.error(
                    "🚨 Critical Alerts:\n\n" +
                    "1. ❌ JFK→LAX fully booked for holidays\n" +
                    "2. ⚠️ A321 maintenance due in 24 hours\n" +
                    "3. ❌ ORD→NRT capacity exceeded\n" +
                    "4. ⚠️ Crew shortage predicted next week\n" +
                    "5. ⚠️ Fuel costs increased 12%\n\n" +
                    "Click on forecast chart to address capacity issues.",
                    {
                        title: "Active Alerts",
                        actions: [MessageBox.Action.CLOSE]
                    }
                );
            }, 500);
        }
    });
});