import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const files = {
  travel: path.join(root, 'data', 'travel-spots.json'),
  visited: path.join(root, 'data', 'visited-spots.json'),
  walking: path.join(root, 'data', 'walking-data.json'),
  regions: path.join(root, 'data', 'korea-regions.json')
};

const CATEGORIES = new Set([
  'mountain', 'beach', 'history', 'city', 'island', 'nature', 'unique',
  'hiking', 'theme', 'resort', 'park', 'temple', 'museum'
]);

const REGIONS = new Set([
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
]);

const errors = [];
const warnings = [];
const info = [];

function readJson(label, filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`${label}: cannot read or parse ${path.relative(root, filePath)} (${error.message})`);
    return null;
  }
}

function addDuplicateChecks(items, getKey, label) {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  for (const [key, count] of counts) {
    if (count > 1) errors.push(`${label}: duplicate value "${key}" appears ${count} times`);
  }
}

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateTravelSpots(data) {
  const spots = data?.spots;
  if (!Array.isArray(spots)) {
    errors.push('travel-spots: "spots" must be an array');
    return [];
  }

  addDuplicateChecks(spots, spot => spot.id, 'travel-spots ids');

  spots.forEach((spot, index) => {
    const where = `travel-spots[${index}]${spot?.id ? ` (${spot.id})` : ''}`;
    if (!spot || typeof spot !== 'object' || Array.isArray(spot)) {
      errors.push(`${where}: spot must be an object`);
      return;
    }
    for (const field of ['id', 'name', 'region', 'category', 'description']) {
      if (typeof spot[field] !== 'string' || !spot[field].trim()) {
        errors.push(`${where}: "${field}" must be a non-empty string`);
      }
    }
    if (!Number.isFinite(spot.lat) || spot.lat < 32 || spot.lat > 39) {
      errors.push(`${where}: lat must be a number within Korea bounds`);
    }
    if (!Number.isFinite(spot.lng) || spot.lng < 124 || spot.lng > 132.5) {
      errors.push(`${where}: lng must be a number within Korea bounds`);
    }
    if (!Number.isFinite(spot.radius) || spot.radius <= 0) {
      errors.push(`${where}: radius must be a positive number`);
    } else if (spot.radius > 30000) {
      warnings.push(`${where}: radius ${spot.radius} looks unusually large`);
    }
    if (spot.category && !CATEGORIES.has(spot.category)) {
      errors.push(`${where}: unknown category "${spot.category}"`);
    }
    if (spot.region && !REGIONS.has(spot.region)) {
      errors.push(`${where}: unknown region "${spot.region}"`);
    }
    if (typeof spot.description === 'string' && spot.description.length < 8) {
      warnings.push(`${where}: description is very short`);
    }
  });

  return spots;
}

function validateVisited(data, spotIds) {
  const visited = data?.visited;
  if (!Array.isArray(visited)) {
    errors.push('visited-spots: "visited" must be an array');
    return [];
  }
  const records = data?.records ?? {};
  if (!records || typeof records !== 'object' || Array.isArray(records)) {
    errors.push('visited-spots: "records" must be an object');
  }
  if (data?.lastUpdated && !isDate(data.lastUpdated)) {
    warnings.push(`visited-spots: lastUpdated "${data.lastUpdated}" is not YYYY-MM-DD`);
  }

  addDuplicateChecks(visited.map(id => ({ id })), item => item.id, 'visited-spots visited ids');

  for (const id of visited) {
    if (typeof id !== 'string' || !id.trim()) {
      errors.push('visited-spots: visited entries must be non-empty strings');
    } else if (!spotIds.has(id)) {
      errors.push(`visited-spots: visited id "${id}" does not exist in travel-spots`);
    }
  }

  for (const [id, record] of Object.entries(records || {})) {
    if (!spotIds.has(id)) {
      errors.push(`visited-spots: record id "${id}" does not exist in travel-spots`);
    }
    if (!visited.includes(id)) {
      warnings.push(`visited-spots: record id "${id}" is not marked visited`);
    }
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      errors.push(`visited-spots records.${id}: record must be an object`);
      continue;
    }
    if (record.visitedAt && !isDate(record.visitedAt)) {
      errors.push(`visited-spots records.${id}: visitedAt must be YYYY-MM-DD`);
    }
    if (record.memo != null && typeof record.memo !== 'string') {
      errors.push(`visited-spots records.${id}: memo must be a string`);
    }
    if (record.rating != null && (!Number.isFinite(record.rating) || record.rating < 1 || record.rating > 5)) {
      errors.push(`visited-spots records.${id}: rating must be null or a number from 1 to 5`);
    }
    if (record.photos != null && !Array.isArray(record.photos)) {
      errors.push(`visited-spots records.${id}: photos must be an array`);
    }
  }

  return visited;
}

function validateWalking(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    errors.push('walking-data: root must be an object keyed by date');
    return;
  }
  const dates = Object.keys(data);
  addDuplicateChecks(dates.map(date => ({ date })), item => item.date, 'walking-data dates');
  for (const [date, value] of Object.entries(data)) {
    if (!isDate(date)) errors.push(`walking-data: key "${date}" must be YYYY-MM-DD`);
    const km = typeof value === 'object' && value !== null ? value.km : value;
    const steps = typeof value === 'object' && value !== null ? value.steps : 0;
    if (!Number.isFinite(km) || km < 0) errors.push(`walking-data ${date}: km must be a non-negative number`);
    if (steps != null && (!Number.isFinite(steps) || steps < 0)) {
      errors.push(`walking-data ${date}: steps must be a non-negative number`);
    }
  }
}

function validateRegions(data) {
  if (!data || typeof data !== 'object') {
    errors.push('korea-regions: root must be a GeoJSON object');
    return;
  }
  if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    errors.push('korea-regions: must be a GeoJSON FeatureCollection');
  }
}

const travelData = readJson('travel-spots', files.travel);
const visitedData = readJson('visited-spots', files.visited);
const walkingData = readJson('walking-data', files.walking);
const regionData = readJson('korea-regions', files.regions);

const spots = validateTravelSpots(travelData);
const spotIds = new Set(spots.map(spot => spot.id));
const visited = validateVisited(visitedData, spotIds);
validateWalking(walkingData);
validateRegions(regionData);

info.push(`travel spots: ${spots.length}`);
info.push(`visited spots: ${visited.length}`);
info.push(`remaining spots: ${Math.max(spots.length - visited.length, 0)}`);
info.push(`categories: ${new Set(spots.map(spot => spot.category)).size}`);
info.push(`regions: ${new Set(spots.map(spot => spot.region)).size}`);

console.log('\nData validation report');
console.log('='.repeat(22));
for (const line of info) console.log(`info: ${line}`);
for (const warning of warnings) console.log(`warning: ${warning}`);
for (const error of errors) console.log(`error: ${error}`);

if (errors.length) {
  console.log(`\nFailed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exitCode = 1;
} else {
  console.log(`\nOK: no errors${warnings.length ? ` (${warnings.length} warning(s))` : ''}.`);
}
