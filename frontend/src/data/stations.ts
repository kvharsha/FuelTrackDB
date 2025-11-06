export interface Station {
  station_id: number;
  name: string;
  address: string;
  city: string;
  latitude: string | null;
  longitude: string | null;
  status: string;
}

// A sample list of CNG stations (Bangalore area). You can extend this or replace
// with backend-provided data later. Coordinates approximate.
const stations: Station[] = [
  { station_id: 101, name: "Bangalore CNG - Koramangala", address: "6th Block, Koramangala", city: "Koramangala", latitude: "12.9340", longitude: "77.6116", status: "Operational" },
  { station_id: 102, name: "CNG Station - Jayanagar", address: "Jayanagar 4th T Block", city: "Jayanagar", latitude: "12.9279", longitude: "77.5837", status: "Operational" },
  { station_id: 103, name: "CNG Hub - Indiranagar", address: "80 Feet Rd, Indiranagar", city: "Indiranagar", latitude: "12.9718", longitude: "77.6412", status: "Operational" },
  { station_id: 104, name: "CNG Point - Whitefield", address: "Whitefield Main Rd", city: "Whitefield", latitude: "12.9699", longitude: "77.7499", status: "Operational" },
  { station_id: 105, name: "CNG Central - MG Road", address: "MG Road", city: "MG Road", latitude: "12.9753", longitude: "77.6051", status: "Operational" },
  { station_id: 106, name: "CNG Stop - Hebbal", address: "Near Hebbal Flyover", city: "Hebbal", latitude: "13.0389", longitude: "77.5970", status: "Operational" },
  { station_id: 107, name: "CNG Corner - Yelahanka", address: "Yelahanka New Town", city: "Yelahanka", latitude: "13.0845", longitude: "77.5895", status: "Operational" },
  { station_id: 108, name: "CNG Fast - J.P. Nagar", address: "J.P. Nagar 7th Phase", city: "J.P. Nagar", latitude: "12.9056", longitude: "77.5714", status: "Operational" },
  { station_id: 109, name: "CityGas CNG - Banashankari", address: "Banashankari Main", city: "Banashankari", latitude: "12.9250", longitude: "77.5580", status: "Operational" },
  { station_id: 110, name: "GreenFuel CNG - HSR Layout", address: "HSR Layout Sector 3", city: "HSR", latitude: "12.9131", longitude: "77.6401", status: "Operational" },
  { station_id: 111, name: "CNG Express - Electronic City", address: "Near Electronic City Phase 1", city: "Electronic City", latitude: "12.8431", longitude: "77.6611", status: "Operational" },
  { station_id: 112, name: "MetroGas CNG - Rajajinagar", address: "Rajajinagar Main", city: "Rajajinagar", latitude: "12.9963", longitude: "77.5586", status: "Operational" },
  { station_id: 113, name: "NorthCNG - Yeshwanthpur", address: "Near Yeshwanthpur Depot", city: "Yeshwanthpur", latitude: "13.0216", longitude: "77.5606", status: "Operational" },
  { station_id: 114, name: "SouthCNG - Basavanagudi", address: "Basavanagudi Market", city: "Basavanagudi", latitude: "12.9396", longitude: "77.5576", status: "Operational" },
  { station_id: 115, name: "EastCNG - K.R. Puram", address: "K R Puram Main", city: "K R Puram", latitude: "13.0285", longitude: "77.6709", status: "Operational" },
  { station_id: 116, name: "WestCNG - Rajarajeshwari Nagar", address: "Rajarajeshwari Nagar", city: "Rajarajeshwari Nagar", latitude: "12.9133", longitude: "77.5067", status: "Operational" },
  { station_id: 117, name: "Airport CNG - Yelahanka", address: "Near Airport Road", city: "Yelahanka", latitude: "13.0340", longitude: "77.5600", status: "Operational" },
  { station_id: 118, name: "CNG Plaza - Malleshwaram", address: "Malleshwaram 18th Cross", city: "Malleshwaram", latitude: "13.0129", longitude: "77.5712", status: "Operational" },
  { station_id: 119, name: "CNG Point - Kengeri", address: "Kengeri Satellite Town", city: "Kengeri", latitude: "12.8604", longitude: "77.4910", status: "Operational" },
  { station_id: 120, name: "CNG Station - Bellandur", address: "Bellandur Main Road", city: "Bellandur", latitude: "12.9290", longitude: "77.6786", status: "Operational" }
];

export default stations;
