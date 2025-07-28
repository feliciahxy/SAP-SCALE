using skylink as sl from '../db/data-model';

service SkyLinkService {
    entity Aircraft as projection on sl.Aircraft;
    entity Flight as projection on sl.Flight;
    entity MaintenanceSchedule as projection on sl.MaintenanceSchedule;
    entity Booking as projection on sl.Booking;
    entity OperationalMetric as projection on sl.OperationalMetric;
    entity Alert as projection on sl.Alert;
    
    // Actions for Joule AI integration
    action optimizeFlightSchedule() returns String;
    action predictMaintenanceNeeds() returns array of String;
    action analyzeTrends(metricType: String) returns String;
}

// UI Annotations
annotate SkyLinkService.Aircraft with @(
    UI.LineItem : [
        { Value: tailNumber, Label: 'Tail Number' },
        { Value: model, Label: 'Model' },
        { Value: manufacturer, Label: 'Manufacturer' },
        { Value: status, Label: 'Status' },
        { Value: location, Label: 'Location' },
        { Value: flightHours, Label: 'Flight Hours' },
        { Value: nextCheck, Label: 'Next Check' }
    ],
    UI.HeaderInfo : {
        TypeName : 'Aircraft',
        TypeNamePlural : 'Aircraft Fleet',
        Title : { Value : tailNumber }
    }
);

annotate SkyLinkService.Flight with @(
    UI.LineItem : [
        { Value: flightNumber, Label: 'Flight' },
        { Value: origin, Label: 'From' },
        { Value: destination, Label: 'To' },
        { Value: scheduledDeparture, Label: 'Departure' },
        { Value: status, Label: 'Status' },
        { Value: gate, Label: 'Gate' },
        { Value: passengerCount, Label: 'Passengers' }
    ]
);

annotate SkyLinkService.MaintenanceSchedule with @(
    UI.LineItem : [
        { Value: aircraft.tailNumber, Label: 'Aircraft' },
        { Value: maintenanceType, Label: 'Type' },
        { Value: scheduledDate, Label: 'Scheduled' },
        { Value: priority, Label: 'Priority' },
        { Value: status, Label: 'Status' },
        { Value: cost, Label: 'Cost' }
    ]
);

annotate SkyLinkService.Alert with @(
    UI.LineItem : [
        { Value: alertType, Label: 'Type' },
        { Value: severity, Label: 'Severity' },
        { Value: title, Label: 'Alert' },
        { Value: createdAt, Label: 'Time' },
        { Value: isResolved, Label: 'Resolved' }
    ]
);
