import React, { useState, useEffect, useRef } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

const GEOAPI_KEY = "996dadcc493545e3ab996c06dd29254e";

/**
 * GeoApiAutocomplete
 * Props:
 *  - value: string
 *  - onChange: (place: { formatted: string, lat: number, lon: number, properties }) => void
 *  - label, placeholder
 *  - limit (number)
 *  - debounceMs (number)
 *  - countryCodes (string) e.g. "us,gb" (optional)
 *
 * Example:
 *  <GeoApiAutocomplete value={formData.address} onChange={(place)=>setFormData({...formData, address: place.formatted})} />
 */
export default function GeoApiAutocomplete({
  value = '',
  onChange = () => {},
  label = 'Address',
  placeholder = 'Start typing address...',
  limit = 6,
  debounceMs = 300,
  countryCodes = '',
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    if (!GEOAPI_KEY) {
      console.warn('GeoApiAutocomplete: missing REACT_APP_GEOAPIFY_API_KEY in .env');
      setOptions([]);
      return;
    }

    if (!inputValue || inputValue.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const q = encodeURIComponent(inputValue);
        const countryParam = countryCodes ? `&countrycodes=${encodeURIComponent(countryCodes)}` : '';
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${q}&limit=${limit}${countryParam}&apiKey=${GEOAPI_KEY}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('Geoapify fetch failed: ' + res.status);
        const json = await res.json();
        const results = (json.features || []).map((f) => {
          return {
            id: f.properties?.place_id || f.properties?.osm_id || f.properties?.id || f.id,
            formatted: f.properties?.formatted || f.properties?.name || '',
            lat: f.properties?.lat || (f.geometry?.coordinates && f.geometry.coordinates[1]),
            lon: f.properties?.lon || (f.geometry?.coordinates && f.geometry.coordinates[0]),
            properties: f.properties || {},
          };
        });
        setOptions(results);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('GeoApiAutocomplete error', err);
          setOptions([]);
        }
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [inputValue, limit, debounceMs, countryCodes]);

  return (
    <Autocomplete
      freeSolo
      filterOptions={(x) => x} // no local filtering; rely on remote results
      options={options}
      getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.formatted || '')}
      value={options.find((o) => o.formatted === inputValue) || null}
      onChange={(event, newValue) => {
        if (!newValue) {
          // cleared
          setInputValue('');
          onChange('');
          return;
        }
        // newValue can be string (free text) or an object from options
        if (typeof newValue === 'string') {
          setInputValue(newValue);
          onChange({ formatted: newValue });
        } else {
          setInputValue(newValue.formatted);
          onChange(newValue);
        }
      }}
      inputValue={inputValue}
      onInputChange={(event, newInput) => {
        setInputValue(newInput);
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          required
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
            autoComplete: 'street-address',
          }}
        />
      )}
    />
  );
}