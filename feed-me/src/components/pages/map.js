import React, { useState } from "react";
import Axios from 'axios'
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { formatRelative } from "date-fns";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";

import "@reach/combobox/styles.css";

import mapStyle from "./mapStyle";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "100vh"
};
const center = {
  lat: 39.766705,
  lng: 30.525631,
};
const options = {
  styles: mapStyle,
  disableDefaultUI: true,
  zoomControl: true,
};

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [image, setImage] = React.useState({ preview: "", raw: "" });

  const [markerReview, setPrevMarkers] = useState([]);
  const [infoWindowReview, setPrevInfoWindow] = useState(null); //test

  const submitLatLng = (event) => {
    Axios.post("http://localhost:3001/api/insert", {
      drop_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    }).then(() => {
      alert('success insert');
    })
  }

  const handleChange = e => {
    if (e.target.files.length) {
      setImage({
        preview: URL.createObjectURL(e.target.files[0]),
        raw: e.target.files[0]
      });
    }
  };

  const onMapClick = React.useCallback((event) => {
    submitLatLng(event);
    setMarkers((current) => [
      ...current,
      {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        time: new Date(),

      },
    ]);
  }, []);
  const google = window.google
  const mapRef = React.useRef();
  const mapLoadCall = React.useCallback((map) => {
    Axios.get("http://localhost:3001/api/get").then((response) => {
      for (var i = 0; i < response.data.length; i++) {
        setPrevMarkers((current) => [
          ...current,
          {
            lat: response.data[i].lat,
            lng: response.data[i].lng,
            time: response.data[i].drop_time,
          },
        ]);
      }
    })
    mapRef.current = map;
  }, []);

  const panTo = React.useCallback(({ lat, lng, zoom }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(zoom);
  }, []);

  if (loadError) return "Error loading map";
  if (!isLoaded) return "Loading map";

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={mapLoadCall}
      >
        <Search panTo={panTo} />
        <Locate panTo={panTo} />


        {markerReview.map((marker) => (
          <Marker key={marker.time}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={{
              url: '/test-food.png',
              scaledSize: new window.google.maps.Size(50, 50),
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(25, 25),
            }}
            onClick={() => {
              setPrevInfoWindow(marker);
            }}
          />
        ))}
        {infoWindowReview ? (
          <InfoWindow position={{ lat: infoWindowReview.lat, lng: infoWindowReview.lng }}
            onCloseClick={() => {
              setPrevInfoWindow(null);
            }}
          >
            <div>
              <h2>Food is there</h2>
              <p>Dropped at {infoWindowReview.time, new Date().toISOString().slice(0, 19).replace('T', ' ')}</p>
            </div>
          </InfoWindow>
        ) : null}

        {markers.map((marker) => (
          <Marker key={marker.time.toISOString()}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={{
              url: '/test-food.png',
              scaledSize: new window.google.maps.Size(50, 50),
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(25, 25),
            }}
            onClick={() => {
              setSelected(marker);
            }}
          />
        ))}

        {selected ? (
          <InfoWindow position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <h2>Food is there</h2>
              <p>Dropped at {formatRelative(selected.time, new Date())}</p>
              <label htmlFor="upload-button">
                {image.preview ? (
                  <img src={image.preview} alt="dummy" width="100" height="100" />
                ) : (
                  <>
                    <h5>Upload your photo</h5>
                  </>
                )}
              </label>
              <input
                type="file"
                id="upload-button"
                style={{ display: "none" }}
                onChange={handleChange}
              />
              <br />
            </div>
          </InfoWindow>
        ) : null}

      </GoogleMap>
    </div>
  );
}

function Locate({ panTo }) {
  return (
    <button className="myLocation" onClick={() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          panTo({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            zoom: 25,
          });
        },
        () => null
      );
    }}
    >
      <img src="userLocation.png" alt="user location" />
    </button>
  )
}

function Search({ panTo }) {
  const { ready, value, suggestions: { status, data }, setValue, clearSuggestions, } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 39.766705, lng: () => 30.525631, },
      radius: 200 * 1000,
    },
  });

  return (
    <div className="search">
      <Combobox
        onSelect={async (address) => {
          try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            const zoom = 17;
            panTo({ lat, lng, zoom });
          } catch (error) {
            console.log("error");
          }
        }}
      >
        <ComboboxInput
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          disabled={!ready}
          placeholder="Find an adress"
        />

        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" && data.map(({ id, description }) => (
              <ComboboxOption key={id} value={description} />
            ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}
