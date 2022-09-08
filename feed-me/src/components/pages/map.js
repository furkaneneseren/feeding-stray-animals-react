import React, { useState, useEffect } from "react";
import Axios from 'axios'
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  HeatmapLayer
} from "@react-google-maps/api";
import { formatRelative, isToday } from "date-fns";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

import { Storage, db } from "../../firebase";

import { collection, addDoc, onSnapshot, query, getDocs } from "firebase/firestore";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import moment from 'moment';

import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";

import "@reach/combobox/styles.css";

import mapStyle from "./mapStyle";

const libraries = ["places", 'visualization'];
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
const optionsHeatMap = {
  radius: 60,
  opacity: 0.6,
  dissipating: true

};

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [image, setImage] = React.useState({ preview: "", raw: "" });
  const [water, setWater] = useState("");
  const [food, setFood] = useState("");
  const [file, setFile] = useState(null);


  const [markerReview, setPrevMarkers] = useState([]);
  const [heatMapTest, setheatMapTest] = useState([]);
  const [infoWindowReview, setPrevInfoWindow] = useState(null);

  const submitLatLng = (event) => {
    Axios.post("http://localhost:3001/api/insert", {
      drop_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
      lat: event.lat,
      lng: event.lng,
      image: event.image
    }).then(() => {
      alert('success insert');
    })
  }

  const useStorage = (file) => {
    const [url, setUrl] = useState(null);
    const [percentage, setPercentage] = useState(0);
    useEffect(() => {
      console.log("usestorage");
      console.log(file);
      const storageRef = ref(Storage, file.name);
      const uploadFile = uploadBytesResumable(storageRef, file);
      uploadFile.on('state_changed', (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setPercentage(progress);
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      },
        (error) => {
          console.log("upload is unsuccesfull");
        }, async () => {
          await getDownloadURL(uploadFile.snapshot.ref).then((downloadURL) => {
            console.log(downloadURL);
            setUrl(downloadURL);
          });
        });
      // storageRef.put(file).on('state_changed', async () => {
      //   const url = await storageRef.getDownloadURL();
      //   setUrl(url);
      // });
    }, [file]);

    return { url, percentage };

  }

  const useFirestore = (coll) => {
    const [docs, setDocs] = useState([]);
    useEffect(() => {
      console.log("firestore effect")
      console.log(docs);
      // const q = query(collection(db, collection));
      const unsub = onSnapshot(collection(db, coll), (snap) => {
        console.log("snaphsot");
        let documents = [];
        snap.forEach((doc) => {
          documents.push({ ...doc.data(), id: doc.id }); //set dependency
        });
        setDocs(documents);
      }, (error) => {
        console.log("firestore error");
      });
      return () => unsub();
      // this is a cleanup function that react will run when
      // a component using the hook unmounts
    }, [coll]);

    return { docs };
  }

  const ReceiveMarkers = () => {
    const { docs } = useFirestore('markers');
    if (docs.length) {
      console.log(docs);
      docs.map((doc) => {
        if ((moment().diff(doc.drop_time.toDate(), 'days')) > 10) {
          doc.icon = '/food_expired.png';
        } else {
          doc.icon = '/test-food.png';
        }
      })
    }

    return (
      <div>
        {
          docs && docs.map(doc => (
            <Marker
              key={doc.id} // new added --------------
              position={{ lat: doc.latitude, lng: doc.longitude }}
              icon={{
                url: doc.icon,
                scaledSize: new window.google.maps.Size(50, 50),
                origin: new window.google.maps.Point(0, 0),
                anchor: new window.google.maps.Point(25, 25),
              }}
              onClick={() => {
                setPrevInfoWindow(doc);
              }}
            />
          ))
        }
      </div>
    )




  }

  const HeatMap = async () => {
    const querySnapshot = await getDocs(collection(db, "markers"));
    let docs = [];
    var ht;
    let heats = [];
    querySnapshot.forEach((doc) => {
      docs.push({ ...doc.data(), id: doc.id });
    });

    docs.forEach((heat) => {
      ht = new google.maps.LatLng(heat.latitude, heat.longitude);
      heats.push(ht);
    })

    setheatMapTest(heats);

    return null;



  }

  const ProgressBar = ({ file, setFile }) => {
    const { url, percentage } = useStorage(file) || {};
    console.log(percentage, url);
    useEffect(() => {
      console.log("progressbar");
      if (url) {
        selected.markerImage = url;
        setFile(null);
      }
    }, [url, setFile]);

    return (
      <div className="progress-bar" style={{ width: percentage + '%' }} //maybe progress bar
      >Uploading image</div>
    );
  }

  const handleChange = e => {
    if (e.target.files.length) {
      setImage({
        preview: URL.createObjectURL(e.target.files[0]),
        raw: e.target.files[0]
      });
    }
    selected.image = URL.createObjectURL(e.target.files[0]);
    //submitLatLng(selected);
  };


  const handleChange2 = (e) => {
    let selectedFile = e.target.files[0];

    if (selectedFile) {
      console.log(selectedFile);
      setFile(selectedFile);
    } else {
      setFile(null);
    }

  };

  const getFormData = async (e) => {
    selected.food_type = food;
    selected.isWater = water;
    console.log(selected.markerImage);
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "markers"), {
        latitude: selected.lat,
        longitude: selected.lng,
        drop_time: selected.time,
        food_type: selected.food_type,
        isWater: selected.isWater,
        icon: '/test-food.png',
        image: selected.markerImage
      });
      console.log("Document written with ID: ", docRef.id);
      setSelected(null);
    } catch (b) {
      console.error("Error adding document: ", b);
    }

  }

  const onMapClick = React.useCallback((event) => {
    //submitLatLng(event);
    setMarkers((current) => [
      ...current,
      {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        time: new Date(),
        markerImage: null,
        food_type: null,
        isWater: null,
        icon: null,
        id: null
      },
    ]);
  }, []);
  const google = window.google
  const mapRef = React.useRef();
  const mapLoadCall = React.useCallback((map) => {
    // Axios.get("http://localhost:3001/api/get").then((response) => { ----It's node-mysql code before the firebase integration.
    //   for (var i = 0; i < response.data.length; i++) {
    //     setPrevMarkers((current) => [
    //       ...current,
    //       {
    //         lat: response.data[i].lat,
    //         lng: response.data[i].lng,
    //         time: response.data[i].drop_time,
    //         image: response.data[i].image
    //       },
    //     ]);
    //   }
    // })
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
        {/* <SetStoredMarkers /> */}
        <ReceiveMarkers />

        <button className="heatMap" onClick={HeatMap}
        >
          <img src="heatmap.png" alt="heat map" width="90" height="90" />
        </button>



        {markerReview.map((marker) => (
          <Marker
            position={{ lat: marker.latitude, lng: marker.longitude }}
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

        {heatMapTest ? (
          <HeatmapLayer
            options={optionsHeatMap}
            data={heatMapTest}
          />
        ) : null}




        {infoWindowReview ? (
          <InfoWindow position={{ lat: infoWindowReview.latitude, lng: infoWindowReview.longitude }}
            onCloseClick={() => {
              setPrevInfoWindow(null);
            }}
          >
            <div>
              <h2>Food is there</h2>
              <br />
              <p>Feeded with {infoWindowReview.food_type}.</p>
              <p>Water status: {infoWindowReview.isWater}</p>
              <p>Dropped at {moment(infoWindowReview.drop_time.toDate()).startOf('day').fromNow()}</p> {/*find a format to display time*/}
              <br />
              <label>
                {infoWindowReview.image ? (
                  <img src={infoWindowReview.image} alt="dummy" width="100" height="100" />
                ) : (
                  <>
                    <h5>No image</h5>
                  </>
                )}
              </label>
            </div>
          </InfoWindow>
        ) : null}

        {markers.map((marker) => (
          <Marker key={`${marker.lat}-${marker.lng}`}
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
              <h2>Food is dropping</h2>
              <p>Dropping at {formatRelative(selected.time, new Date())}</p> <br></br>
              <form onSubmit={getFormData}>
                <select onChange={(e) => setFood(e.target.value)}>
                  <option value="" disabled selected hidden>Select food type</option>
                  <option>Dog food</option>
                  <option>Cat food</option>
                  <option>Home cooking</option>
                </select> <br /><br />
                <select onChange={(e) => setWater(e.target.value)}>
                  <option value="" disabled selected hidden>Did you give water?</option>
                  <option>Yes</option>
                  <option>No</option>
                </select> <br /><br />
                <label htmlFor="upload-button">
                  {selected.markerImage ? (
                    <img src={selected.markerImage} alt="dummy" width="100" height="100" />
                  ) : (
                    <>
                      <h3>Upload your photo</h3>
                    </>
                  )}
                </label>
                <input
                  type="file"
                  id="upload-button"
                  style={{ display: "none" }}
                  onChange={handleChange}
                />
                <br /><br />
                <label>
                  <input type="file" onChange={handleChange2} />
                </label>
                {file && <ProgressBar file={file} setFile={setFile} />}
                <br /> <br />
                <button type="submit">Submit</button>



              </form>
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
            zoom: 20,
          });
        },
        () => null
      );
    }}
    >
      <img src="userLocation.png" alt="user location" width="90" height="90" />
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
          setValue(address, false);
          clearSuggestions();
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
