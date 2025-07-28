namespace skylink;

using { cuid, managed } from '@sap/cds/common';

entity Aircraft : cuid, managed {
    tailNumber          : String(10) not null;
    model               : String(50);
    manufacturer        : String(50);
    lastCheck           : Date;
    nextCheck           : Date;
    flightHours         : Integer;
    status              : String(20); // 'active', 'maintenance', 'grounded'
    location            : String(3);  // Airport code
    capacity            : Integer;
    maintenanceSchedules: Association to many MaintenanceSchedule on maintenanceSchedules.aircraft = $self;
    flights             : Association to many Flight on flights.aircraft = $self;
}

entity Flight : cuid, managed {
    flightNumber        : String(10) not null;
    origin              : String(3);  // Airport code
    destination         : String(3);  // Airport code
    scheduledDeparture  : DateTime;
    actualDeparture     : DateTime;
    scheduledArrival    : DateTime;
    actualArrival       : DateTime;
    status              : String(20); // 'scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled'
    gate                : String(10);
    aircraft            : Association to Aircraft;
    passengerCount      : Integer;
    bookings            : Association to many Booking on bookings.flight = $self;
    delayMinutes        : Integer;
    delayReason         : String(100);
}

entity MaintenanceSchedule : cuid, managed {
    aircraft            : Association to Aircraft;
    maintenanceType     : String(20); // 'routine', 'unscheduled', 'heavy', 'line'
    scheduledDate       : DateTime;
    completedDate       : DateTime;
    duration            : Integer; // in hours
    priority            : String(10); // 'low', 'medium', 'high', 'critical'
    status              : String(20); // 'scheduled', 'in_progress', 'completed', 'overdue'
    description         : String(500);
    cost                : Decimal(10,2);
    technician          : String(100);
}

entity Booking : cuid, managed {
    flight              : Association to Flight;
    passengerName       : String(100);
    bookingClass        : String(20); // 'economy', 'business', 'first'
    seatNumber          : String(5);
    bookingDate         : DateTime;
    fare                : Decimal(10,2);
    status              : String(20); // 'confirmed', 'cancelled', 'checked_in'
    baggageCount        : Integer;
}

entity OperationalMetric : cuid, managed {
    date                : Date;
    metricType          : String(50); // 'on_time_performance', 'fleet_utilization', 'revenue', 'fuel_efficiency'
    value               : Decimal(10,2);
    unit                : String(20);
    trend               : String(10); // 'up', 'down', 'stable'
    target              : Decimal(10,2);
    variance            : Decimal(10,2);
}

entity Alert : cuid, managed {
    alertType           : String(50); // 'maintenance', 'delay', 'weather', 'operational'
    severity            : String(20); // 'info', 'warning', 'critical'
    title               : String(200);
    description         : String(1000);
    relatedEntity       : String(50); // Reference to aircraft, flight, etc.
    relatedEntityId     : String(36);
    isResolved          : Boolean default false;
    resolvedAt          : DateTime;
    resolvedBy          : String(100);
}
