export interface ArrivalData {
  // Passport Extracted
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  gender: string;
  dateOfBirth: string;
  expiryDate: string;

  // Manual Info
  flightNumber: string;
  arrivalDate: string;
  entryPort: string;
  accommodationType: string;
  accommodationName: string;
  addressInThailand: string;
  email: string;
  phone: string;
  purposeOfVisit: string;
}

export const initialArrivalData: ArrivalData = {
  firstName: "",
  lastName: "",
  passportNumber: "",
  nationality: "",
  gender: "",
  dateOfBirth: "",
  expiryDate: "",
  flightNumber: "",
  arrivalDate: "",
  entryPort: "",
  accommodationType: "",
  accommodationName: "Alameda Suites Co.,Ltd.",
  addressInThailand: "27/5 Kaoom Rd. Pomprab Bangkok 10100 Thailand",
  email: "",
  phone: "",
  purposeOfVisit: "Tourism",
};
