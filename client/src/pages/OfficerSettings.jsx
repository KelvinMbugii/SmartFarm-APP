import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import officerService from '@/services/OfficerService';
import { toast } from 'sonner';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function OfficerSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    availability: {
      timezone: 'Africa/Nairobi',
      weekly: DAYS.map((_, dayOfWeek) => ({
        dayOfWeek,
        enabled: false,
        startTime: '08:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      })),
      exceptions: [],
    },
    bookingBufferMinutes: 0,
    maxDailyBookings: 8,
  });

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const data = await officerService.getMyAvailability();
        setForm({
          availability: {
            timezone: data?.availability?.timezone || 'Africa/Nairobi',
            weekly: data?.availability?.weekly || form.availability.weekly,
            exceptions: data?.availability?.exceptions || [],
          },
          bookingBufferMinutes: data?.bookingBufferMinutes ?? 0,
          maxDailyBookings: data?.maxDailyBookings ?? 8,
        });
      } catch (error) {
        toast.error(error?.response?.data?.error || 'Failed to load officer availability');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedWeekly = useMemo(
    () => [...(form.availability.weekly || [])].sort((a, b) => a.dayOfWeek - b.dayOfWeek),
    [form.availability.weekly]
  );

  const updateDay = (dayOfWeek, patch) => {
    setForm((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        weekly: prev.availability.weekly.map((day) =>
          day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day
        ),
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await officerService.updateMyAvailability(form);
      toast.success('Availability settings updated');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to save availability settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading availability settings...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Officer Settings</h1>
        <p className="text-muted-foreground mt-2">Set your consultation availability for farmer bookings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input
              value={form.availability.timezone}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  availability: { ...prev.availability, timezone: e.target.value },
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Booking Buffer (minutes)</Label>
            <Input
              type="number"
              min={0}
              max={180}
              value={form.bookingBufferMinutes}
              onChange={(e) => setForm((prev) => ({ ...prev, bookingBufferMinutes: Number(e.target.value) || 0 }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Max Daily Bookings</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={form.maxDailyBookings}
              onChange={(e) => setForm((prev) => ({ ...prev, maxDailyBookings: Number(e.target.value) || 1 }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedWeekly.map((day) => (
            <div key={day.dayOfWeek} className="grid gap-3 rounded border p-4 md:grid-cols-5 items-end">
              <div>
                <p className="font-medium">{DAYS[day.dayOfWeek]}</p>
              </div>
              <div className="space-y-2">
                <Label>Enabled</Label>
                <button
                  className={`h-9 rounded-md px-3 text-sm border ${day.enabled ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => updateDay(day.dayOfWeek, { enabled: !day.enabled })}
                  type="button"
                >
                  {day.enabled ? 'On' : 'Off'}
                </button>
              </div>
              <div className="space-y-2">
                <Label>Start</Label>
                <Input
                  type="time"
                  value={day.startTime}
                  disabled={!day.enabled}
                  onChange={(e) => updateDay(day.dayOfWeek, { startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End</Label>
                <Input
                  type="time"
                  value={day.endTime}
                  disabled={!day.enabled}
                  onChange={(e) => updateDay(day.dayOfWeek, { endTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Slot (min)</Label>
                <Input
                  type="number"
                  min={15}
                  step={15}
                  max={60}
                  value={day.slotDurationMinutes}
                  disabled={!day.enabled}
                  onChange={(e) => updateDay(day.dayOfWeek, { slotDurationMinutes: Number(e.target.value) || 30 })}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Availability Settings'}
        </Button>
      </div>
    </div>
  );
}