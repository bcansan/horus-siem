export type HealthResponse = { status: string }
export type SearchHit = { _source?: Record<string, any> }
export type SearchResponse = { hits?: { hits: SearchHit[] } }


