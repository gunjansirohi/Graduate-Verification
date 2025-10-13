import mongoose from "mongoose";
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ethiopiaAdminHierarchy = {
  // Region: { Zones: { Woredas: [Cities] } }
  "Oromia": {
    "East Shewa": {
      "Ada'a": ["Bishoftu", "Debre Zeit"],
      "Lume": ["Adama", "Nazret"]
    },
    "West Shewa": {
      "Ambo": ["Ambo"],
      "Ginde Beret": ["Ginde Beret"]
    }
  },
  "Amhara": {
    "North Gondar": {
      "Gondar Zuria": ["Gondar"],
      "Debre Tabor": ["Debre Tabor"]
    },
    "South Wollo": {
      "Dessie Zuria": ["Dessie"],
      "Kombolcha": ["Kombolcha"]
    }
  },
  "Tigray": {
    "Central": {
      "Mekelle": ["Mekelle"],
      "Adwa": ["Adwa"]
    },
    "Eastern": {
      "Wukro": ["Wukro"],
      "Atsbi": ["Atsbi"]
    }
  },
  "Southern Nations": {
    "Gurage": {
      "Cheha": ["Wolkite"],
      "Ezha": ["Ezha"]
    },
    "Sidama": {
      "Hawassa Zuria": ["Hawassa"],
      "Dale": ["Dale"]
    }
  },
  "South West": {
    "Bench Sheko": {
      "Bench": ["Mizan Teferi"],
      "Sheko": ["Sheko"]
    },
    "Kaffa": {
      "GLA": ["GLA"],
      "Gimbo": ["Gimbo"]
    }
  },
  "Addis Ababa": {
    "Sub-Cities": {
      "Kirkos": ["Kirkos"],
      "Bole": ["Bole"]
    }
  }
};

// Store the current hierarchy to maintain consistency
let currentHierarchy = null;

// Helper function to get consistent random hierarchy
const getConsistentHierarchy = () => {
  if (!currentHierarchy) {
    const regions = Object.keys(ethiopiaAdminHierarchy);
    const randomRegion = getRandom(regions);
    const regionData = ethiopiaAdminHierarchy[randomRegion];
    
    const zones = Object.keys(regionData);
    const randomZone = getRandom(zones);
    const zoneData = regionData[randomZone];
    
    const woredas = Object.keys(zoneData);
    const randomWoreda = getRandom(woredas);
    const cities = zoneData[randomWoreda];
    const randomCity = getRandom(cities);

    currentHierarchy = {
      region: randomRegion,
      zone: randomZone,
      woreda: randomWoreda,
      city: randomCity,
      kebele: `${Math.floor(Math.random() * 10) + 1}`.padStart(2, '0')
    };
  }
  return currentHierarchy;
};

const nationalIDSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { 
    type: String, 
    required: true,
    enum: ['male', 'female'],
    lowercase: true
  },
  nationalIdNumber: { type: Number, unique: true, required: true, min: 1 },
  dateOfBirth: {
    type: String,
    required: true,
    default: Date.now() - 22 * 365 * 24 * 60 * 60 * 1000,
  },
  phone_no: { type: String, required: true, default: "+251954233154" },
  country: { type: String, required: true, default: "Ethiopia" },
  region: {
    type: String,
    required: true,
    default: function() {
      const hierarchy = getConsistentHierarchy();
      return hierarchy.region;
    }
  },
  zone: {
    type: String,
    required: true,
    default: function() {
      const hierarchy = getConsistentHierarchy();
      return hierarchy.zone;
    }
  },
  woreda: {
    type: String,
    required: true,
    default: function() {
      const hierarchy = getConsistentHierarchy();
      return hierarchy.woreda;
    }
  },
  city: {
    type: String,
    required: true,
    default: function() {
      const hierarchy = getConsistentHierarchy();
      return hierarchy.city;
    }
  },
  kebele: {
    type: String,
    required: true,
    default: function() {
      const hierarchy = getConsistentHierarchy();
      return hierarchy.kebele;
    }
  },
  photo: {
    type: String,
    default: function() {
      const id = Math.floor(Math.random() * 100);
      return `https://randomuser.me/api/portraits/${this.gender === 'male' ? 'men' : 'women'}/${id}.jpg`;
    }
  },
  createdAt: { type: Date, default: Date.now },
});

// Reset hierarchy before each new document creation
nationalIDSchema.pre('save', function(next) {
  currentHierarchy = null;
  next();
});

const NationalID = mongoose.model("NationalID", nationalIDSchema);
export default NationalID;