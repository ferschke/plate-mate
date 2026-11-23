import React, { useMemo, useState } from 'react';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import statesAtlas from 'us-atlas/states-10m.json';
import { Check, Plus } from 'lucide-react';
import { STATE_BY_CODE, STATE_BY_FIPS, US_STATES } from '../data/states';
import type { SpottedRecord, StateInfo, USRegion } from '../types';
import { LicensePlate } from './LicensePlate';

interface USMapProps {
  states: Record<string, SpottedRecord>;
  onToggleState: (code: string) => void;
}

const SMALL_NORTHEAST_CODES = ['VT', 'NH', 'MA', 'RI', 'CT', 'NJ', 'DE', 'MD'];
const REGIONS: USRegion[] = ['West', 'Midwest', 'South', 'Northeast'];

// Slight manual centroid nudges for cleaner label placement on irregular state shapes
const LABEL_OFFSETS: Record<string, [number, number]> = {
  FL: [12, 8],
  LA: [-6, 6],
  MI: [10, 14],
  CA: [-6, 8],
  ID: [0, 12],
  AK: [4, -4],
  HI: [-8, 12],
  VA: [6, 4],
  KY: [4, 4],
  WV: [-4, 4],
  NY: [4, 2],
};

interface MapFeature {
  fips: string;
  state: StateInfo;
  d: string;
  centroid: [number, number];
}

export const USMap: React.FC<USMapProps> = ({ states, onToggleState }) => {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const mapFeatures = useMemo<MapFeature[]>(() => {
    const topology = statesAtlas as unknown as Topology<{
      states: GeometryCollection;
    }>;
    const geojson = feature(topology, topology.objects.states);
    const projection = geoAlbersUsa().fitSize([940, 580], geojson);
    const pathGen = geoPath(projection);

    const list: MapFeature[] = [];
    for (const feat of geojson.features) {
      const fips = String(feat.id ?? '').padStart(2, '0');
      const stateInfo = STATE_BY_FIPS[fips];
      if (!stateInfo) continue; // skip DC / territories so we show exactly 50 states
      const d = pathGen(feat);
      if (!d) continue;
      const rawCentroid = pathGen.centroid(feat);
      const offset = LABEL_OFFSETS[stateInfo.code] ?? [0, 0];
      const centroid: [number, number] = [
        Number.isFinite(rawCentroid[0]) ? rawCentroid[0] + offset[0] : 0,
        Number.isFinite(rawCentroid[1]) ? rawCentroid[1] + offset[1] : 0,
      ];
      list.push({ fips, state: stateInfo, d, centroid });
    }
    return list;
  }, []);

  const regionStats = useMemo(() => {
    return REGIONS.map((region) => {
      const inRegion = US_STATES.filter((s) => s.region === region);
      const seen = inRegion.filter((s) => states[s.code]?.seen).length;
      return { region, seen, total: inRegion.length };
    });
  }, [states]);

  const selectedState = selectedCode ? STATE_BY_CODE[selectedCode] : null;
  const selectedRecord = selectedCode ? states[selectedCode] : undefined;
  const selectedSeen = Boolean(selectedRecord?.seen);

  const handleStateTap = (code: string) => {
    setSelectedCode(code);
    onToggleState(code);
  };

  return (
    <div className="map-view">
      <div className="map-card">
        <div className="map-card-header">
          <div>
            <h2 className="section-title">United States Map</h2>
            <p className="section-subtitle">Tap any state to toggle spotted or unseen</p>
          </div>
          <div className="map-legend">
            <span className="legend-item">
              <span className="legend-swatch swatch-seen" />
              Spotted
            </span>
            <span className="legend-item">
              <span className="legend-swatch swatch-unseen" />
              Unseen
            </span>
          </div>
        </div>

        <div className="map-svg-wrapper">
          <svg
            viewBox="0 0 960 590"
            className="us-map-svg"
            role="img"
            aria-label="Interactive map of all 50 US states showing spotted license plates"
          >
            <g>
              {mapFeatures.map(({ state, d }) => {
                const isSeen = Boolean(states[state.code]?.seen);
                const isSelected = selectedCode === state.code;
                return (
                  <path
                    key={state.code}
                    d={d}
                    className={`map-state-path ${isSeen ? 'is-seen' : ''} ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleStateTap(state.code)}
                  >
                    <title>
                      {state.name} — {isSeen ? 'Spotted (tap to unmark)' : 'Unseen (tap to mark spotted)'}
                    </title>
                  </path>
                );
              })}
            </g>

            {/* State 2-letter labels for non-tiny states */}
            <g pointerEvents="none">
              {mapFeatures.map(({ state, centroid }) => {
                if (SMALL_NORTHEAST_CODES.includes(state.code)) return null;
                const isSeen = Boolean(states[state.code]?.seen);
                return (
                  <text
                    key={`lbl-${state.code}`}
                    x={centroid[0]}
                    y={centroid[1]}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={`map-state-label ${isSeen ? 'is-seen' : ''}`}
                  >
                    {state.code}
                  </text>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Easy-tap pills for small Northeast states on mobile */}
        <div className="small-states-bar" aria-label="Northeast states quick access">
          <span className="small-states-label">East Coast quick-tap:</span>
          <div className="small-states-chips">
            {SMALL_NORTHEAST_CODES.map((code) => {
              const st = STATE_BY_CODE[code];
              const isSeen = Boolean(states[code]?.seen);
              const isSelected = selectedCode === code;
              return (
                <button
                  key={code}
                  type="button"
                  className={`mini-state-chip ${isSeen ? 'is-seen' : ''} ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleStateTap(code)}
                  title={`${st.name} — ${isSeen ? 'Spotted (tap to unmark)' : 'Unseen (tap to mark spotted)'}`}
                >
                  {code}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected State Quick Inspector */}
      {selectedState && (
        <div className="map-inspector-card">
          <div className="map-inspector-plate">
            <LicensePlate state={selectedState} seen={selectedSeen} />
          </div>
          <div className="map-inspector-info">
            <div className="map-inspector-top">
              <div>
                <h3 className="map-inspector-title">
                  {selectedState.name} <span className="state-code-tag">{selectedState.code}</span>
                </h3>
                <p className="map-inspector-meta">
                  {selectedState.region} · “{selectedState.slogan}”
                </p>
              </div>
            </div>
            {selectedSeen && selectedRecord?.spottedBy && (
              <p className="spotted-by-note">
                Spotted by <strong>{selectedRecord.spottedBy}</strong>
              </p>
            )}
            <div className="map-inspector-actions">
              <button
                type="button"
                id={`map-toggle-${selectedState.code}`}
                className={`btn ${selectedSeen ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => onToggleState(selectedState.code)}
              >
                {selectedSeen ? (
                  <>
                    <Check size={16} /> Spotted — Tap to Unmark
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Mark {selectedState.name} Spotted
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regional Progress Breakdown */}
      <div className="regions-grid">
        {regionStats.map(({ region, seen, total }) => {
          const pct = Math.round((seen / total) * 100);
          return (
            <div key={region} className="region-card">
              <div className="region-card-top">
                <span className="region-name">{region}</span>
                <span className="region-count">
                  {seen}/{total}
                </span>
              </div>
              <div className="progress-track progress-track-sm">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
