import { describe, expect, it } from 'vitest'

import { markerBounds, markerViewportSignature } from './mapViewport'

describe('map viewport helpers', () => {
  it('returns null bounds without markers', () => {
    expect(markerBounds([])).toBeNull()
  })

  it('builds bounds around all markers', () => {
    expect(
      markerBounds([
        { id: 'a', lng: 13.4, lat: 52.5 },
        { id: 'b', lng: 13.8, lat: 52.2 },
        { id: 'c', lng: 13.1, lat: 52.7 },
      ]),
    ).toEqual([
      [13.1, 52.2],
      [13.8, 52.7],
    ])
  })

  it('uses stable signatures independent of marker order', () => {
    const left = markerViewportSignature([
      { id: 'b', lng: 13.8000001, lat: 52.2 },
      { id: 'a', lng: 13.4, lat: 52.5 },
    ])
    const right = markerViewportSignature([
      { id: 'a', lng: 13.4, lat: 52.5 },
      { id: 'b', lng: 13.8000002, lat: 52.2 },
    ])

    expect(left).toBe(right)
  })
})
