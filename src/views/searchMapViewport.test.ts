import { describe, expect, it } from 'vitest'

import {
  locationHintBounds,
  locationHintCenter,
  propertyCoordinateCenter,
  worldCenter,
} from './searchMapViewport'

describe('search map viewport helpers', () => {
  it('uses geocoded location hints before property coordinates arrive', () => {
    const locationHint = {
      query: 'Berlin, Germany',
      provider: 'photon',
      center: { lat: 52.52, lng: 13.405 },
      bbox: {
        south: 52.3383,
        west: 13.0883,
        north: 52.6755,
        east: 13.7611,
      },
    }

    expect(locationHintCenter(locationHint)).toEqual([13.405, 52.52])
    expect(locationHintBounds(locationHint)).toEqual([
      [13.0883, 52.3383],
      [13.7611, 52.6755],
    ])
  })

  it('rejects invalid location hint bounds and centers', () => {
    expect(locationHintCenter({ center: { lat: 120, lng: 13 } })).toBeNull()
    expect(
      locationHintBounds({
        bbox: { south: 53, west: 13, north: 52, east: 14 },
      }),
    ).toBeNull()
  })

  it('falls back to world center when no coordinates exist', () => {
    expect(propertyCoordinateCenter([])).toBeNull()
    expect(worldCenter).toEqual([0, 20])
  })

  it('centers on average property coordinates once results arrive', () => {
    expect(
      propertyCoordinateCenter([
        {
          id: 'a',
          provider: 'airbnb',
          sourceUrl: 'https://example.com/a',
          title: 'A',
          description: '',
          attributes: [],
          questionScores: [],
          coordinates: { lat: 50, lng: 10 },
        },
        {
          id: 'b',
          provider: 'booking',
          sourceUrl: 'https://example.com/b',
          title: 'B',
          description: '',
          attributes: [],
          questionScores: [],
          coordinates: { lat: 54, lng: 14 },
        },
      ]),
    ).toEqual([12, 52])
  })
})
