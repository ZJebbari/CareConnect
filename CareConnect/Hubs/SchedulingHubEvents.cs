namespace CareConnect.Hubs
{
    public static class SchedulingHubEvents
    {
        public const string AppointmentCreated = "AppointmentCreated";
        public const string AppointmentUpdated = "AppointmentUpdated";
        public const string AppointmentCancelled = "AppointmentCancelled";
        public const string PhysicianScheduleUpdated = "PhysicianScheduleUpdated";
        public const string PhysicianTimeOffUpdated = "PhysicianTimeOffUpdated";
    }
}