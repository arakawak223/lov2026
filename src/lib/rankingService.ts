import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export interface RankingEntry {
  id?: string
  playerName: string
  stageId: string
  stageName: string
  score: number
  distanceError: number
  country: string
  prefecture: string | null
  createdAt?: unknown
}

const COLLECTION_NAME = 'rankings'
const DEFAULT_LIMIT = 50

export async function submitScore(entry: Omit<RankingEntry, 'id' | 'createdAt'>): Promise<void> {
  if (!db) return
  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      ...entry,
      createdAt: serverTimestamp(),
    })
  } catch (e) {
    console.warn('Failed to submit score:', e)
  }
}

export async function fetchWorldRankings(): Promise<RankingEntry[]> {
  if (!db) return []
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('score', 'desc'),
      limit(DEFAULT_LIMIT)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RankingEntry))
  } catch (e) {
    console.warn('Failed to fetch world rankings:', e)
    return []
  }
}

export async function fetchJapanRankings(): Promise<RankingEntry[]> {
  if (!db) return []
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('country', '==', '日本'),
      orderBy('score', 'desc'),
      limit(DEFAULT_LIMIT)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RankingEntry))
  } catch (e) {
    console.warn('Failed to fetch Japan rankings:', e)
    return []
  }
}

export async function fetchPrefectureRankings(prefecture: string): Promise<RankingEntry[]> {
  if (!db) return []
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('prefecture', '==', prefecture),
      orderBy('score', 'desc'),
      limit(DEFAULT_LIMIT)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RankingEntry))
  } catch (e) {
    console.warn('Failed to fetch prefecture rankings:', e)
    return []
  }
}
