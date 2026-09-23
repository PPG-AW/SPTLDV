// Development in-memory database for local testing
// In production, use Neon PostgreSQL

interface InMemoryDB {
  guru: any[];
  kelas: any[];
  siswa: any[];
  anggota_kelas: any[];
  subbab: any[];
  progres: any[];
  attempts: any[];
  sumatif: any[];
  tutor_requests: any[];
  panggilan_guru: any[];
  hentikan: any[];
}

const db: InMemoryDB = {
  guru: [],
  kelas: [],
  siswa: [],
  anggota_kelas: [],
  subbab: [],
  progres: [],
  attempts: [],
  sumatif: [],
  tutor_requests: [],
  panggilan_guru: [],
  hentikan: [],
};

let idCounters: Record<string, number> = {
  guru: 1,
  kelas: 1,
  siswa: 1,
  attempts: 1,
  sumatif: 1,
  tutor_requests: 1,
  panggilan_guru: 1,
  hentikan: 1,
};

// Simple query builder that mimics Drizzle API
export const devDb = {
  select(fields?: any) {
    return {
      from(table: any) {
        const tableName = getTableName(table);
        return {
          where(condition: any) {
            const results = filterByCondition(db[tableName] || [], condition);
            return Promise.resolve(results);
          },
          orderBy(column: any) {
            return Promise.resolve(db[tableName] || []);
          },
          innerJoin(otherTable: any, onCondition: any) {
            return this;
          },
          then(resolve: any) {
            resolve(db[tableName] || []);
            return this;
          },
        };
      },
    };
  },

  insert(table: any) {
    const tableName = getTableName(table);
    return {
      values(data: any) {
        return {
          returning(fields?: any) {
            const record = { ...data, id: idCounters[tableName]++ };
            db[tableName].push(record);
            return Promise.resolve([record]);
          },
          then(resolve: any) {
            const record = { ...data, id: idCounters[tableName]++ };
            db[tableName].push(record);
            resolve({ rowCount: 1 });
            return this;
          },
        };
      },
    };
  },

  update(table: any) {
    const tableName = getTableName(table);
    return {
      set(data: any) {
        return {
          where(condition: any) {
            const records = filterByCondition(db[tableName] || [], condition);
            records.forEach(r => Object.assign(r, data));
            return Promise.resolve({ rowCount: records.length });
          },
        };
      },
    };
  },

  delete(table: any) {
    const tableName = getTableName(table);
    return {
      where(condition: any) {
        const before = db[tableName].length;
        db[tableName] = db[tableName].filter(r => !matchesCondition(r, condition));
        return Promise.resolve({ rowCount: before - db[tableName].length });
      },
    };
  },
};

function getTableName(table: any): string {
  // Extract table name from Drizzle table object
  if (table._.name) return table._.name;
  const str = String(table);
  const match = str.match(/"(\w+)"/);
  return match ? match[1] : 'unknown';
}

function filterByCondition(records: any[], condition: any): any[] {
  if (!condition) return records;
  // Simple condition matching (in real Drizzle, this is more complex)
  return records; // For now, return all
}

function matchesCondition(record: any, condition: any): boolean {
  return false; // For now
}

// Ensure tables and seed data
export async function ensureDevTables() {
  const { SUBBAB_CONTENT } = await import('@/lib/subbab');
  
  if (db.subbab.length === 0) {
    for (const sb of SUBBAB_CONTENT) {
      db.subbab.push({
        no: sb.no,
        judul: sb.judul,
        video_url: sb.video_url,
        materi: sb.materi,
      });
    }
  }

  console.log('✅ Dev database initialized with', db.subbab.length, 'subbab');
}
