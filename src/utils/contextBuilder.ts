import type { WorldRecord, ContextCollectorOptions, RecordType } from '../types';

/**
 * Bağlam Toplayıcı: Bir kaydın bağlantılarını ve ilişkili verilerini
 * derleyerek formatlanmış Türkçe metin üretir.
 */

/**
 * Kayıt listesinden belirli bir ID'ye sahip kaydı bulur.
 * @param records - Tüm kayıtlar
 * @param id - Aranacak kayıt ID'si
 * @returns Bulunan kayıt veya undefined
 */
function findRecordById(records: WorldRecord[], id: string): WorldRecord | undefined {
  return records.find((r) => r.id === id);
}

/**
 * Bir kaydın üst konumunu (parent) özyinelemeli olarak bulur ve
 * hiyerarşik yol olarak döner.
 * @param record - Başlangıç kaydı
 * @param records - Tüm kayıtlar
 * @param depth - Maksimum derinlik
 * @returns Hiyerarşik yol string'i
 */
function buildParentPath(
  record: WorldRecord,
  records: WorldRecord[],
  depth: number
): string {
  if (depth <= 0 || record.type !== 'location') {
    return '';
  }

  const location = record as Extract<WorldRecord, { type: 'location' }>;
  if (!location.parentId) {
    return '';
  }

  const parent = findRecordById(records, location.parentId);
  if (!parent || parent.type !== 'location') {
    return '';
  }

  const parentPath = buildParentPath(parent, records, depth - 1);
  if (parentPath) {
    return `${parentPath} > ${parent.name}`;
  }
  return parent.name;
}

/**
 * Bir kaydın bağlantılarını derler ve formatlanmış metin üretir.
 * @param record - Ana kayıt
 * @param records - Tüm kayıtlar
 * @param options - Bağlam toplayıcı seçenekleri
 * @returns Formatlanmış Türkçe bağlam metni
 */
export function buildContext(
  record: WorldRecord,
  records: WorldRecord[],
  options: ContextCollectorOptions
): string {
  const lines: string[] = [];

  // Temel bilgiler
  const typeLabel = getRecordTypeLabel(record.type);
  lines.push(`${typeLabel}: ${record.name}`);

  // Açıklama / Oyuncu metni
  if (options.playerOnly) {
    if (record.playerText) {
      lines.push(`OYUNCU BİLGİSİ: ${record.playerText}`);
    }
  } else {
    if (record.description) {
      lines.push(`AÇIKLAMA: ${record.description}`);
    }
    if (options.includeDmNotes && record.playerText) {
      lines.push(`OYUNCU METNİ: ${record.playerText}`);
    }
  }

  // Konum özel: üst konum hiyerarşisi
  if (record.type === 'location') {
    const parentPath = buildParentPath(record, records, options.depth);
    if (parentPath) {
      lines.push(`ÜST KONUM: ${parentPath}`);
    }
  }

  // Bağlantıları derle
  const connections = collectConnections(record, records, options.depth);
  for (const conn of connections) {
    const relationLabel = formatRelationLabel(conn.relation, conn.targetType);
    lines.push(`${relationLabel}: ${conn.targetName}`);
    if (conn.targetDescription && !options.playerOnly) {
      lines.push(`  → ${conn.targetDescription}`);
    } else if (conn.targetPlayerText && options.playerOnly) {
      lines.push(`  → ${conn.targetPlayerText}`);
    }
  }

  lines.push('---');
  return lines.join('\n');
}

/**
 * Bağlantı bilgisi arayüzü.
 */
interface CollectedConnection {
  targetId: string;
  targetName: string;
  targetType: RecordType;
  targetDescription: string;
  targetPlayerText: string;
  relation: string;
  depth: number;
}

/**
 * Bir kaydın bağlantılarını belirtilen derinliğe kadar toplar.
 * @param record - Başlangıç kaydı
 * @param records - Tüm kayıtlar
 * @param maxDepth - Maksimum derinlik
 * @param visited - Ziyaret edilen ID'ler (döngü önleme)
 * @param currentDepth - Mevcut derinlik
 * @returns Toplanan bağlantılar
 */
function collectConnections(
  record: WorldRecord,
  records: WorldRecord[],
  maxDepth: number,
  visited: Set<string> = new Set(),
  currentDepth: number = 1
): CollectedConnection[] {
  if (currentDepth > maxDepth) {
    return [];
  }

  const results: CollectedConnection[] = [];
  visited.add(record.id);

  for (const conn of record.connections) {
    if (visited.has(conn.targetId)) {
      continue;
    }

    const target = findRecordById(records, conn.targetId);
    if (!target) {
      continue;
    }

    results.push({
      targetId: target.id,
      targetName: target.name,
      targetType: target.type,
      targetDescription: target.description,
      targetPlayerText: target.playerText,
      relation: conn.relation,
      depth: currentDepth,
    });

    visited.add(target.id);

    // Alt bağlantıları topla
    const subConnections = collectConnections(
      target,
      records,
      maxDepth,
      new Set(visited),
      currentDepth + 1
    );
    results.push(...subConnections);
  }

  return results;
}

/**
 * Kayıt türüne göre Türkçe etiket döner.
 * @param type - Kayıt türü
 * @returns Türkçe etiket
 */
function getRecordTypeLabel(type: RecordType): string {
  const labels: Record<RecordType, string> = {
    location: 'KONUM',
    npc: 'NPC',
    faction: 'FRAKSİYON',
    religion: 'DİN',
    culture: 'KÜLTÜR',
    item: 'EŞYA',
    quest: 'GÖREV',
    rumor: 'SÖYLENTİ',
    event: 'OLAY',
    lore: 'LORE',
    map: 'HARİTA',
    handout: 'EL NOTU',
  };
  return labels[type] || 'KAYIT';
}

/**
 * Bağlantı türüne ve hedef türüne göre Türkçe etiket döner.
 * @param relation - Bağlantı ilişkisi
 * @param targetType - Hedef kayıt türü
 * @returns Türkçe etiket
 */
function formatRelationLabel(relation: string, targetType: RecordType): string {
  const typeLabels: Record<RecordType, string> = {
    location: 'BAĞLI KONUM',
    npc: 'BAĞLI NPC',
    faction: 'BAĞLI FRAKSİYON',
    religion: 'BAĞLI DİN',
    culture: 'BAĞLI KÜLTÜR',
    item: 'BAĞLI EŞYA',
    quest: 'BAĞLI GÖREV',
    rumor: 'BAĞLI SÖYLENTİ',
    event: 'BAĞLI OLAY',
    lore: 'BAĞLI LORE',
    map: 'BAĞLI HARİTA',
    handout: 'BAĞLI EL NOTU',
  };

  if (relation && relation.trim()) {
    return `${typeLabels[targetType] || 'BAĞLI'} (${relation})`;
  }
  return typeLabels[targetType] || 'BAĞLI KAYIT';
}
