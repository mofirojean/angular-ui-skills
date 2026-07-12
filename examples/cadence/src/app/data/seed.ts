import {
  addDays,
  addMinutes,
  format,
  set,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { CALENDAR_COLORS, type Booking, type Resource } from './types';

export const SEED_RESOURCES: Resource[] = [
  room('aspen', 'Aspen', 8, '3'),
  room('birch', 'Birch', 12, '3'),
  room('cedar', 'Cedar', 4, '2'),
  room('dogwood', 'Dogwood', 6, '2'),
  room('elm', 'Elm', 20, '1'),
  room('fir', 'Fir', 2, '4'),
  room('ginkgo', 'Ginkgo', 10, '4'),
  room('hazel', 'Hazel', 6, '1'),
  person('amara', 'Amara Okafor', 'Coach'),
  person('ben', 'Ben Halvorsen', 'IT support'),
  person('chen', 'Chen Wei', 'Photographer'),
  person('dana', 'Dana Ruiz', 'Coach'),
  person('evan', 'Evan Meyers', 'IT support'),
  person('farah', 'Farah Nasser', 'Facilitator'),
  equipment('camera', '4K Camera Kit'),
  equipment('pa', 'Portable PA System'),
  external('external', 'External / Client hold'),
];

function room(id: string, name: string, capacity: number, floor: string): Resource {
  return {
    id: `res_room_${id}`,
    name,
    type: 'room',
    calendarKey: 'rooms',
    color: CALENDAR_COLORS.rooms,
    capacity,
    floor,
    equipment: [],
  };
}

function person(id: string, name: string, role: string): Resource {
  return {
    id: `res_person_${id}`,
    name,
    type: 'person',
    calendarKey: 'people',
    color: CALENDAR_COLORS.people,
    capacity: null,
    floor: null,
    equipment: [role],
  };
}

function equipment(id: string, name: string): Resource {
  return {
    id: `res_equip_${id}`,
    name,
    type: 'equipment',
    calendarKey: 'equipment',
    color: CALENDAR_COLORS.equipment,
    capacity: null,
    floor: null,
    equipment: [],
  };
}

function external(id: string, name: string): Resource {
  return {
    id: `res_ext_${id}`,
    name,
    type: 'room',
    calendarKey: 'external',
    color: CALENDAR_COLORS.external,
    capacity: null,
    floor: null,
    equipment: [],
  };
}

export function buildSeedBookings(now: Date): Booking[] {
  const monday = startOfWeek(now, { weekStartsOn: 1 });
  const stamp = now.getTime();
  let seq = 0;

  const at = (dayOffset: number, hour: number, minute: number): Date =>
    set(addDays(monday, dayOffset), {
      hours: hour,
      minutes: minute,
      seconds: 0,
      milliseconds: 0,
    });

  const single = (
    title: string,
    resourceId: string,
    calendarKey: Booking['calendarKey'],
    start: Date,
    durationMin: number,
    attendees: string[] = [],
  ): Booking => ({
    id: `bk_${++seq}`,
    title,
    resourceId,
    calendarKey,
    start: start.toISOString(),
    end: addMinutes(start, durationMin).toISOString(),
    recurrence: null,
    exceptions: [],
    attendees,
    description: '',
    createdAt: stamp,
    updatedAt: stamp,
  });

  const series = (
    title: string,
    resourceId: string,
    calendarKey: Booking['calendarKey'],
    start: Date,
    durationMin: number,
    recurrence: Booking['recurrence'],
    exceptions: Booking['exceptions'] = [],
    attendees: string[] = [],
  ): Booking => ({
    id: `bk_${++seq}`,
    title,
    resourceId,
    calendarKey,
    start: start.toISOString(),
    end: addMinutes(start, durationMin).toISOString(),
    recurrence,
    exceptions,
    attendees,
    description: '',
    createdAt: stamp,
    updatedAt: stamp,
  });

  const monthFifteen = set(startOfMonth(now), {
    date: 15,
    hours: 11,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  return [
    single('Design review', 'res_room_birch', 'rooms', at(1, 10, 0), 60, ['Amara Okafor', 'Dana Ruiz']),
    single('Vendor demo', 'res_room_elm', 'rooms', at(2, 14, 0), 60),
    single('1:1 Amara / Ben', 'res_person_amara', 'people', at(3, 9, 30), 30, ['Ben Halvorsen']),
    single('Team headshots', 'res_person_chen', 'people', at(4, 13, 0), 180),
    single('Board prep', 'res_room_cedar', 'rooms', at(0, 15, 0), 90),
    single('Client call: Northwind', 'res_room_fir', 'rooms', at(1, 16, 0), 45),
    single('IT onboarding', 'res_person_ben', 'people', at(2, 11, 0), 60),
    single('Budget sync', 'res_room_dogwood', 'rooms', at(3, 14, 0), 60),
    single('Retro', 'res_room_ginkgo', 'rooms', at(4, 10, 0), 60),
    single('Facilities walk', 'res_person_farah', 'people', at(0, 8, 30), 30),
    single('Client hold: Meridian', 'res_ext_external', 'external', at(2, 9, 0), 480),
    single('PA system pickup', 'res_equip_pa', 'equipment', at(4, 8, 0), 30),

    series('Daily standup', 'res_room_aspen', 'rooms', at(0, 9, 15), 15, {
      freq: 'WEEKLY',
      interval: 1,
      byWeekday: ['MO', 'TU', 'WE', 'TH', 'FR'],
    }),
    series('Sprint planning', 'res_room_birch', 'rooms', at(0, 13, 0), 90, {
      freq: 'WEEKLY',
      interval: 1,
      byWeekday: ['MO'],
    }),
    series('Design critique', 'res_room_ginkgo', 'rooms', at(3, 15, 0), 60, {
      freq: 'WEEKLY',
      interval: 2,
      byWeekday: ['TH'],
    }),
    series('Town hall', 'res_room_elm', 'rooms', monthFifteen, 60, {
      freq: 'MONTHLY',
      interval: 1,
      byMonthday: [15],
    }),
    series('Focus block', 'res_person_dana', 'people', at(0, 8, 0), 45, {
      freq: 'DAILY',
      interval: 1,
    }),
    series(
      'Weekly sync',
      'res_room_cedar',
      'rooms',
      at(2, 16, 0),
      30,
      { freq: 'WEEKLY', interval: 1, byWeekday: ['WE'] },
      [
        { occurrenceDate: format(at(2, 16, 0), 'yyyy-MM-dd'), type: 'cancelled' },
        {
          occurrenceDate: format(at(9, 16, 0), 'yyyy-MM-dd'),
          type: 'modified',
          override: {
            title: 'Weekly sync (extended)',
            start: at(9, 16, 0).toISOString(),
            end: at(9, 17, 0).toISOString(),
          },
        },
      ],
    ),
    series('Coffee roulette', 'res_person_farah', 'people', at(4, 15, 30), 30, {
      freq: 'WEEKLY',
      interval: 1,
      byWeekday: ['FR'],
    }),
    series('Equipment maintenance', 'res_equip_camera', 'equipment', at(0, 17, 0), 30, {
      freq: 'WEEKLY',
      interval: 2,
      byWeekday: ['MO'],
    }),
  ];
}
