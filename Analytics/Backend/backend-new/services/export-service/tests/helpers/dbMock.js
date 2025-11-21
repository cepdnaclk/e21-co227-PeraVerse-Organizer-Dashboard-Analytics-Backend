function createDbMock(overrides = {}) {
  const defaultHandler = async (sql) => {
    sql = String(sql);
    // Attendance & common metrics
    if (sql.includes('COUNT(*)::int AS visits') && sql.includes('JOIN "BUILDING"') && sql.includes('GROUP BY b.dept_name')) {
      return { rows: [
        { dept_name: 'Engineering', building_id: 'B1', visits: 12 },
        { dept_name: 'Science', building_id: 'B2', visits: 8 }
      ] };
    }
    if (sql.includes('COUNT(DISTINCT e.tag_id)')) {
      return { rows: [
        { dept_name: 'Engineering', building_id: 'B1', unique_visitors: 10 },
        { dept_name: 'Science', building_id: 'B2', unique_visitors: 7 }
      ] };
    }
    if (sql.includes('AVG(EXTRACT(EPOCH')) {
      return { rows: [
        { dept_name: 'Engineering', building_id: 'B1', avg_minutes: 42.5 },
        { dept_name: 'Science', building_id: 'B2', avg_minutes: 30.0 }
      ] };
    }
    if (sql.includes('EXTRACT(HOUR FROM entry_time') || sql.includes('Events') && sql.includes('GROUP BY hour')) {
      return { rows: [ { hour: 10, cnt: 2, entries: 5 }, { hour: 14, cnt: 3, entries: 7 } ] };
    }
    if (sql.includes('COUNT(*)::int AS exits') && sql.includes('GROUP BY b.building_id')) {
      return { rows: [ { building_id: 'B1', exits: 11 }, { building_id: 'B2', exits: 7 } ] };
    }
    if (sql.includes('HAVING COUNT(*) > 1') && sql.includes('GROUP BY tag_id') && !sql.includes('JOIN')) {
      return { rows: [ { tag_id: 'T1', visits: 2 }, { tag_id: 'T2', visits: 3 } ] };
    }
    if (sql.includes('SELECT tag_id, building_id, entry_time') && sql.includes('IN (')) {
      return { rows: [
        { tag_id: 'T1', building_id: 'B1', entry_time: new Date().toISOString() },
        { tag_id: 'T2', building_id: 'B2', entry_time: new Date().toISOString() }
      ] };
    }
    if (sql.includes('SUBSTRING(building_id') && sql.includes('AS zone')) {
      return { rows: [ { zone: 'B', visits: 10 }, { zone: 'C', visits: 5 } ] };
    }
    if (sql.includes('CASE') && sql.includes('AS slot') && sql.includes('GROUP BY slot')) {
      return { rows: [ { slot: '10-13', visits: 8 }, { slot: '13-16', visits: 6 }, { slot: '16-19', visits: 4 } ] };
    }

    // Event summary specific
  if (sql.includes('FROM Events') && sql.includes('AVG(EXTRACT') && sql.includes('MIN(start_time)')) {
      return { rows: [ { total_events: 5, avg_duration: 90.5, first_event: new Date().toISOString(), last_event: new Date().toISOString() } ] };
    }
    if (sql.includes('unnest(e.event_categories)')) {
      return { rows: [ { category_name: 'Talk', event_count: 3 }, { category_name: 'Workshop', event_count: 2 } ] };
    }
    if (sql.includes('FROM Events e') && sql.includes('GROUP BY location')) {
      return { rows: [ { location: 'Hall A', event_count: 3 }, { location: 'Hall B', event_count: 2 } ] };
    }
    if (sql.includes('JOIN event_speaker')) {
      if (sql.includes('GROUP BY s.speaker_name')) {
        return { rows: [ { speaker_name: 'Alice', event_count: 3 }, { speaker_name: 'Bob', event_count: 2 } ] };
      }
      if (sql.includes('GROUP BY e.location, s.speaker_name')) {
        return { rows: [
          { location: 'Hall A', speaker_name: 'Alice', event_count: 3 },
          { location: 'Hall B', speaker_name: 'Bob', event_count: 2 }
        ] };
      }
    }

    // Movement flow specifics
    if (sql.includes('SELECT slot') && sql.includes('SUM(entry_count)') && sql.includes('UNION ALL')) {
      return { rows: [
        { slot: '10am-1pm', entries: 5, exits: 3 },
        { slot: '1pm-4pm', entries: 4, exits: 5 }
      ] };
    }
    if (sql.includes('GROUP BY from_building, to_building')) {
      return { rows: [ { from_building: 'B1', to_building: 'B2', transitions: 4 } ] };
    }
    if (sql.includes('busiest') || (sql.includes('GROUP BY b.dept_name') && sql.includes('LIMIT 50'))) {
      return { rows: [ { dept_name: 'Engineering', building_id: 'B1', entries: 12 } ] };
    }
    if (sql.includes('SELECT tag_id, building_id') && sql.includes('FROM "EntryExitLog"') && !sql.includes('ROW_NUMBER')) {
      return { rows: [ { tag_id: 'T1', building_id: 'B1' }, { tag_id: 'T2', building_id: 'B2' } ] };
    }
    if (sql.includes('AVG(cnt)::numeric(10,2) AS avg_buildings')) {
      return { rows: [ { avg_buildings: 2.5 } ] };
    }

    // Security/Exception specific
    if (sql.includes('NOT (') && sql.includes('ORDER BY entry_time DESC')) {
      return { rows: [ { tag_id: 'T1', building_id: 'B1', entry_time: new Date().toISOString() } ] };
    }
    if (sql.includes('EXTRACT(EPOCH FROM (exit_time - entry_time)')) {
      return { rows: [ { tag_id: 'T2', building_id: 'B2', entry_time: new Date().toISOString(), exit_time: new Date().toISOString(), minutes: 300 } ] };
    }
    if (sql.includes('WHERE exit_time IS NULL')) {
      return { rows: [ { tag_id: 'T3', building_id: 'B3', entry_time: new Date().toISOString() } ] };
    }
    if (sql.includes('WHERE e.building_id = ANY')) {
      return { rows: [ { tag_id: 'T4', building_id: 'B1', dept_name: 'Admin', entry_time: new Date().toISOString() } ] };
    }
    if (sql.includes('FROM "BUILDING"') && sql.includes('WHERE building_id = ANY')) {
      return { rows: [ { building_id: 'B1', dept_name: 'Admin' }, { building_id: 'B2', dept_name: 'Science' } ] };
    }
    if (sql.includes('After-hours Entries by Building') || (sql.includes('SELECT b.dept_name') && sql.includes('AS slot') && sql.includes('ORDER BY entries DESC'))) {
      return { rows: [ { dept_name: 'Admin', building_id: 'B1', slot: 'other', entries: 6 } ] };
    }
    if (sql.includes('HAVING COUNT(*) >=') && sql.includes('Congestion')) {
      return { rows: [ { building_id: 'B2', slot: '10-13', cnt: 7 } ] };
    }

    // Fallback
    return { rows: [] };
  };

  const handler = overrides.handler || defaultHandler;
  return {
    query: jest.fn((sql, params) => handler(sql, params))
  };
}

module.exports = { createDbMock };
